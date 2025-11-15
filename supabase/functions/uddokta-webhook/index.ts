import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    let webhookData;
    try {
      webhookData = await req.json();
    } catch (parseError) {
      console.error('Error parsing webhook data:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook data format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    console.log('Received webhook from Uddokta Pay:', webhookData);

    // Validate webhook data
    if (!webhookData.invoice_id || !webhookData.status) {
      console.error('Invalid webhook data received:', webhookData);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook data' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Supabase URL present:', !!Deno.env.get('SUPABASE_URL'));
    console.log('Supabase Service Role Key present:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    const { invoice_id, status, metadata } = webhookData;
    const orderId = metadata?.order_id;

    if (!orderId) {
      console.error('Order ID not found in webhook data:', webhookData);
      return new Response(
        JSON.stringify({ error: 'Order ID not found in webhook data' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Update payment status
    const paymentStatus = status === 'COMPLETED' ? 'completed' : 'failed';
    
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: paymentStatus,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      })
      .eq('order_id', orderId);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Check if this is a wallet top-up
    if (orderId.startsWith('wallet_topup_')) {
      // Handle wallet top-up
      if (status === 'COMPLETED') {
        // Extract user ID from order ID
        const parts = orderId.split('_');
        if (parts.length >= 3) {
          const userId = parts[2];
          
          // Add money to user's wallet
          const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('balance')
            .eq('id', userId)
            .single();

          if (!profileError && profile) {
            const currentBalance = profile.balance || 0;
            const amountToAdd = webhookData.amount || 0;
            const newBalance = currentBalance + amountToAdd;

            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({ balance: newBalance })
              .eq('id', userId);

            if (updateError) {
              console.error('Error updating wallet balance:', updateError);
            } else {
              console.log(`Added ৳${amountToAdd} to user ${userId}'s wallet. New balance: ৳${newBalance}`);
            }
          }
        }
      }
      
      // For wallet top-ups, we're done
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update order status (for product orders)
    const orderStatus = status === 'COMPLETED' ? 'completed' : 'failed';
    
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({
        status: orderStatus,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order status' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // If payment completed, assign voucher code
    if (status === 'COMPLETED') {
      // Get order details
      const { data: order, error: fetchError } = await supabaseClient
        .from('orders')
        .select('product_variant_id, quantity, user_id')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch order details' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      // Get available voucher codes
      const { data: vouchers, error: voucherError } = await supabaseClient
        .from('voucher_codes')
        .select('id')
        .eq('product_variant_id', order.product_variant_id)
        .eq('status', 'available')
        .limit(order.quantity);

      if (voucherError) {
        console.error('Error fetching vouchers:', voucherError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch voucher codes' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      if (!vouchers || vouchers.length < order.quantity) {
        console.error('Not enough voucher codes available');
        // Update order to show insufficient stock
        await supabaseClient
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', orderId);
        
        return new Response(
          JSON.stringify({ error: 'Insufficient voucher codes available' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      } else {
        // Assign voucher codes to order
        const voucherIds = vouchers.map(v => v.id);
        
        const { error: assignError } = await supabaseClient
          .from('voucher_codes')
          .update({
            order_id: orderId,
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          })
          .in('id', voucherIds);

        if (assignError) {
          console.error('Error assigning vouchers:', assignError);
          return new Response(
            JSON.stringify({ error: 'Failed to assign voucher codes' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Decrement variant stock using RPC function
        const { error: stockError } = await supabaseClient.rpc('decrement_stock', {
          variant_id: order.product_variant_id,
          quantity: order.quantity
        });

        if (stockError) {
          console.error('Error updating stock:', stockError);
        }

        console.log(`Assigned ${voucherIds.length} voucher codes to order ${orderId}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in uddokta-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: (error as Error).message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
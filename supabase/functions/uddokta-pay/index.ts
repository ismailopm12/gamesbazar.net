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

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST method.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      );
    }

    const { orderId, amount, customerEmail, customerName, customerPhone } = await req.json();

    // Validate required fields
    if (!orderId || !amount || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: orderId, amount, customerEmail, customerName' }),
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

    // Get Uddokta Pay credentials from secrets
    const UDDOKTA_API_KEY = Deno.env.get('UDDOKTA_API_KEY');
    const UDDOKTA_API_URL = Deno.env.get('UDDOKTA_API_URL') || 'https://gamesbazarnet.paymently.io/api/checkout';
    
    console.log('UDDOKTA_API_KEY present:', !!UDDOKTA_API_KEY);
    console.log('UDDOKTA_API_URL:', UDDOKTA_API_URL);

    if (!UDDOKTA_API_KEY) {
      console.error('UDDOKTA_API_KEY not configured in Supabase secrets');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured properly' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Check if this is a wallet top-up (orderId starts with 'wallet_topup_')
    let userId = null;
    if (orderId.startsWith('wallet_topup_')) {
      // For wallet top-ups, extract user ID from the order ID
      const parts = orderId.split('_');
      if (parts.length >= 3) {
        userId = parts[2]; // The user ID is the third part
      }
    } else {
      // For product orders, get order details to retrieve user_id
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('Error fetching order:', orderError);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      userId = orderData.user_id;
    }

    // Validate that we have a user ID
    if (!userId) {
      console.error('Unable to determine user ID for order:', orderId);
      return new Response(
        JSON.stringify({ error: 'Unable to determine user for this payment' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create payment request to Uddokta Pay
    const paymentData = {
      full_name: customerName,
      email: customerEmail,
      amount: parseFloat(amount),
      metadata: {
        order_id: orderId,
      },
      redirect_url: `${req.headers.get('origin') || 'https://yourdomain.com'}/payment-success`,
      cancel_url: `${req.headers.get('origin') || 'https://yourdomain.com'}/payment-failed`,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/uddokta-webhook`,
    };

    console.log('Creating payment with Uddokta Pay:', paymentData);

    const response = await fetch(UDDOKTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTA_API_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      console.error('Uddokta Pay API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Payment gateway error: ${response.statusText} (${response.status})`,
          details: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error('Error parsing Uddokta Pay response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from payment gateway',
          details: (parseError as Error).message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    console.log('Uddokta Pay response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      data: responseData
    });

    // Handle Uddokta Pay API errors
    if (!response.ok) {
      console.error('Uddokta Pay API error:', {
        status: response.status,
        statusText: response.statusText,
        responseData
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Payment gateway error: ${responseData.message || response.statusText}`,
          details: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    // Check if required response fields exist
    // Handle different possible response formats from custom Uddokta Pay implementation
    const paymentUrl = responseData.payment_url || responseData.redirect_url || responseData.url;
    const invoiceId = responseData.invoice_id || responseData.id || responseData.transaction_id;
    
    if (!paymentUrl || !invoiceId) {
      console.error('Invalid response from Uddokta Pay:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from payment gateway',
          expected_fields: 'payment_url and invoice_id',
          received_data: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Create or update payment record in database
    // First, try to find existing payment record for this order
    const { data: existingPayment } = await supabaseClient
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existingPayment) {
      // Update existing payment record
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          transaction_id: responseData.invoice_id,
          payment_provider: 'uddokta_pay',
        })
        .eq('id', existingPayment.id);

      if (updateError) {
        console.error('Error updating payment record:', updateError);
      }
    } else {
      // Create new payment record
      const { error: insertError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: orderId,
          user_id: userId, // Add user_id to satisfy RLS policy
          amount: parseFloat(amount),
          payment_method: 'Uddokta Pay',
          payment_provider: 'uddokta_pay',
          transaction_id: responseData.invoice_id,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error creating payment record:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment record', details: insertError.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        payment_url: paymentUrl,
        invoice_id: invoiceId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in uddokta-pay function:', error);
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
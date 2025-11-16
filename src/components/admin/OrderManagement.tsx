import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface OrderWithDetails extends Tables<'orders'> {
  profiles: { email: string; full_name: string } | null;
  product_variants: { name: string; products: { name: string } } | null;
  payments: { transaction_id: string }[];
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles(email, full_name),
          product_variants(name, products(name)),
          payments(transaction_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: "pending" | "processing" | "completed" | "failed" | "refunded") => {
    try {
      // If status is completed, we need to handle voucher assignment
      if (status === "completed") {
        // Get the order with product variant info
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("product_variant_id, user_id")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;

        // Create completed payment record if it doesn't exist
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("id")
          .eq("order_id", orderId)
          .maybeSingle();

        if (!existingPayment) {
          await supabase
            .from("payments")
            .insert({
              order_id: orderId,
              user_id: order.user_id,
              amount: 0, // This should be updated with the actual amount
              payment_method: "admin_completed",
              payment_provider: "admin",
              status: "completed",
              completed_at: new Date().toISOString(),
            });
        }

        // Update payment status
        await supabase
          .from("payments")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString()
          })
          .eq("order_id", orderId);

        // Assign voucher code to user
        const { data: availableVouchers, error: voucherError } = await supabase
          .from("voucher_codes")
          .select("*")
          .eq("product_variant_id", order.product_variant_id)
          .eq("status", "available")
          .limit(1);

        if (voucherError) throw voucherError;

        if (availableVouchers && availableVouchers.length > 0) {
          // Assign voucher code to order
          await supabase
            .from("voucher_codes")
            .update({
              order_id: orderId,
              status: "delivered",
              delivered_at: new Date().toISOString(),
            })
            .eq("id", availableVouchers[0].id);

          // Decrement stock
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", order.product_variant_id)
            .single();

          if (variant && variant.stock_quantity > 0) {
            await supabase
              .from("product_variants")
              .update({ stock_quantity: variant.stock_quantity - 1 })
              .eq("id", order.product_variant_id);
          }
        }
      }
      
      // Regular status update
      const updateData: { 
        status?: "pending" | "processing" | "completed" | "failed" | "refunded"; 
        completed_at?: string 
      } = { status };
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({ title: "Order status updated successfully" });
      fetchOrders();
    } catch (error) {
      console.error("Order status update error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Order ID</TableHead>
                <TableHead className="whitespace-nowrap">Customer Info</TableHead>
                <TableHead className="whitespace-nowrap">Product</TableHead>
                <TableHead className="whitespace-nowrap">Player UID</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                <TableHead className="whitespace-nowrap">Transaction ID</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs max-w-[80px] truncate">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs max-w-[150px]">
                      <div className="font-semibold truncate">{order.customer_name || order.profiles?.full_name || "—"}</div>
                      <div className="text-muted-foreground truncate">{order.customer_phone || "—"}</div>
                      <div className="text-muted-foreground truncate">{order.customer_district || "—"}, {order.customer_country || "Bangladesh"}</div>
                      <div className="text-muted-foreground truncate">{order.profiles?.email || "—"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {order.product_variants?.products?.name} - {order.product_variants?.name}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">{order.player_uid}</TableCell>
                  <TableCell className="whitespace-nowrap">৳{order.total_amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{order.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[100px] truncate">
                    {order.payments?.[0]?.transaction_id || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value as "pending" | "processing" | "completed" | "failed" | "refunded")}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
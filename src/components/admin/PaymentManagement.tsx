import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  transaction_id: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
  orders: {
    player_uid: string;
    player_name: string | null;
    product_variants: {
      name: string;
      products: {
        name: string;
      };
    };
  };
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles (email, full_name),
          orders (
            player_uid,
            player_name,
            product_variants (
              name,
              products (name)
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string, orderId: string) => {
    try {
      // Get order details first
      const { data: order } = await supabase
        .from("orders")
        .select("product_variant_id, quantity")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Order not found");

      // Get available voucher codes
      const { data: availableVouchers } = await supabase
        .from("voucher_codes")
        .select("id")
        .eq("product_variant_id", order.product_variant_id)
        .eq("status", "available")
        .limit(order.quantity);

      if (!availableVouchers || availableVouchers.length < order.quantity) {
        throw new Error("Not enough voucher codes available");
      }

      // Assign voucher codes
      const voucherIds = availableVouchers.map((v) => v.id);
      const { error: voucherError } = await supabase
        .from("voucher_codes")
        .update({
          status: "delivered",
          order_id: orderId,
          delivered_at: new Date().toISOString(),
        })
        .in("id", voucherIds);

      if (voucherError) throw voucherError;

      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Decrement stock
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        variant_id: order.product_variant_id,
        quantity: order.quantity,
      });

      if (stockError) console.error("Stock update error:", stockError);

      toast({
        title: "Success",
        description: "Payment approved and order completed with voucher codes delivered",
      });

      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (paymentId: string, orderId: string) => {
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      toast({
        title: "Success",
        description: "Payment rejected",
      });

      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments found</p>
          ) : (
            payments.map((payment) => (
              <Card key={payment.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="max-w-[70%]">
                        <p className="font-medium truncate">
                          {payment.profiles?.full_name || payment.profiles?.email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{payment.profiles?.email}</p>
                      </div>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="whitespace-nowrap"
                      >
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Product:</span>
                        <p className="font-medium max-w-[200px] truncate">
                          {payment.orders?.product_variants?.products?.name} -{" "}
                          {payment.orders?.product_variants?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium">৳{payment.amount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Player UID:</span>
                        <p className="font-medium max-w-[150px] truncate">{payment.orders?.player_uid}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Method:</span>
                        <p className="font-medium">{payment.payment_method}</p>
                      </div>
                      {payment.transaction_id && (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <p className="font-medium font-mono max-w-[300px] truncate">{payment.transaction_id}</p>
                        </div>
                      )}
                    </div>

                    {payment.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          onClick={() => handleApprovePayment(payment.id, payment.order_id)}
                          className="w-full"
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectPayment(payment.id, payment.order_id)}
                          variant="destructive"
                          className="w-full"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentManagement;

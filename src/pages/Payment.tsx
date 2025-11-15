import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthCheck from "@/components/AuthCheck";

const Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const orderDetails = location.state || {};
  const paymentNumber = "01754871878";

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUser(profile);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Payment number copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    
    try {
      const amount = parseFloat(orderDetails.price.replace(/[^0-9.]/g, ''));
      
      // Handle Wallet payment
      if (orderDetails.paymentMethod === "Wallet") {
        // Check if user has sufficient balance
        if (user.balance < amount) {
          toast({
            title: "Insufficient Balance",
            description: `You need ৳${amount.toFixed(2)} but only have ৳${user.balance.toFixed(2)} in your wallet`,
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Deduct from wallet
        const newBalance = user.balance - amount;
        const { error: balanceError } = await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", user.id);

        if (balanceError) throw balanceError;

        // Create completed order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            product_variant_id: orderDetails.variantId,
            player_uid: orderDetails.playerUID,
            player_name: orderDetails.playerName,
            customer_name: orderDetails.customerName,
            customer_phone: orderDetails.customerPhone,
            customer_country: "Bangladesh",
            customer_district: orderDetails.customerDistrict,
            quantity: 1,
            total_amount: amount,
            status: "completed",
            payment_method: "Wallet",
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create completed payment record
        await supabase
          .from("payments")
          .insert({
            order_id: order.id,
            user_id: user.id,
            amount: amount,
            payment_method: "Wallet",
            payment_provider: "wallet",
            status: "completed",
            completed_at: new Date().toISOString(),
          });

        // Assign voucher codes
        const { data: availableVouchers, error: voucherError } = await supabase
          .from("voucher_codes")
          .select("*")
          .eq("product_variant_id", orderDetails.variantId)
          .eq("status", "available")
          .limit(1);

        if (!voucherError && availableVouchers && availableVouchers.length > 0) {
          // Assign voucher code to order
          await supabase
            .from("voucher_codes")
            .update({
              order_id: order.id,
              status: "delivered",
              delivered_at: new Date().toISOString(),
            })
            .eq("id", availableVouchers[0].id);

          // Decrement stock
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", orderDetails.variantId)
            .single();

          if (variant && variant.stock_quantity > 0) {
            await supabase
              .from("product_variants")
              .update({ stock_quantity: variant.stock_quantity - 1 })
              .eq("id", orderDetails.variantId);
          }
        }

        toast({
          title: "Payment Successful!",
          description: "Your order has been placed successfully",
        });

        navigate("/payment-success", { state: { orderId: order.id } });
        return;
      }

      // Handle Bkash/Nagad manual payment
      if (!transactionId.trim()) {
        toast({
          title: "Error",
          description: "Please enter transaction ID",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create order in database with pending status
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_variant_id: orderDetails.variantId,
          player_uid: orderDetails.playerUID,
          player_name: orderDetails.playerName,
          customer_name: orderDetails.customerName,
          customer_phone: orderDetails.customerPhone,
          customer_country: "Bangladesh",
          customer_district: orderDetails.customerDistrict,
          quantity: 1,
          total_amount: amount,
          status: "pending",
          payment_method: orderDetails.paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create payment record with transaction ID
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          user_id: user.id,
          amount: amount,
          payment_method: orderDetails.paymentMethod,
          payment_provider: "manual",
          transaction_id: transactionId.trim(),
          status: "pending",
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Payment Submitted!",
        description: "Your payment is pending admin approval",
      });

      navigate("/my-orders");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: (error as Error).message || "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleUddoktaPay = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    
    try {
      const amount = parseFloat(orderDetails.price.replace(/[^0-9.]/g, ''));
      
      // Create order in database with pending status
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_variant_id: orderDetails.variantId,
          player_uid: orderDetails.playerUID,
          player_name: orderDetails.playerName,
          customer_name: orderDetails.customerName,
          customer_phone: orderDetails.customerPhone,
          customer_country: "Bangladesh",
          customer_district: orderDetails.customerDistrict,
          quantity: 1,
          total_amount: amount,
          status: "pending",
          payment_method: "Uddokta Pay",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Call Uddokta Pay function
      const { data, error } = await supabase.functions.invoke('uddokta-pay', {
        body: {
          orderId: order.id,
          amount: amount,
          customerEmail: user.email,
          customerName: user.email.split('@')[0],
          customerPhone: orderDetails.customerPhone || ""
        }
      });

      if (error) {
        console.error('Uddokta Pay error:', error);
        throw new Error(error.message || error.toString() || 'Failed to initiate Uddokta Pay payment');
      }

      if (!data) {
        throw new Error('No response data from payment gateway');
      }

      // Handle different possible response formats from custom Uddokta Pay implementation
      const paymentUrl = data.payment_url || data.redirect_url || data.url;
      
      if (!paymentUrl) {
        throw new Error('Invalid response from payment gateway: Missing payment URL');
      }

      // Redirect to Uddokta Pay
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Uddokta Pay error:", error);
      toast({
        title: "Payment Failed",
        description: (error as Error).message || "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (!orderDetails.product) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <p className="text-muted-foreground">No order details found</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-md mx-auto space-y-4 md:space-y-6 animate-fade-in">
            <Card className="bg-gradient-primary shadow-glow animate-scale-in">
              <CardHeader>
                <CardTitle className="text-center text-white text-xl md:text-2xl font-heading">Complete Payment</CardTitle>
              </CardHeader>
            </Card>

            <Card className="shadow-colored hover-lift animate-slide-in-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  📦 Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-muted-foreground">Product:</span>
                  <span className="font-medium text-sm md:text-base">{orderDetails.product}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-muted-foreground">Package:</span>
                  <span className="font-medium text-sm md:text-base">{orderDetails.variant}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-muted-foreground">Player UID:</span>
                  <span className="font-medium text-sm md:text-base break-all">{orderDetails.playerUID}</span>
                </div>
                {orderDetails.playerName && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Player Name:</span>
                    <span className="font-medium text-sm md:text-base">{orderDetails.playerName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-muted-foreground">Payment Method:</span>
                  <span className="font-medium text-sm md:text-base">{orderDetails.paymentMethod}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary text-lg md:text-xl">{orderDetails.price}</span>
                </div>
              </CardContent>
            </Card>

            {orderDetails.paymentMethod === "Bkash / Nagad" ? (
              <>
                <Card className="shadow-md hover-lift animate-slide-in-right bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      📱 Bkash / Nagad Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-primary/50">
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">Payment Number:</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xl md:text-2xl font-bold text-primary">{paymentNumber}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex items-center gap-2"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-primary/10 border border-primary/30 rounded-lg p-3 md:p-4">
                      <p className="text-xs md:text-sm font-semibold mb-2">📋 Payment Instructions:</p>
                      <ol className="text-xs md:text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Open your Bkash or Nagad app</li>
                        <li>Send money to: <strong>{paymentNumber}</strong></li>
                        <li>Amount: <strong>{orderDetails.price}</strong></li>
                        <li>Copy the transaction ID</li>
                        <li>Enter transaction ID below and submit</li>
                        <li>Wait for admin approval</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transactionId" className="text-sm md:text-base">
                        Transaction ID <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="transactionId"
                        placeholder="Enter transaction ID from Bkash/Nagad"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                        className="text-sm md:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-sm md:text-base">
                        Note (Optional)
                      </Label>
                      <Textarea
                        id="note"
                        placeholder="Add any additional note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="text-sm md:text-base"
                        rows={3}
                      />
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400">
                        ⚠️ Your order will be pending until admin approves the payment. You'll receive your voucher code after approval.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-md hover-lift animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    💳 Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gradient-success/10 border border-success/30 rounded-lg p-3 md:p-4">
                      <p className="text-xs md:text-sm text-success font-medium">
                        ⚡ Instant delivery after payment confirmation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg animate-bounce-in">
              <CardContent className="p-4 md:p-6">
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-glow text-sm md:text-base"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      <span>{orderDetails.paymentMethod === "Bkash / Nagad" ? "Submitting..." : "Processing Payment..."}</span>
                    </div>
                  ) : orderDetails.paymentMethod === "Bkash / Nagad" ? (
                    "Submit Payment 📱"
                  ) : (
                    `Pay ${orderDetails.price} 💰`
                  )}
                </Button>

                {/* Uddokta Pay Button */}
                <Button 
                  onClick={handleUddoktaPay}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-all shadow-glow text-sm md:text-base mt-4"
                  size="lg"
                >
                  Pay with Uddokta Pay 💳
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    By proceeding, you agree to our Terms & Conditions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-primary/20 animate-fade-in">
              <CardContent className="p-3 md:p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm md:text-base font-medium gradient-text">🔒 Secure Payment Gateway</p>
                  <p className="text-xs text-muted-foreground">
                    Your payment information is protected with bank-level security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </AuthCheck>
  );
};

export default Payment;
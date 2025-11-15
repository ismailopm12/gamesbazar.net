import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<any>({});
  const [voucherCodes, setVoucherCodes] = useState<any[]>([]);
  const [visibleCodes, setVisibleCodes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = location.state?.orderId;
      if (!orderId) return;

      try {
        // Fetch order details
        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            product_variants(
              name,
              price,
              products(name, image_url)
            )
          `)
          .eq("id", orderId)
          .single();

        // Fetch voucher codes for this order
        const { data: vouchers } = await supabase
          .from("voucher_codes")
          .select("*")
          .eq("order_id", orderId);

        if (order) {
          setOrderData({
            orderId: order.id,
            product: order.product_variants?.products?.name,
            variant: order.product_variants?.name,
            playerUID: order.player_uid,
            price: `৳${order.total_amount}`,
            transactionId: order.id.substring(0, 8).toUpperCase(),
          });
        }

        if (vouchers) {
          setVoucherCodes(vouchers);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [location.state]);

  const toggleCodeVisibility = (codeId: string) => {
    setVisibleCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };

  const maskCode = (code: string) => {
    if (code.length <= 8) return code;
    const start = code.substring(0, 4);
    const end = code.substring(code.length - 4);
    return `${start}****${end}`;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const handleDownloadReceipt = () => {
    toast({
      title: "Download Started",
      description: "Receipt is being downloaded...",
    });
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Receipt - GamesBazar',
        text: `Order ${orderData.orderId} completed successfully!`,
        url: window.location.href,
      });
    } else {
      toast({
        title: "Share",
        description: "Share feature not supported on this device",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Header */}
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">
                Your order has been processed successfully
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{orderData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{orderData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{orderData.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium">{orderData.variant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Player UID:</span>
                <span className="font-medium">{orderData.playerUID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium text-green-600">{orderData.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">COMPLETED</span>
              </div>
            </CardContent>
          </Card>

          {/* Voucher Codes */}
          {voucherCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Voucher Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {voucherCodes.map((voucher) => (
                  <div key={voucher.id} className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Code Delivered!
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg">
                      <code className="text-sm font-mono font-bold">
                        {visibleCodes[voucher.id] ? voucher.code : maskCode(voucher.code)}
                      </code>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCodeVisibility(voucher.id)}
                        >
                          {visibleCodes[voucher.id] ? (
                            <Share className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(voucher.code)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      💡 Copy this code and redeem it in your game to get your {orderData.variant}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Order Delivered Successfully!
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your {orderData.variant} have been delivered. 
                  Use the voucher code above to redeem in your game.
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  🎮 Instant delivery!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadReceipt}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShareReceipt}
                  className="flex items-center space-x-2"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              <Button 
                onClick={() => navigate("/my-codes")}
                className="w-full"
              >
                View My Codes
              </Button>
              
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need help? Contact our support team
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm">
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PaymentSuccess;
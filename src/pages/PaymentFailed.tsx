import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, MessageCircle } from "lucide-react";

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderData = location.state || {};

  const handleRetryPayment = () => {
    navigate("/payment", { state: orderData });
  };

  const handleContactSupport = () => {
    // Open WhatsApp or contact support
    window.open("https://wa.me/8809613827683", "_blank");
  };

  const commonIssues = [
    {
      issue: "Insufficient Balance",
      solution: "Please add money to your wallet and try again"
    },
    {
      issue: "Network Error", 
      solution: "Check your internet connection and retry"
    },
    {
      issue: "Bank Declined",
      solution: "Contact your bank or try a different payment method"
    },
    {
      issue: "Session Expired",
      solution: "Please start a new order from the beginning"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Failure Header */}
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Payment Failed!
              </h1>
              <p className="text-muted-foreground">
                We couldn't process your payment. Please try again.
              </p>
            </CardContent>
          </Card>

          {/* Error Details */}
          <Card>
            <CardHeader>
              <CardTitle>Error Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {orderData.error || "Payment processing failed"}
                </p>
              </div>
              
              {orderData.product && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{orderData.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="font-medium">{orderData.variant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{orderData.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={handleRetryPayment}
                className="w-full flex items-center space-x-2"
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </Button>
              
              <Button 
                onClick={handleContactSupport}
                variant="outline"
                className="w-full flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Support</span>
              </Button>
              
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonIssues.map((item, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3">
                    <p className="font-medium text-sm mb-1">{item.issue}</p>
                    <p className="text-xs text-muted-foreground">{item.solution}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-medium mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is available 24/7 to assist you
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span>📞</span>
                  <span>09613827683</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span>📧</span>
                  <span>bdgamesbazar.net@gmail.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span>⏰</span>
                  <span>24/7 Support Available</span>
                </div>
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

export default PaymentFailed;
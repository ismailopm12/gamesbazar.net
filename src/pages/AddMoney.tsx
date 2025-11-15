import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    { id: "bkash", name: "bKash Personal", icon: "💳", color: "bg-pink-500", number: "+8801754871878" },
    { id: "uddokta", name: "Uddokta Pay", icon: "💳", color: "bg-blue-500", number: "Online Payment" },
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();
      
      if (data) setBalance(data.balance || 0);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || !selectedMethod) {
      toast({
        title: "Error",
        description: "Please select amount and payment method",
        variant: "destructive"
      });
      return;
    }

    // For Uddokta Pay, we don't need transaction ID
    if (selectedMethod !== "uddokta" && !transactionId) {
      toast({
        title: "Error",
        description: "Transaction ID is required. Please send money first and enter the transaction ID.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For Uddokta Pay, redirect to payment gateway
      if (selectedMethod === "uddokta") {
        // Generate a unique order ID for wallet top-up
        const orderId = `wallet_topup_${user.id}_${Date.now()}`;
        
        const { data, error } = await supabase.functions.invoke('uddokta-pay', {
          body: {
            orderId: orderId,
            amount: parseFloat(amount),
            customerEmail: user.email,
            customerName: user.email.split('@')[0],
            customerPhone: ""
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
        return;
      }

      const { error } = await supabase
        .from("money_requests")
        .insert([{
          user_id: user.id,
          amount: parseFloat(amount),
          payment_method: selectedMethod,
          transaction_id: transactionId,
          admin_note: note || null,
          status: "pending"
        }]);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your money request has been submitted. Once approved, money will be added to your wallet instantly!",
      });

      setAmount("");
      setSelectedMethod("");
      setTransactionId("");
      setNote("");
    } catch (error) {
      console.error('AddMoney error:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to process your request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Add Money to Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Section */}
              <div className="space-y-3">
                <Label htmlFor="amount">Enter Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount in BDT"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-sm"
                    >
                      ৳{quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedMethod === method.id ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col items-start justify-start space-y-2 ${
                        selectedMethod === method.id ? method.color : ""
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-base font-bold">{method.name}</span>
                      </div>
                      <span className="text-sm font-mono">{method.number}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedMethod && selectedMethod !== "uddokta" && (
                <>
                  <Card className="bg-gradient-primary/10 border-primary/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Send Money To</p>
                        <p className="text-2xl md:text-3xl font-bold font-mono gradient-text">8801754871878</p>
                        <p className="text-xs text-muted-foreground mt-1">Personal bKash or Nagad</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">📝 Payment Instructions:</p>
                      <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Send money to: <span className="font-bold text-foreground">8801754871878</span></li>
                        <li>Use "Send Money" option in bKash or Nagad</li>
                        <li>Enter the amount you selected</li>
                        <li>Complete the payment</li>
                        <li>Copy the Transaction ID</li>
                        <li>Paste it below and submit</li>
                      </ol>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {selectedMethod === "uddokta" && (
                <Card className="bg-gradient-primary/10 border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Online Payment</p>
                      <p className="text-xl md:text-2xl font-bold gradient-text">Uddokta Pay</p>
                      <p className="text-xs text-muted-foreground mt-1">Secure online payment gateway</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction ID (Required) */}
              <div className="space-y-2">
                <Label htmlFor="transaction_id" className="text-red-500">Transaction ID (Required) *</Label>
                <Input
                  id="transaction_id"
                  type="text"
                  placeholder="Enter bKash/Nagad transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Please send money first, then enter the transaction ID here
                </p>
              </div>

              {/* Note (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  type="text"
                  placeholder="Add any additional information (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Current Balance */}
              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-4 text-center">
                  <p className="text-sm opacity-90">Current Balance</p>
                  <p className="text-2xl font-bold">৳{balance.toFixed(2)}</p>
                </CardContent>
              </Card>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✅ Admin will approve your payment. Once approved, money will be added to your wallet instantly!
                </p>
              </div>

              <Button 
                onClick={handleAddMoney}
                className="w-full bg-gradient-primary"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AddMoney;
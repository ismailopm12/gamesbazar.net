import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [playerUID, setPlayerUID] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("");

  useEffect(() => {
    fetchProduct();
    fetchUserBalance();
  }, [productId]);

  const fetchUserBalance = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserBalance(profile.balance || 0);
      }
    }
  };

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select(`
          *,
          voucher_codes(status)
        `)
        .eq("product_id", productId)
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (variantsError) throw variantsError;

      // Calculate actual stock from available voucher codes
      const variantsWithRealStock = variantsData?.map(variant => {
        const availableCodes = variant.voucher_codes?.filter(
          (code: { status: string }) => code.status === 'available'
        ) || [];
        return {
          ...variant,
          stock_quantity: availableCodes.length
        };
      }) || [];

      setProduct(productData);
      setVariants(variantsWithRealStock);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { 
      id: "Wallet", 
      name: "Wallet", 
      icon: "💰", 
      description: `Balance: ৳${userBalance.toFixed(2)} • Instant delivery`
    },
    { 
      id: "Bkash / Nagad", 
      name: "Bkash / Nagad", 
      icon: "📱", 
      description: "Manual payment - 01754871878"
    },
    { 
      id: "Uddokta Pay", 
      name: "Uddokta Pay", 
      icon: "💳", 
      description: "Online payment - Secure & Instant"
    },
  ];

  const checkPlayerName = async () => {
    if (!playerUID) {
      toast({
        title: "Error",
        description: "Please enter Player UID",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingName(true);
    // Simulate API call to check player name
    setTimeout(() => {
      setPlayerName(`Player_${playerUID.slice(-4)}`);
      toast({
        title: "Player Found",
        description: `Player name: Player_${playerUID.slice(-4)}`,
      });
      setIsCheckingName(false);
    }, 1000);
  };

  const handleProceedToPayment = () => {
    if (!selectedVariant || !playerUID || !selectedPayment || !customerName || !customerPhone || !customerDistrict) {
      toast({
        title: "Error", 
        description: "Please fill all required fields including customer information",
        variant: "destructive"
      });
      return;
    }

    const variant = variants.find(v => v.id === selectedVariant);
    const paymentMethod = paymentMethods.find(p => p.id === selectedPayment);
    
    navigate("/payment", {
      state: {
        product: product.name,
        variant: variant?.name,
        variantId: variant?.id,
        price: `৳${variant?.price}`,
        playerUID,
        playerName,
        paymentMethod: paymentMethod?.name,
        customerName,
        customerPhone,
        customerDistrict
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <p className="text-muted-foreground">Product not found</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-8">
        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
          <Card className="shadow-colored hover-lift animate-scale-in">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="text-center text-lg sm:text-xl md:text-2xl font-heading gradient-text">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-glow"
                />
              )}
              <p className="text-center text-xs sm:text-sm md:text-base text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-slide-in-left">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <Badge className="bg-gradient-ocean text-white text-xs sm:text-sm">1</Badge>
                <span className="text-sm sm:text-base">📦 Select Package</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {variants.map((variant, index) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    className={`h-auto p-3 sm:p-3 md:p-3 flex flex-col items-center space-y-1 transition-all hover-lift ${
                      selectedVariant === variant.id ? "bg-gradient-primary shadow-glow" : ""
                    }`}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.stock_quantity <= 0}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-xs sm:text-sm md:text-sm font-medium text-center line-clamp-2">{variant.name}</span>
                    <span className="text-sm sm:text-sm md:text-sm text-primary font-bold">৳{variant.price}</span>
                    {variant.stock_quantity <= 0 ? (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs">Out of Stock</Badge>
                    ) : variant.stock_quantity < 10 ? (
                      <span className="text-[10px] sm:text-xs md:text-xs text-orange-500">Only {variant.stock_quantity} left</span>
                    ) : (
                      <Badge className="text-[10px] sm:text-xs bg-gradient-success">Available</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-slide-in-right">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <Badge className="bg-gradient-success text-white text-xs sm:text-sm">2</Badge>
                <span className="text-sm sm:text-base">👤 Account Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="playerUID" className="text-xs sm:text-sm md:text-base">Player UID</Label>
                <div className="flex flex-col space-y-2">
                  <Input
                    id="playerUID"
                    placeholder="Enter Player UID"
                    value={playerUID}
                    onChange={(e) => setPlayerUID(e.target.value)}
                    className="flex-1 text-xs sm:text-sm md:text-base h-9 sm:h-10"
                  />
                  <Button 
                    onClick={checkPlayerName} 
                    variant="outline"
                    disabled={isCheckingName}
                    className="w-full hover-lift text-xs sm:text-sm md:text-base h-9 sm:h-10"
                  >
                    {isCheckingName ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      "Check Name"
                    )}
                  </Button>
                </div>
              </div>

              {playerName && (
                <div className="bg-gradient-success/10 border border-success/30 rounded-lg p-2 sm:p-3 animate-scale-in">
                  <p className="text-[10px] sm:text-xs md:text-sm text-success font-medium">
                    ✅ Player Name: <strong>{playerName}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-slide-in-left">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <Badge className="bg-gradient-gaming text-white text-xs sm:text-sm">3</Badge>
                <span className="text-sm sm:text-base">📋 Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-xs sm:text-sm md:text-base">Full Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-xs sm:text-sm md:text-base">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerDistrict" className="text-xs sm:text-sm md:text-base">District (Bangladesh) *</Label>
                <Input
                  id="customerDistrict"
                  placeholder="e.g., Dhaka, Chittagong, Sylhet"
                  value={customerDistrict}
                  onChange={(e) => setCustomerDistrict(e.target.value)}
                  className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">
                  🇧🇩 Country: Bangladesh (Only)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-bounce-in">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <Badge className="bg-gradient-fire text-white text-xs sm:text-sm">4</Badge>
                <span className="text-sm sm:text-base">💳 Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {paymentMethods.map((method, index) => (
                  <Button
                    key={method.id}
                    variant={selectedPayment === method.id ? "default" : "outline"}
                    className={`h-auto p-3 sm:p-3 md:p-4 flex items-center justify-start space-x-2 sm:space-x-3 transition-all hover-lift ${
                      selectedPayment === method.id ? "bg-gradient-primary shadow-glow" : ""
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-lg sm:text-xl md:text-2xl">{method.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-xs sm:text-sm md:text-base">{method.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleProceedToPayment}
                className="w-full mt-3 sm:mt-4 bg-gradient-primary hover:opacity-90 transition-all shadow-glow text-xs sm:text-sm md:text-base h-10 sm:h-11"
                size="lg"
              >
                Proceed to Payment 💰
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 animate-fade-in">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">📋 Product Information</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              <div className="space-y-2 md:space-y-3 text-[10px] sm:text-xs md:text-sm">
                <p><strong>Category:</strong> {product.category || "Gaming"} 🎮</p>
                <p><strong>Type:</strong> Digital Top-up 💎</p>
                <p><strong>Delivery:</strong> Instant (Auto delivery after payment) ⚡</p>
                <p><strong>Support:</strong> 24/7 Available 🔧</p>
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

export default ProductDetails;
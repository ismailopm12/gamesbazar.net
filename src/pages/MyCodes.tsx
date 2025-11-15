import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthCheck from "@/components/AuthCheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MyCodes = () => {
  const [visibleCodes, setVisibleCodes] = useState<{ [key: string]: boolean }>({});
  const [codes, setCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCodes();
  }, []);

  const fetchMyCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("voucher_codes")
        .select(`
          *,
          product_variants(
            id,
            name,
            price,
            products(name)
          ),
          orders(
            id,
            created_at
          )
        `)
        .eq("orders.user_id", user.id)
        .not("order_id", "is", null)
        .order("delivered_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCodeVisibility = (codeId: string) => {
    setVisibleCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "used":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const maskCode = (code: string) => {
    if (code.length <= 8) return code;
    const start = code.substring(0, 4);
    const end = code.substring(code.length - 4);
    return `${start}****${end}`;
  };

  // Get unique variants from purchased codes
  const getUniqueVariants = () => {
    const variants = codes.reduce((acc: any[], code: any) => {
      const variant = code.product_variants;
      if (variant && !acc.find((v: any) => v.id === variant.id)) {
        acc.push(variant);
      }
      return acc;
    }, []);
    return variants;
  };

  // Filter codes by selected variant
  const getFilteredCodes = () => {
    if (!selectedVariant) return codes;
    return codes.filter((code: any) => code.product_variants?.id === selectedVariant);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const uniqueVariants = getUniqueVariants();
  const filteredCodes = getFilteredCodes();

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">My Voucher Codes</h1>
            
            {/* Variant Filter */}
            {uniqueVariants.length > 1 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedVariant ? "outline" : "default"}
                    size="sm"
                    onClick={() => setSelectedVariant(null)}
                    className="text-xs"
                  >
                    All Products
                  </Button>
                  {uniqueVariants.map((variant: any) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(variant.id)}
                      className="text-xs"
                    >
                      {variant.products?.name} - {variant.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredCodes.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {item.product_variants?.products?.name} - {item.product_variants?.name}
                      </CardTitle>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                      <code className="text-sm font-mono font-bold">
                        {visibleCodes[item.id] ? item.code : maskCode(item.code)}
                      </code>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCodeVisibility(item.id)}
                        >
                          {visibleCodes[item.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(item.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">৳{item.product_variants?.price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-medium">
                          {item.delivered_at ? new Date(item.delivered_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>

                    {item.status === "delivered" && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <p className="text-sm text-primary">
                          💡 This code is ready to use. Copy and redeem it in your game.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCodes.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">
                    {selectedVariant ? "No codes available for this product" : "No codes available"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your purchased codes will appear here
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate("/")}
                  >
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </AuthCheck>
  );
};

export default MyCodes;
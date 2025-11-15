import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthCheck from "@/components/AuthCheck";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          product_variants(
            name,
            price,
            products(name)
          ),
          profiles(full_name),
          voucher_codes(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">My Orders</h1>
            
            <div className="space-y-4">
              {orders.map((order) => {
                const voucherCount = order.voucher_codes?.[0]?.count || 0;
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="w-12 h-12 mt-1">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(order.profiles?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">
                              {order.product_variants?.products?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.product_variants?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm font-medium">৳{order.total_amount}</p>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                Qty: {order.quantity}
                              </p>
                              {voucherCount > 0 && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Package className="h-3 w-3" />
                                    {voucherCount} code{voucherCount > 1 ? 's' : ''}
                                  </Badge>
                                </>
                              )}
                            </div>
                            {order.player_uid && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Player UID: {order.player_uid}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {orders.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your order history will appear here
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate("/")}
                  >
                    Start Shopping
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

export default MyOrders;
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Package, Clock, CheckCircle, XCircle, Truck, User, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the order type
interface Order {
  id: string;
  user_id: string;
  product_variant_id: string;
  player_uid: string;
  player_name: string | null;
  quantity: number | null;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  product_variants?: {
    name: string;
    price: number;
    products?: {
      name: string;
    };
  };
  profiles?: {
    full_name: string | null;
  };
  voucher_codes?: {
    count: number;
  }[];
}

interface LiveOrderStatusProps {
  userId?: string; // If provided, show orders for this user only
  limit?: number;   // Limit the number of orders shown
}

const LiveOrderStatus = ({ userId, limit = 10 }: LiveOrderStatusProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('New order received:', payload);
          // Add the new order to the top of the list
          setOrders(prevOrders => {
            const newOrder = payload.new as Order;
            // If userId is specified, only add orders for that user
            if (!userId || newOrder.user_id === userId) {
              const updatedOrders = [newOrder, ...prevOrders];
              // Apply limit
              return limit ? updatedOrders.slice(0, limit) : updatedOrders;
            }
            return prevOrders;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order update received:', payload);
          // Update the specific order in the state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  const fetchOrders = async () => {
    try {
      let query = supabase
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
        .order("created_at", { ascending: false })
        .limit(limit);

      // If userId is provided, filter by user
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
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
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Truck className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "refunded":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { id: "pending", label: "Order Placed", icon: <Clock className="h-4 w-4" /> },
      { id: "processing", label: "Processing", icon: <Truck className="h-4 w-4" /> },
      { id: "completed", label: "Completed", icon: <CheckCircle className="h-4 w-4" /> },
    ];

    const statusIndex = steps.findIndex(step => step.id === status);
    
    return steps.map((step, index) => (
      <div key={step.id} className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          index <= statusIndex ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}>
          {step.icon}
        </div>
        <p className={`text-xs mt-1 text-center ${
          index <= statusIndex ? "text-foreground" : "text-muted-foreground"
        }`}>
          {step.label}
        </p>
      </div>
    ));
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Live Order Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => {
              const voucherCount = order.voucher_codes?.[0]?.count || 0;
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-12 h-12 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(order.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-medium text-foreground">
                              {order.product_variants?.products?.name}
                            </h3>
                            <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.product_variants?.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
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
                      
                      <div className="md:text-right">
                        <p className="text-xs text-muted-foreground">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Progress Bar - Mobile Responsive */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Status Progress
                      </h4>
                      <div className="flex justify-between gap-2">
                        {getStatusSteps(order.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderStatus;
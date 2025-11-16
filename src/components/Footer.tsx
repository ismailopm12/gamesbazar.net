import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface OrderWithProduct extends Tables<'orders'> {
  product_variant: Tables<'product_variants'> | null;
  product: Tables<'products'> | null;
}

const Footer = () => {
  const [recentOrders, setRecentOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyrightText, setCopyrightText] = useState("© 2025 BD Games Bazar. All rights reserved. 🎮");

  useEffect(() => {
    fetchRecentOrders();
    fetchCopyrightText();
  }, []);

  const fetchCopyrightText = async () => {
    try {
      // Try to fetch from page_contents with slug 'footer'
      const { data } = await supabase
        .from("page_contents")
        .select("content")
        .eq("page_slug", "footer")
        .maybeSingle();
      
      if (data?.content) {
        setCopyrightText(data.content);
      }
    } catch (error) {
      console.log("Could not fetch custom footer text, using default");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product_variants!inner(*),
          product_variants(products(*))
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform the data to match our interface
      const ordersWithProducts = data.map(order => ({
        ...order,
        product_variant: order.product_variants,
        product: order.product_variants?.products || null
      }));

      setRecentOrders(ordersWithProducts);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <footer className="bg-gradient-to-b from-card to-card/50 border-t border-border mt-auto animate-fade-in">
      {/* Recent Orders Section */}
      <div className="container mx-auto px-4 py-6 bg-orange-50 border border-orange-200 rounded-lg mb-6 animate-slide-in-up">
        <h3 className="text-lg font-heading font-bold text-orange-800 mb-3 flex items-center">
          🟠 Live Order Status
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        ) : recentOrders.length > 0 ? (
          <>
            {/* Table view for larger screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-orange-200">
                    <th className="text-left py-2 px-2 text-orange-700 font-semibold">Order</th>
                    <th className="text-left py-2 px-2 text-orange-700 font-semibold">Product</th>
                    <th className="text-left py-2 px-2 text-orange-700 font-semibold">Amount</th>
                    <th className="text-left py-2 px-2 text-orange-700 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-orange-100 last:border-b-0 hover:bg-orange-100/50">
                      <td className="py-2 px-2 text-orange-900 font-medium">
                        <div className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]" title={order.id}>
                          {order.id.substring(0, 6)}...
                        </div>
                      </td>
                      <td className="py-2 px-2 text-orange-800">
                        <div className="truncate max-w-[80px] sm:max-w-[100px] md:max-w-[150px]" title={order.product?.name || order.product_variant?.name || 'Unknown'}>
                          {order.product?.name || order.product_variant?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-orange-900 font-medium">
                        ৳{order.total_amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Card view for mobile screens */}
            <div className="sm:hidden space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-white/80 rounded-lg p-3 border border-orange-200 hover:bg-orange-100/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-orange-900 font-medium text-sm truncate max-w-[120px]" title={order.id}>
                      Order: {order.id.substring(0, 8)}...
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-orange-800 text-sm mb-1 truncate" title={order.product?.name || order.product_variant?.name || 'Unknown'}>
                    {order.product?.name || order.product_variant?.name || 'Unknown'}
                  </div>
                  <div className="text-orange-900 font-medium text-sm">
                    ৳{order.total_amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-orange-700 text-center py-3 text-sm">
            No recent orders found
          </p>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2 animate-slide-in-left">
            <div className="flex items-center space-x-2 md:space-x-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-fire rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-base md:text-lg">GB</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-heading font-bold gradient-text">BD GAMES BAZAR</h3>
                <p className="text-xs text-muted-foreground">SHOP TODAY</p>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-md">
              🎮 আপনার পছন্দের গেমের ডায়মন্ড, ভাউচার এবং গিফট কার্ড কিনুন সহজেই।
              ⚡ দ্রুত ডেলিভারি এবং নিরাপদ পেমেন্ট।
            </p>
          </div>

          <div className="animate-slide-in-right">
            <h4 className="font-heading font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-all hover:translate-x-1 inline-block">🏠 Home</a></li>
              <li><a href="/my-orders" className="hover:text-primary transition-all hover:translate-x-1 inline-block">📦 My Orders</a></li>
              <li><a href="/my-codes" className="hover:text-primary transition-all hover:translate-x-1 inline-block">🎫 My Codes</a></li>
              <li><a href="/add-money" className="hover:text-primary transition-all hover:translate-x-1 inline-block">💰 Add Money</a></li>
            </ul>
          </div>

          <div className="animate-slide-in-right">
            <h4 className="font-heading font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Support</h4>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li><a href="/help" className="hover:text-primary transition-all hover:translate-x-1 inline-block">💬 Help Center</a></li>
              <li><a href="/contact" className="hover:text-primary transition-all hover:translate-x-1 inline-block">📧 Contact Us</a></li>
              <li><a href="/terms" className="hover:text-primary transition-all hover:translate-x-1 inline-block">📜 Terms & Conditions</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-all hover:translate-x-1 inline-block">🔒 Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            {copyrightText}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Developed by Sujon
          </p>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Spacer */}
      <div className="md:hidden h-20"></div>
    </footer>
  );
};

export default Footer;
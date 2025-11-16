import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Youtube, MessageCircle, Send } from "lucide-react";

// Define the OrderWithProduct interface
interface OrderWithProduct {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  products: {
    name: string;
  } | null;
}

// Define website settings interface
interface WebsiteSettings {
  id: string;
  logo_url: string | null;
  site_title: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  facebook_url: string | null;
  youtube_url: string | null;
  whatsapp_url: string | null;
  telegram_url: string | null;
  primary_font: string | null;
  secondary_font: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const Footer = () => {
  const [recentOrders, setRecentOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyrightText, setCopyrightText] = useState("© 2025 BD Games Bazar. All rights reserved. 🎮");
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    fetchRecentOrders();
    fetchCopyrightText();
    fetchWebsiteSettings();
  }, []);

  const fetchWebsiteSettings = async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("*")
      .limit(1)
      .single();
    
    if (data) {
      setWebsiteSettings(data);
      
      // Apply font settings to the document
      if (data.primary_font || data.secondary_font) {
        const primaryFont = data.primary_font || 'Inter';
        const secondaryFont = data.secondary_font || 'Poppins';
        
        // Create or update font CSS
        let fontStyles = document.getElementById('font-styles');
        if (!fontStyles) {
          fontStyles = document.createElement('style');
          fontStyles.id = 'font-styles';
          document.head.appendChild(fontStyles);
        }
        
        // Add Google Fonts link if not already present
        const fontLink = `https://fonts.googleapis.com/css2?family=${primaryFont.replace(' ', '+')}&family=${secondaryFont.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
        let linkElement = document.querySelector(`link[href="${fontLink}"]`);
        if (!linkElement) {
          linkElement = document.createElement('link');
          (linkElement as HTMLLinkElement).rel = 'stylesheet';
          (linkElement as HTMLLinkElement).href = fontLink;
          document.head.appendChild(linkElement);
        }
        
        // Apply font styles
        fontStyles.textContent = `
          :root {
            --font-primary: '${primaryFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --font-secondary: '${secondaryFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          body {
            font-family: var(--font-primary);
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-secondary);
          }
        `;
      }
    }
  };

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
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Recent Orders</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-white/80 rounded-lg p-3 border border-orange-200 hover:bg-orange-100/50 transition-colors">
                <div className="text-orange-900 font-medium text-sm truncate max-w-[120px]" title={order.id}>
                  Order: {order.id.substring(0, 8)}...
                </div>
                <div className="text-orange-800 text-xs mt-1">
                  ৳{order.total_amount.toFixed(2)}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="animate-slide-in-left">
            <div className="flex items-center space-x-3 mb-4">
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
            
            {/* Social Media Links */}
            <div className="flex space-x-3 mt-4">
              {websiteSettings?.facebook_url && (
                <a 
                  href={websiteSettings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {websiteSettings?.youtube_url && (
                <a 
                  href={websiteSettings.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {websiteSettings?.whatsapp_url && (
                <a 
                  href={websiteSettings.whatsapp_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {websiteSettings?.telegram_url && (
                <a 
                  href={websiteSettings.telegram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
            </div>
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
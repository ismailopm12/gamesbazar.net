import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Shield, Wallet, ShoppingBag, Code } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface WebsiteSettings {
  id: string;
  logo_url: string | null;
  site_title: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  created_at: string | null;
  updated_at: string | null;
}

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchWebsiteSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
        fetchBalance(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setBalance(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      checkAdminStatus(session.user.id);
      fetchBalance(session.user.id);
    }
  };

  const fetchWebsiteSettings = async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("*")
      .limit(1)
      .single();
    
    if (data) {
      setWebsiteSettings(data);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      // First check if user has admin role in database
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      
      // Additionally check if this is the specific user who should have admin access
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      
      // Show admin button only for specific admin users
      const isSpecificAdmin = profile?.email === "sujon.hopm@gmail.com" || profile?.email === "mdismail.opm@gmail.com";
      setIsAdmin(!!data || isSpecificAdmin);
    } catch (error) {
      console.error("Admin status check error:", error);
      setIsAdmin(false);
    }
  };

  const fetchBalance = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();
    
    if (data) {
      setBalance(Number(data.balance) || 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50 animate-fade-in shadow-lg">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between py-3 md:py-4">
          <a href="/" className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
            {websiteSettings?.logo_url ? (
              <img 
                src={websiteSettings.logo_url} 
                alt={websiteSettings?.site_title || "BD GAMES BAZAR"} 
                className="h-9 w-9 md:h-11 md:w-11 object-contain"
              />
            ) : (
              <div 
                className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: websiteSettings?.primary_color || '#8B5CF6' }}
              >
                <span className="text-white font-bold text-base md:text-xl">GB</span>
              </div>
            )}
            <div>
              <h1 
                className="text-base md:text-xl font-heading font-bold"
                style={{ 
                  background: websiteSettings 
                    ? `linear-gradient(90deg, ${websiteSettings.primary_color}, ${websiteSettings.secondary_color})` 
                    : 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {websiteSettings?.site_title || "BD GAMES BAZAR"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Gaming Voucher Shop</p>
            </div>
          </a>

          <div className="flex items-center gap-1.5 md:gap-2">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <Badge variant="secondary" className="flex items-center gap-1.5 bg-gradient-success text-success-foreground shadow-md animate-scale-in">
                    <Wallet className="h-3.5 w-3.5" />
                    ৳{balance.toFixed(2)}
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 md:gap-2 hover-lift">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{user.email}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Wallet className="h-3 w-3" />
                          Balance: ৳{balance.toFixed(2)}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4 text-primary" />
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/add-money")} className="cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4" />
                      Add Money
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-orders")} className="cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-codes")} className="cursor-pointer">
                      <Code className="mr-2 h-4 w-4" />
                      My Codes
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/auth")} 
                  className="hover-lift text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-9"
                >
                  Register
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/auth")} 
                  className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9"
                  style={{ 
                    background: websiteSettings 
                      ? `linear-gradient(90deg, ${websiteSettings.primary_color}, ${websiteSettings.accent_color})` 
                      : 'linear-gradient(90deg, #8B5CF6, #10B981)',
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { Button } from "@/components/ui/button";
import { Home, CircleDollarSign, ShoppingBag, KeyRound, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      checkAdminStatus(session.user.id);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "add-money", icon: CircleDollarSign, label: "Add Money", path: "/add-money" },
    { id: "my-orders", icon: ShoppingBag, label: "Orders", path: "/my-orders" },
    { id: "my-codes", icon: KeyRound, label: "Codes", path: "/my-codes" },
    ...(isAdmin ? [{ id: "admin", icon: Shield, label: "Admin", path: "/admin" }] : []),
    { id: "profile", icon: User, label: user ? "Profile" : "Login", path: user ? "/profile" : "/auth" }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-lg border-t border-border z-50 shadow-2xl animate-slide-in-left safe-area-pb">
      <div className="flex items-center justify-around py-3 px-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-2 min-w-0 flex-1 transition-all duration-300 ${
                isActive 
                  ? "text-primary scale-110 bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:scale-105"
              }`}
              onClick={() => handleNavigation(item.path)}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <Icon className={`h-6 w-6 transition-all duration-300 ${
                isActive ? "text-primary" : ""
              }`} />
              <span className={`text-[9px] font-medium truncate transition-all duration-300 ${
                isActive ? "font-bold" : ""
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-primary rounded-full animate-fade-in" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogOut, Menu, X, ShoppingCart, Package, FolderTree, List, Gift, Users, Image, Bell, FileText, Link2, Wallet, CreditCard, Settings, BookOpen, Palette } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import VariantManagement from "@/components/admin/VariantManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import VoucherManagement from "@/components/admin/VoucherManagement";
import HeroSliderManagement from "@/components/admin/HeroSliderManagement";
import AnnouncementManagement from "@/components/admin/AnnouncementManagement";
import SEOManagement from "@/components/admin/SEOManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import PaymentURLManagement from "@/components/admin/PaymentURLManagement";
import MoneyRequestManagement from "@/components/admin/MoneyRequestManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import { UddoktaPaySettings } from "@/components/admin/UddoktaPaySettings";
import PageContentManagement from "@/components/admin/PageContentManagement";
import WebsiteSettingsManagement from "@/components/admin/WebsiteSettingsManagement";
import StorageTest from "@/components/admin/StorageTest";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { value: "products", label: "Products", icon: ShoppingCart },
    { value: "variants", label: "Variants", icon: Package },
    { value: "categories", label: "Categories", icon: FolderTree },
    { value: "orders", label: "Orders", icon: List },
    { value: "payments", label: "Payments", icon: CreditCard },
    { value: "vouchers", label: "Vouchers", icon: Gift },
    { value: "users", label: "Users", icon: Users },
    { value: "hero", label: "Hero Slider", icon: Image },
    { value: "announcements", label: "Popups", icon: Bell },
    { value: "payment-urls", label: "Payment URLs", icon: Link2 },
    { value: "uddokta-settings", label: "Uddokta Pay API", icon: Settings },
    { value: "money-requests", label: "Money Requests", icon: Wallet },
    { value: "page-content", label: "Page Content", icon: BookOpen },
    { value: "website-settings", label: "Website Settings", icon: Palette },
    { value: "storage-test", label: "Storage Test", icon: Settings },
    { value: "seo", label: "SEO", icon: FileText },
  ];

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions. Contact support to get admin access.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-64 bg-card border-r border-primary/20
        transform transition-transform duration-300 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-lg
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">Admin</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-sm font-medium
                  ${activeTab === item.value 
                    ? 'bg-gradient-primary text-primary-foreground shadow' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-primary/20">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="truncate">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-primary/20 px-4 py-3 flex items-center justify-between shadow-sm">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground truncate max-w-[60%]">
            {menuItems.find(item => item.value === activeTab)?.label}
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-full mx-auto">
            {activeTab === "products" && <ProductManagement />}
            {activeTab === "variants" && <VariantManagement />}
            {activeTab === "categories" && <CategoryManagement />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "payments" && <PaymentManagement />}
            {activeTab === "vouchers" && <VoucherManagement />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "hero" && <HeroSliderManagement />}
            {activeTab === "announcements" && <AnnouncementManagement />}
            {activeTab === "payment-urls" && <PaymentURLManagement />}
            {activeTab === "uddokta-settings" && <UddoktaPaySettings />}
            {activeTab === "money-requests" && <MoneyRequestManagement />}
            {activeTab === "page-content" && <PageContentManagement />}
            {activeTab === "website-settings" && <WebsiteSettingsManagement />}
            {activeTab === "storage-test" && <StorageTest />}
            {activeTab === "seo" && <SEOManagement />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
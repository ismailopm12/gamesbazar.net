import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Wallet, 
  Settings, 
  HelpCircle,
  LogOut,
  Facebook,
  Youtube,
  Phone as WhatsApp,
  Lock,
  User as UserIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [formData, setFormData] = useState({ full_name: "", phone: "" });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [websiteSettings, setWebsiteSettings] = useState({
    facebook_url: "https://facebook.com/bdgamesbazar",
    youtube_url: "https://youtube.com/@bdgamesbazar",
    whatsapp_url: "https://wa.me/8801XXXXXXXXX",
    telegram_url: "https://t.me/bdgamesbazar",
    primary_font: "Inter",
    secondary_font: "Poppins",
  });

  useEffect(() => {
    fetchUserData();
    fetchWebsiteSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile with error handling
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Failed to load profile data");
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setBalance(Number(profileData.balance) || 0);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
        });
      }

      // Fetch total orders
      const { count, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
        // Don't set error here as profile data is more important
      } else {
        setTotalOrders(count || 0);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsiteSettings = async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("facebook_url, youtube_url, whatsapp_url, telegram_url, primary_font, secondary_font")
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

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", session.user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile: " + error.message,
          variant: "destructive",
        });
        return;
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      fetchUserData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
      setShowPasswordReset(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchUserData} className="mr-2">
            Retry
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">We couldn't find your profile data.</p>
          <Button onClick={fetchUserData} className="mr-2">
            Retry
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "09613827683", color: "text-blue-500" },
    { icon: Mail, label: "Email", value: "bdgamesbazar.net@gmail.com", color: "text-red-500" }
  ];

  const socialLinks = [
    { 
      icon: Facebook, 
      label: "Facebook", 
      color: "text-blue-600",
      url: websiteSettings.facebook_url
    },
    { 
      icon: Youtube, 
      label: "YouTube", 
      color: "text-red-600",
      url: websiteSettings.youtube_url
    },
    { 
      icon: WhatsApp, 
      label: "WhatsApp", 
      color: "text-green-500",
      url: websiteSettings.whatsapp_url
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : profile.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h1 className="text-xl font-bold">{profile.full_name || profile.email}</h1>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardContent className="p-4 text-center">
                      <Wallet className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm opacity-90">Balance</p>
                      <p className="text-lg font-bold">৳{balance.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm opacity-90">Orders</p>
                      <p className="text-lg font-bold">{totalOrders}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Follow Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-16"
                    onClick={() => window.open(social.url, '_blank')}
                    disabled={!social.url}
                  >
                    <social.icon className={`w-5 h-5 ${social.color}`} />
                    <span className="text-xs">{social.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowPasswordReset(!showPasswordReset)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </Button>

              {showPasswordReset && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We'll send a password reset link to your email: {profile.email}
                  </p>
                  <Button 
                    onClick={handlePasswordReset}
                    className="w-full"
                  >
                    Send Reset Link
                  </Button>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mt-2">
                © 2025 BD Games Bazar All rights reserved |
              </p>
              <p className="text-xs text-muted-foreground">
                Developed by Sujon
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
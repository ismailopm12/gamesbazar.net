import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Facebook, Youtube, MessageCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const WebsiteSettingsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: "",
    logo_url: "",
    site_title: "BD GAMES BAZAR",
    primary_color: "#8B5CF6",
    secondary_color: "#06B6D4",
    accent_color: "#10B981",
    facebook_url: "https://facebook.com/bdgamesbazar",
    youtube_url: "https://youtube.com/@bdgamesbazar",
    whatsapp_url: "https://wa.me/8801XXXXXXXXX",
    telegram_url: "https://t.me/bdgamesbazar",
    primary_font: "Inter",
    secondary_font: "Poppins",
  });
  const { toast } = useToast();

  // Font options
  const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Poppins", label: "Poppins" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Lato", label: "Lato" },
    { value: "Nunito", label: "Nunito" },
    { value: "Oswald", label: "Oswald" },
    { value: "Raleway", label: "Raleway" },
    { value: "Ubuntu", label: "Ubuntu" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "JSON object requested, multiple (or no) rows returned"
        console.error("Fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch website settings: " + error.message,
          variant: "destructive",
        });
      } else if (data) {
        setSettings({
          ...settings,
          ...data
        });
      } else {
        // No data found, create a default record
        const defaultSettings = {
          site_title: "BD GAMES BAZAR",
          primary_color: "#8B5CF6",
          secondary_color: "#06B6D4",
          accent_color: "#10B981",
          facebook_url: "https://facebook.com/bdgamesbazar",
          youtube_url: "https://youtube.com/@bdgamesbazar",
          whatsapp_url: "https://wa.me/8801XXXXXXXXX",
          telegram_url: "https://t.me/bdgamesbazar",
          primary_font: "Inter",
          secondary_font: "Poppins",
        };

        const { data: insertData, error: insertError } = await supabase
          .from("website_settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          toast({
            title: "Error",
            description: "Failed to create website settings: " + insertError.message,
            variant: "destructive",
          });
        } else if (insertData) {
          setSettings({
            ...settings,
            ...insertData
          });
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error as Error).message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Always update the first (and should be only) record
      // This avoids ID-related issues
      const { data: existingData, error: selectError } = await supabase
        .from("website_settings")
        .select("id")
        .limit(1);

      if (selectError) {
        console.error("Select error:", selectError);
        toast({
          title: "Error",
          description: "Failed to check website settings: " + selectError.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      if (existingData && existingData.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("website_settings")
          .update(settings)
          .eq("id", existingData[0].id);

        if (updateError) {
          console.error("Update error:", updateError);
          toast({
            title: "Error",
            description: "Failed to save website settings: " + updateError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Website settings saved successfully",
          });
        }
      } else {
        // Insert new record if no records exist
        const { error: insertError } = await supabase
          .from("website_settings")
          .insert(settings);

        if (insertError) {
          console.error("Insert error:", insertError);
          toast({
            title: "Error",
            description: "Failed to save website settings: " + insertError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Website settings saved successfully",
          });
          // Refresh the data to get the new ID
          fetchSettings();
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error as Error).message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('website-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload logo: " + uploadError.message,
        variant: "destructive",
      });
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('website-assets')
      .getPublicUrl(filePath);

    setSettings({ ...settings, logo_url: publicUrl });

    toast({
      title: "Success",
      description: "Logo uploaded successfully",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Website Logo</Label>
          <div className="flex items-center gap-4">
            {settings.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Current logo" 
                className="h-16 w-16 object-contain rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a logo image (PNG, JPG, SVG recommended)
              </p>
            </div>
          </div>
        </div>

        {/* Site Title */}
        <div className="space-y-2">
          <Label htmlFor="site_title">Site Title</Label>
          <Input
            id="site_title"
            value={settings.site_title}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            placeholder="Enter site title"
          />
        </div>

        {/* Fonts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_font">Primary Font</Label>
            <Select 
              value={settings.primary_font} 
              onValueChange={(value) => setSettings({ ...settings, primary_font: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_font">Secondary Font</Label>
            <Select 
              value={settings.secondary_font} 
              onValueChange={(value) => setSettings({ ...settings, secondary_font: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary_color"
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="flex-1"
                placeholder="#8B5CF6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={settings.secondary_color}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={settings.secondary_color}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="flex-1"
                placeholder="#06B6D4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent_color">Accent Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent_color"
                type="color"
                value={settings.accent_color}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={settings.accent_color}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="flex-1"
                placeholder="#10B981"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-semibold">Social Media Links</Label>
            <p className="text-sm text-muted-foreground">Manage your social media presence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url" className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook URL
              </Label>
              <Input
                id="facebook_url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube URL
              </Label>
              <Input
                id="youtube_url"
                value={settings.youtube_url}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_url" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                WhatsApp URL
              </Label>
              <Input
                id="whatsapp_url"
                value={settings.whatsapp_url}
                onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                placeholder="https://wa.me/yourphonenumber"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_url" className="flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-400" />
                Telegram URL
              </Label>
              <Input
                id="telegram_url"
                value={settings.telegram_url}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                placeholder="https://t.me/yourchannel"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-semibold mb-3 block">Preview</Label>
          <div className="flex items-center space-x-2">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo preview" 
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.accent_color }}
              >
                GB
              </div>
            )}
            <h1 
              className="text-lg font-bold"
              style={{ 
                color: settings.secondary_color,
                fontFamily: settings.primary_font
              }}
            >
              {settings.site_title}
            </h1>
          </div>
          
          <div className="flex gap-2 mt-3">
            {settings.facebook_url && (
              <a 
                href={settings.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </a>
            )}
            {settings.youtube_url && (
              <a 
                href={settings.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Youtube className="h-4 w-4 text-red-600" />
              </a>
            )}
            {settings.whatsapp_url && (
              <a 
                href={settings.whatsapp_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
              </a>
            )}
            {settings.telegram_url && (
              <a 
                href={settings.telegram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Send className="h-4 w-4 text-blue-400" />
              </a>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebsiteSettingsManagement;
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState({
    facebook_url: "https://facebook.com/bdgamesbazar",
    youtube_url: "https://youtube.com/@bdgamesbazar",
    whatsapp_url: "https://wa.me/8801XXXXXXXXX",
    telegram_url: "https://t.me/bdgamesbazar",
  });

  const [fontSettings, setFontSettings] = useState({
    primary_font: "Inter",
    secondary_font: "Poppins",
  });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("facebook_url, youtube_url, whatsapp_url, telegram_url, primary_font, secondary_font")
      .limit(1)
      .single();
    
    if (data) {
      // Set social links
      setSocialLinks({
        facebook_url: data.facebook_url || socialLinks.facebook_url,
        youtube_url: data.youtube_url || socialLinks.youtube_url,
        whatsapp_url: data.whatsapp_url || socialLinks.whatsapp_url,
        telegram_url: data.telegram_url || socialLinks.telegram_url,
      });
      
      // Set font settings
      setFontSettings({
        primary_font: data.primary_font || fontSettings.primary_font,
        secondary_font: data.secondary_font || fontSettings.secondary_font,
      });
      
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

  return (
    <div className="py-6 sm:py-8 bg-muted/50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
          <Button
            variant="outline"
            className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 hover:from-blue-600 hover:to-blue-700 hover:border-blue-600 shadow-lg hover:shadow-xl transition-all hover-lift h-auto py-3 sm:py-3 px-4 sm:px-5 md:px-6 w-full sm:flex-1"
            onClick={() => window.open(socialLinks.facebook_url, '_blank')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <Send className="h-5 w-5 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs sm:text-sm font-medium opacity-90">Join us on</div>
              <div 
                className="text-base sm:text-lg md:text-xl font-bold"
                style={{ fontFamily: fontSettings.secondary_font }}
              >
                Facebook
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 hover:from-green-600 hover:to-green-700 hover:border-green-600 shadow-lg hover:shadow-xl transition-all hover-lift h-auto py-3 sm:py-3 px-4 sm:px-5 md:px-6 w-full sm:flex-1"
            onClick={() => window.open(socialLinks.whatsapp_url, '_blank')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageCircle className="h-5 w-5 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs sm:text-sm font-medium opacity-90">Join us on</div>
              <div 
                className="text-base sm:text-lg md:text-xl font-bold"
                style={{ fontFamily: fontSettings.secondary_font }}
              >
                WhatsApp
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
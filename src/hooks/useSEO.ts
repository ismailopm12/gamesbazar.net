import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define SEO data interface
interface SEOData {
  title: string;
  description: string | null;
  keywords: string | null;
  author: string | null;
  viewport: string | null;
  theme_color: string | null;
  mobile_web_app_capable: string | null;
  apple_mobile_web_app_title: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_url: string | null;
  og_type: string | null;
  twitter_card: string | null;
  twitter_site: string | null;
  twitter_creator: string | null;
  canonical_url: string | null;
}

// Add SEO meta tags to the document head
const applySEOTags = (seoData: SEOData) => {
  // Remove existing SEO tags
  const existingTags = document.querySelectorAll('meta[data-seo="dynamic"], link[data-seo="dynamic"], title[data-seo="dynamic"]');
  existingTags.forEach(tag => tag.remove());
  
  // Set title
  if (seoData.title) {
    let titleElement = document.querySelector('title[data-seo="dynamic"]');
    if (!titleElement) {
      titleElement = document.createElement('title');
      titleElement.setAttribute('data-seo', 'dynamic');
      document.head.appendChild(titleElement);
    }
    titleElement.textContent = seoData.title;
  }
  
  // Meta tags
  const metaTags = [
    { name: 'description', content: seoData.description },
    { name: 'keywords', content: seoData.keywords },
    { name: 'author', content: seoData.author },
    { name: 'viewport', content: seoData.viewport },
    { name: 'theme-color', content: seoData.theme_color },
    { name: 'mobile-web-app-capable', content: seoData.mobile_web_app_capable },
    { name: 'apple-mobile-web-app-title', content: seoData.apple_mobile_web_app_title },
    { name: 'robots', content: seoData.robots },
    
    // Open Graph
    { property: 'og:title', content: seoData.og_title || seoData.title },
    { property: 'og:description', content: seoData.og_description || seoData.description },
    { property: 'og:image', content: seoData.og_image },
    { property: 'og:url', content: seoData.og_url },
    { property: 'og:type', content: seoData.og_type },
    
    // Twitter
    { name: 'twitter:card', content: seoData.twitter_card },
    { name: 'twitter:site', content: seoData.twitter_site },
    { name: 'twitter:creator', content: seoData.twitter_creator },
    { name: 'twitter:title', content: seoData.og_title || seoData.title },
    { name: 'twitter:description', content: seoData.og_description || seoData.description },
    { name: 'twitter:image', content: seoData.og_image },
  ];
  
  metaTags.forEach(tagData => {
    if (tagData.content) {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'dynamic');
      if (tagData.name) {
        meta.setAttribute('name', tagData.name);
      } else if (tagData.property) {
        meta.setAttribute('property', tagData.property);
      }
      meta.content = tagData.content;
      document.head.appendChild(meta);
    }
  });
  
  // Canonical URL
  if (seoData.canonical_url) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('data-seo', 'dynamic');
      document.head.appendChild(link);
    }
    link.href = seoData.canonical_url;
  }
};

const useSEO = () => {
  const location = useLocation();

  useEffect(() => {
    const fetchSEOSettings = async () => {
      // Map routes to page paths
      const routeMap: Record<string, string> = {
        '/': '/',
        '/auth': '/auth',
        '/grant-admin': '/grant-admin',
        '/admin': '/admin',
        '/add-money': '/add-money',
        '/my-orders': '/my-orders',
        '/my-codes': '/my-codes',
        '/profile': '/profile',
        '/help': '/help',
        '/contact': '/contact',
        '/terms': '/terms',
        '/privacy': '/privacy',
        '/live-orders': '/live-orders',
      };

      // Get the page path for the current route
      const pagePath = routeMap[location.pathname] || location.pathname;
      
      try {
        // Fetch SEO settings for the current page
        const { data, error } = await supabase
          .from("seo_settings")
          .select("*")
          .eq("page_path", pagePath)
          .single();

        if (error) {
          console.warn("No SEO settings found for page:", pagePath);
          return;
        }

        // Apply SEO tags
        applySEOTags(data);
      } catch (error) {
        console.error("Error fetching SEO settings:", error);
      }
    };

    fetchSEOSettings();
  }, [location.pathname]);
};

export default useSEO;
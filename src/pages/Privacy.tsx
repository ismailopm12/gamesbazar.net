import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface PageContent {
  id: string;
  page_slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Privacy = () => {
  const [content, setContent] = useState<PageContent | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("page_contents")
      .select("*")
      .eq("page_slug", "privacy")
      .maybeSingle();
    
    if (data) setContent(data);
  };

  // Default privacy policy content in HTML format
  const defaultContent = `
    <h2>1. Information Collection</h2>
    <p>We collect your email, phone number, and payment information which are necessary for providing our services.</p>
    
    <h2>2. Information Usage</h2>
    <p>Your information is used solely for order processing and customer support. We never sell your personal information to third parties.</p>
    
    <h2>3. Information Security</h2>
    <p>We make every effort to ensure the security of your information. Our systems are encrypted and secure.</p>
    
    <h2>4. Cookies</h2>
    <p>We use cookies to enhance your browsing experience. You may disable cookies if you prefer.</p>
    
    <h2>5. Information Access</h2>
    <p>You can view and modify your stored information at any time through your profile settings.</p>
    
    <h2>6. Policy Changes</h2>
    <p>We may update this policy from time to time. We will notify you of significant changes.</p>
    
    <h2>7. Contact</h2>
    <p>If you have any questions about this policy, please contact us.</p>
  `;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-6">
            {content?.title || "Privacy Policy"}
          </h1>
          
          <Card>
            <CardContent className="prose prose-sm md:prose max-w-none p-6">
              {content?.content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Privacy;
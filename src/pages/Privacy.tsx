import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// Define content type
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

  // Default privacy policy content
  const defaultContent = `1. Information Collection
We collect your email, phone number, and payment information which are necessary for providing our services.

2. Information Usage
Your information is used solely for order processing and customer support. We never sell your personal information to third parties.

3. Information Security
We make every effort to ensure the security of your information. Our systems are encrypted and secure.

4. Cookies
We use cookies to enhance your browsing experience. You may disable cookies if you prefer.

5. Information Access
You can view and modify your stored information at any time through your profile settings.

6. Policy Changes
We may update this policy from time to time. We will notify you of significant changes.

7. Contact
If you have any questions about this policy, please contact us.`;

  // Format content with line breaks and basic formatting
  const formatContent = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph.split('\n').map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

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
                <div className="text-muted-foreground">
                  {formatContent(content.content)}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {formatContent(defaultContent)}
                </div>
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
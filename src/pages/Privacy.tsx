import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Privacy = () => {
  const [content, setContent] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-6">Privacy Policy</h1>
          
          <Card>
            <CardContent className="prose prose-sm md:prose max-w-none p-6">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <>
                  <h2>১. তথ্য সংগ্রহ</h2>
                  <p>
                    আমরা আপনার ইমেইল, ফোন নাম্বার এবং পেমেন্ট তথ্য সংগ্রহ করি যা সেবা প্রদানের জন্য প্রয়োজনীয়।
                  </p>

                  <h2>২. তথ্য ব্যবহার</h2>
                  <p>
                    আপনার তথ্য শুধুমাত্র অর্ডার প্রসেসিং এবং কাস্টমার সাপোর্টের জন্য ব্যবহার করা হয়। আমরা কখনও আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
                  </p>

                  <h2>৩. তথ্য নিরাপত্তা</h2>
                  <p>
                    আমরা আপনার তথ্যের নিরাপত্তা নিশ্চিত করতে সর্বোচ্চ প্রচেষ্টা চালাই। আমাদের সিস্টেম এনক্রিপ্টেড এবং নিরাপদ।
                  </p>

                  <h2>৪. কুকিজ</h2>
                  <p>
                    আমরা আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করি। আপনি চাইলে কুকিজ নিষ্ক্রিয় করতে পারেন।
                  </p>

                  <h2>৫. তথ্য অ্যাক্সেস</h2>
                  <p>
                    আপনি যেকোনো সময় আপনার সংরক্ষিত তথ্য দেখতে এবং পরিবর্তন করতে পারবেন আপনার প্রোফাইল সেটিংস থেকে।
                  </p>

                  <h2>৬. নীতিমালা পরিবর্তন</h2>
                  <p>
                    আমরা সময়ে সময়ে এই নীতিমালা আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা আপনাকে জানাবো।
                  </p>

                  <h2>৭. যোগাযোগ</h2>
                  <p>
                    এই নীতিমালা সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
                  </p>
                </>
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

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Terms = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("page_contents")
      .select("*")
      .eq("page_slug", "terms")
      .maybeSingle();
    
    if (data) setContent(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-6">Terms & Conditions</h1>
          
          <Card>
            <CardContent className="prose prose-sm md:prose max-w-none p-6">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <>
                  <h2>১. সাধারণ শর্তাবলী</h2>
                  <p>
                    BD Games Bazar এর সেবা ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীর সাথে একমত না হন, তাহলে দয়া করে এই সেবা ব্যবহার করবেন না।
                  </p>

                  <h2>২. পণ্য ও সেবা</h2>
                  <p>
                    আমরা বিভিন্ন গেমিং ভাউচার, ডায়মন্ড এবং গিফট কার্ড বিক্রয় করি। সকল পণ্য ডিজিটাল এবং পেমেন্ট সম্পন্ন হওয়ার পরে তাৎক্ষণিক ডেলিভারি করা হয়।
                  </p>

                  <h2>৩. পেমেন্ট</h2>
                  <p>
                    পেমেন্ট সম্পন্ন হওয়ার পরে কোন রিফান্ড বা এক্সচেঞ্জ করা যাবে না। পেমেন্ট করার আগে অবশ্যই সকল তথ্য সঠিক কিনা যাচাই করে নিন।
                  </p>

                  <h2>৪. ডেলিভারি</h2>
                  <p>
                    পেমেন্ট সফল হওয়ার সাথে সাথেই আপনার অ্যাকাউন্টে কোড ডেলিভারি করা হয়। সাধারণত এটি ১ মিনিটের মধ্যে সম্পন্ন হয়।
                  </p>

                  <h2>৫. অ্যাকাউন্ট নিরাপত্তা</h2>
                  <p>
                    আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখার দায়িত্ব আপনার। পাসওয়ার্ড কাউকে শেয়ার করবেন না।
                  </p>

                  <h2>৬. যোগাযোগ</h2>
                  <p>
                    যেকোনো সমস্যার জন্য আমাদের কাস্টমার সাপোর্টের সাথে যোগাযোগ করুন। আমরা সর্বদা সাহায্য করতে প্রস্তুত।
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

export default Terms;

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

const Help = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("page_contents")
      .select("*")
      .eq("page_slug", "help")
      .maybeSingle();
    
    if (data) setContent(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-6">Help Center</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>কিভাবে পেমেন্ট করবো?</AccordionTrigger>
                    <AccordionContent>
                      আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>কত সময়ে ডেলিভারি পাবো?</AccordionTrigger>
                    <AccordionContent>
                      পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>রিফান্ড পলিসি কি?</AccordionTrigger>
                    <AccordionContent>
                      একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>কাস্টমার সাপোর্ট কিভাবে পাবো?</AccordionTrigger>
                    <AccordionContent>
                      আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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

export default Help;

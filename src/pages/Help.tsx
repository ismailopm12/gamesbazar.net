import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

// Define FAQ item type
interface FAQItem {
  question: string;
  answer: string;
}

const Help = () => {
  const [content, setContent] = useState<PageContent | null>(null);

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

  // Parse FAQ items from content
  const parseFAQs = (): FAQItem[] => {
    if (!content || !content.content) {
      return [
        { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
        { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
        { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
        { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
      ];
    }

    try {
      // Extract FAQ items from the content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content.content, 'text/html');
      const faqItems: FAQItem[] = [];
      
      doc.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question')?.textContent || '';
        const answer = item.querySelector('.faq-answer')?.textContent || '';
        if (question && answer) {
          faqItems.push({ question, answer });
        }
      });
      
      return faqItems.length > 0 ? faqItems : [
        { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
        { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
        { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
        { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
      ];
    } catch (e) {
      console.log("Could not parse FAQ content, using defaults");
      return [
        { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
        { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
        { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
        { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
      ];
    }
  };

  const faqs = parseFAQs();

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
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
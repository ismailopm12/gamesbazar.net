import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Define FAQ item type
interface FAQItem {
  question: string;
  answer: string;
}

const PageContentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState("help");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
    { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
    { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
    { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
  ]);
  const { toast } = useToast();

  const pages = [
    { value: "help", label: "Help Center" },
    { value: "contact", label: "Contact Us" },
    { value: "terms", label: "Terms & Conditions" },
    { value: "privacy", label: "Privacy Policy" },
    { value: "footer", label: "Footer Copyright" },
  ];

  useEffect(() => {
    fetchContent();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('page_contents_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_contents',
        },
        (payload) => {
          console.log('New page content inserted:', payload);
          if (payload.new.page_slug === selectedPage) {
            fetchContent();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'page_contents',
        },
        (payload) => {
          console.log('Page content updated:', payload);
          if (payload.new.page_slug === selectedPage) {
            fetchContent();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'page_contents',
        },
        (payload) => {
          console.log('Page content deleted:', payload);
          if (payload.old.page_slug === selectedPage) {
            fetchContent();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPage]);

  const fetchContent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("page_contents")
      .select("*")
      .eq("page_slug", selectedPage)
      .maybeSingle();

    if (data) {
      setTitle(data.title || "");
      setContent(data.content || "");
      
      // If this is the help page, try to parse FAQ content
      if (selectedPage === "help" && data.content) {
        try {
          // Extract FAQ items from the content
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.content, 'text/html');
          const faqItems: FAQItem[] = [];
          
          doc.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question')?.textContent || '';
            const answer = item.querySelector('.faq-answer')?.textContent || '';
            if (question && answer) {
              faqItems.push({ question, answer });
            }
          });
          
          if (faqItems.length > 0) {
            setFaqs(faqItems);
          }
        } catch (e) {
          console.log("Could not parse FAQ content, using defaults");
        }
      }
    } else {
      setTitle("");
      setContent("");
      
      // Reset to default FAQs for help page
      if (selectedPage === "help") {
        setFaqs([
          { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
          { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
          { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
          { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
        ]);
      }
      
      // Set default titles for other pages
      if (selectedPage === "contact") {
        setTitle("Contact Us");
        setContent("© 2025 BD Games Bazar. All rights reserved. 🎮\nEmail: support@bdgamesbazar.com\nWhatsApp: +880 XXX XXX XXXX\nFacebook: /bdgamesbazar");
      } else if (selectedPage === "terms") {
        setTitle("Terms & Conditions");
      } else if (selectedPage === "privacy") {
        setTitle("Privacy Policy");
      } else if (selectedPage === "footer") {
        setTitle("Footer Copyright");
        setContent("© 2025 BD Games Bazar. All rights reserved. 🎮");
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // For help page, generate FAQ content
    let finalContent = content;
    if (selectedPage === "help") {
      finalContent = `
        <div class="faq-container">
          ${faqs.map(faq => `
            <div class="faq-item">
              <div class="faq-question">${faq.question}</div>
              <div class="faq-answer">${faq.answer}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    const { data: existing } = await supabase
      .from("page_contents")
      .select("id")
      .eq("page_slug", selectedPage)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("page_contents")
        .update({ title, content: finalContent })
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("page_contents")
        .insert({ page_slug: selectedPage, title, content: finalContent });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save content: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Content saved successfully",
      });
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("page_contents")
      .select("id")
      .eq("page_slug", selectedPage)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("page_contents")
        .delete()
        .eq("id", existing.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete content: " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
        // Reset form after deletion
        setTitle("");
        setContent("");
        
        // Reset to default FAQs for help page
        if (selectedPage === "help") {
          setFaqs([
            { question: "কিভাবে পেমেন্ট করবো?", answer: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।" },
            { question: "কত সময়ে ডেলিভারি পাবো?", answer: "পেমেন্ট কমপ্লিট হওয়ার সাথে সাথেই আপনি আপনার কোড পেয়ে যাবেন। সাধারণত ১ মিনিটের মধ্যে অটোমেটিক ডেলিভারি হয়।" },
            { question: "রিফান্ড পলিসি কি?", answer: "একবার কোড ডেলিভারি হয়ে গেলে রিফান্ড দেওয়া সম্ভব নয়। তবে যদি কোনো সমস্যা হয় তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।" },
            { question: "কাস্টমার সাপোর্ট কিভাবে পাবো?", answer: "আপনি আমাদের WhatsApp, Facebook বা Email এর মাধ্যমে যোগাযোগ করতে পারবেন। সাপোর্ট টিম ২৪/৭ উপলব্ধ আছে।" }
          ]);
        }
      }
    } else {
      toast({
        title: "Info",
        description: "No content found to delete",
      });
    }

    setSaving(false);
  };

  // FAQ management functions
  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Content Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Page</Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {selectedPage !== "footer" && selectedPage !== "help" && (
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
            )}

            {selectedPage === "help" ? (
              // FAQ Management for Help page
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Frequently Asked Questions</Label>
                  <Button onClick={addFAQ} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">FAQ #{index + 1}</h3>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeFAQ(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                      </div>
                      <div>
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Enter answer"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Plain text editor for other pages
              <div>
                <Label htmlFor="content">
                  {selectedPage === "footer" ? "Copyright Text" : "Content"}
                </Label>
                <Textarea
                  id="content"
                  rows={selectedPage === "footer" ? 3 : 10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={selectedPage === "footer" ? "Enter copyright text" : "Enter page content"}
                  className="font-mono text-sm"
                />
                
                {/* Show default content hint for new pages */}
                {(!content || content.trim() === "") && selectedPage !== "footer" && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Default Content:</p>
                    {selectedPage === "contact" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        © 2025 BD Games Bazar. All rights reserved. 🎮<br />
                        Email: support@bdgamesbazar.com<br />
                        WhatsApp: +880 XXX XXX XXXX<br />
                        Facebook: /bdgamesbazar
                      </p>
                    )}
                    {selectedPage === "terms" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Terms and Conditions content will appear here...
                      </p>
                    )}
                    {selectedPage === "privacy" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Privacy Policy content will appear here...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Content"
                )}
              </Button>
              
              <Button 
                onClick={handleDelete} 
                disabled={saving} 
                variant="destructive"
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Content"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PageContentManagement;
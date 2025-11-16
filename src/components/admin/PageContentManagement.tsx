import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PageContentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState("help");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  const pages = [
    { value: "help", label: "Help Center" },
    { value: "contact", label: "Contact Us" },
    { value: "terms", label: "Terms & Conditions" },
    { value: "privacy", label: "Privacy Policy" },
  ];

  useEffect(() => {
    fetchContent();
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
    } else {
      setTitle("");
      setContent("");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { data: existing } = await supabase
      .from("page_contents")
      .select("id")
      .eq("page_slug", selectedPage)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("page_contents")
        .update({ title, content })
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("page_contents")
        .insert({ page_slug: selectedPage, title, content });
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
      }
    } else {
      toast({
        title: "Info",
        description: "No content found to delete",
      });
    }

    setSaving(false);
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
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>

            <div>
              <Label htmlFor="content">Content (HTML Supported)</Label>
              <Textarea
                id="content"
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter page content (HTML tags supported)"
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You can use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt;&lt;p&gt;Paragraph text&lt;/p&gt;
              </p>
            </div>

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

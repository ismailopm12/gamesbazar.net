import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash } from "lucide-react";

// Define SEO settings interface
interface SEOSettings {
  id: string;
  page_path: string;
  title: string;
  description: string | null;
  keywords: string | null;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  og_type: string | null;
  og_url: string | null;
  twitter_card: string | null;
  twitter_site: string | null;
  twitter_creator: string | null;
  canonical_url: string | null;
  robots: string | null;
  author: string | null;
  viewport: string | null;
  theme_color: string | null;
  mobile_web_app_capable: string | null;
  apple_mobile_web_app_title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const SEOManagement = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<SEOSettings | null>(null);
  const [formData, setFormData] = useState({
    page_path: "",
    title: "",
    description: "",
    keywords: "",
    og_image: "",
    og_title: "",
    og_description: "",
    og_type: "website",
    og_url: "",
    twitter_card: "summary_large_image",
    twitter_site: "",
    twitter_creator: "",
    canonical_url: "",
    robots: "index, follow",
    author: "",
    viewport: "width=device-width, initial-scale=1",
    theme_color: "",
    mobile_web_app_capable: "yes",
    apple_mobile_web_app_title: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSeoSettings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSettings) {
        const { error } = await supabase
          .from("seo_settings")
          .update(formData)
          .eq("id", editingSettings.id);
        if (error) throw error;
        toast({ title: "SEO settings updated successfully" });
      } else {
        const { error } = await supabase.from("seo_settings").insert(formData);
        if (error) throw error;
        toast({ title: "SEO settings created successfully" });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchSeoSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("seo_settings").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "SEO settings deleted successfully" });
      fetchSeoSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      page_path: "",
      title: "",
      description: "",
      keywords: "",
      og_image: "",
      og_title: "",
      og_description: "",
      og_type: "website",
      og_url: "",
      twitter_card: "summary_large_image",
      twitter_site: "",
      twitter_creator: "",
      canonical_url: "",
      robots: "index, follow",
      author: "",
      viewport: "width=device-width, initial-scale=1",
      theme_color: "",
      mobile_web_app_capable: "yes",
      apple_mobile_web_app_title: "",
    });
    setEditingSettings(null);
  };

  const openEditDialog = (settings: SEOSettings) => {
    setEditingSettings(settings);
    setFormData({
      page_path: settings.page_path,
      title: settings.title,
      description: settings.description || "",
      keywords: settings.keywords || "",
      og_image: settings.og_image || "",
      og_title: settings.og_title || "",
      og_description: settings.og_description || "",
      og_type: settings.og_type || "website",
      og_url: settings.og_url || "",
      twitter_card: settings.twitter_card || "summary_large_image",
      twitter_site: settings.twitter_site || "",
      twitter_creator: settings.twitter_creator || "",
      canonical_url: settings.canonical_url || "",
      robots: settings.robots || "index, follow",
      author: settings.author || "",
      viewport: settings.viewport || "width=device-width, initial-scale=1",
      theme_color: settings.theme_color || "",
      mobile_web_app_capable: settings.mobile_web_app_capable || "yes",
      apple_mobile_web_app_title: settings.apple_mobile_web_app_title || "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>SEO Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add SEO Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSettings ? "Edit" : "Add"} SEO Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                  <TabsTrigger value="open-graph">Open Graph</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label>Page Path</Label>
                    <Input
                      value={formData.page_path}
                      onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                      required
                      placeholder="/"
                      disabled={!!editingSettings}
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label>Keywords</Label>
                    <Input
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <div>
                    <Label>OG Image URL</Label>
                    <Input
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="open-graph" className="space-y-4 mt-4">
                  <div>
                    <Label>OG Title</Label>
                    <Input
                      value={formData.og_title}
                      onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                      placeholder="Open Graph title"
                    />
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <Textarea
                      value={formData.og_description}
                      onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                      rows={3}
                      placeholder="Open Graph description"
                    />
                  </div>
                  <div>
                    <Label>OG Type</Label>
                    <Input
                      value={formData.og_type}
                      onChange={(e) => setFormData({ ...formData, og_type: e.target.value })}
                      placeholder="website"
                    />
                  </div>
                  <div>
                    <Label>OG URL</Label>
                    <Input
                      value={formData.og_url}
                      onChange={(e) => setFormData({ ...formData, og_url: e.target.value })}
                      placeholder="https://example.com/page"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="twitter" className="space-y-4 mt-4">
                  <div>
                    <Label>Twitter Card</Label>
                    <Input
                      value={formData.twitter_card}
                      onChange={(e) => setFormData({ ...formData, twitter_card: e.target.value })}
                      placeholder="summary_large_image"
                    />
                  </div>
                  <div>
                    <Label>Twitter Site</Label>
                    <Input
                      value={formData.twitter_site}
                      onChange={(e) => setFormData({ ...formData, twitter_site: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label>Twitter Creator</Label>
                    <Input
                      value={formData.twitter_creator}
                      onChange={(e) => setFormData({ ...formData, twitter_creator: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div>
                    <Label>Canonical URL</Label>
                    <Input
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      placeholder="https://example.com/canonical"
                    />
                  </div>
                  <div>
                    <Label>Robots</Label>
                    <Input
                      value={formData.robots}
                      onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                      placeholder="index, follow"
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label>Viewport</Label>
                    <Input
                      value={formData.viewport}
                      onChange={(e) => setFormData({ ...formData, viewport: e.target.value })}
                      placeholder="width=device-width, initial-scale=1"
                    />
                  </div>
                  <div>
                    <Label>Theme Color</Label>
                    <Input
                      value={formData.theme_color}
                      onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                  <div>
                    <Label>Mobile Web App Capable</Label>
                    <Input
                      value={formData.mobile_web_app_capable}
                      onChange={(e) => setFormData({ ...formData, mobile_web_app_capable: e.target.value })}
                      placeholder="yes"
                    />
                  </div>
                  <div>
                    <Label>Apple Mobile Web App Title</Label>
                    <Input
                      value={formData.apple_mobile_web_app_title}
                      onChange={(e) => setFormData({ ...formData, apple_mobile_web_app_title: e.target.value })}
                      placeholder="App Title"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button type="submit" className="w-full">
                {editingSettings ? "Update" : "Create"} SEO Settings
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seoSettings.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell className="font-mono">{setting.page_path}</TableCell>
                <TableCell>{setting.title}</TableCell>
                <TableCell className="max-w-xs truncate">{setting.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(setting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(setting.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SEOManagement;
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash } from "lucide-react";

const SEOManagement = () => {
  const [seoSettings, setSeoSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    page_path: "",
    title: "",
    description: "",
    keywords: "",
    og_image: "",
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
    });
    setEditingSettings(null);
  };

  const openEditDialog = (settings: any) => {
    setEditingSettings(settings);
    setFormData({
      page_path: settings.page_path,
      title: settings.title,
      description: settings.description || "",
      keywords: settings.keywords || "",
      og_image: settings.og_image || "",
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSettings ? "Edit" : "Add"} SEO Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const PaymentURLManagement = () => {
  const [paymentUrls, setPaymentUrls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    payment_method: "",
    payment_url: "",
    instructions: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentUrls();
  }, []);

  const fetchPaymentUrls = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_urls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentUrls(data || []);
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
      if (editingId) {
        const { error } = await supabase
          .from("payment_urls")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Payment URL updated successfully" });
      } else {
        const { error } = await supabase
          .from("payment_urls")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Payment URL added successfully" });
      }

      resetForm();
      fetchPaymentUrls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (url: any) => {
    setEditingId(url.id);
    setFormData({
      payment_method: url.payment_method,
      payment_url: url.payment_url,
      instructions: url.instructions || "",
      is_active: url.is_active
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment URL?")) return;

    try {
      const { error } = await supabase
        .from("payment_urls")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Payment URL deleted successfully" });
      fetchPaymentUrls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      payment_method: "",
      payment_url: "",
      instructions: "",
      is_active: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="glass-effect border-primary/20 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl gradient-text">
            {editingId ? "Edit Payment URL" : "Add Payment URL"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  placeholder="e.g., Uddokta Pay"
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_url">Payment URL</Label>
                <Input
                  id="payment_url"
                  type="url"
                  value={formData.payment_url}
                  onChange={(e) => setFormData({ ...formData, payment_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Payment instructions for users..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Update" : "Add"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-effect border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl gradient-text">Payment URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentUrls.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payment URLs configured</p>
            ) : (
              paymentUrls.map((url) => (
                <Card key={url.id} className="bg-muted/30">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">{url.payment_method}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{url.payment_url}</p>
                        {url.instructions && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{url.instructions}</p>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${
                          url.is_active ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                        }`}>
                          {url.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2 self-end md:self-auto">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(url)}>
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(url.id)}>
                          <Trash className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentURLManagement;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash2, Package } from "lucide-react";

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    product_variant_id: "",
    code: "",
  });
  const [bulkFormData, setBulkFormData] = useState({
    product_variant_id: "",
    quantity: 1,
    prefix: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchers();
    fetchVariants();
  }, []);

  useEffect(() => {
    if (editingVoucher) {
      setFormData({
        product_variant_id: editingVoucher.product_variant_id,
        code: editingVoucher.code,
      });
    } else {
      setFormData({
        product_variant_id: "",
        code: "",
      });
    }
  }, [editingVoucher]);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from("voucher_codes")
        .select(`
          *,
          product_variants(name, products(name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
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

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*, products(name)");

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        // Update existing voucher
        const { error } = await supabase
          .from("voucher_codes")
          .update(formData)
          .eq("id", editingVoucher.id);
        
        if (error) throw error;
        toast({ title: "Voucher code updated successfully" });
      } else {
        // Create new voucher
        const { error } = await supabase.from("voucher_codes").insert(formData);
        if (error) throw error;
        toast({ title: "Voucher code added successfully" });
      }
      
      setIsDialogOpen(false);
      setEditingVoucher(null);
      setFormData({ product_variant_id: "", code: "" });
      fetchVouchers();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate multiple voucher codes
      const newVouchers = [];
      for (let i = 1; i <= bulkFormData.quantity; i++) {
        const code = bulkFormData.prefix 
          ? `${bulkFormData.prefix}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
          : Math.random().toString(36).substr(2, 10).toUpperCase();
        
        newVouchers.push({
          product_variant_id: bulkFormData.product_variant_id,
          code: code,
          status: "available"
        });
      }

      const { error } = await supabase.from("voucher_codes").insert(newVouchers);
      if (error) throw error;
      
      toast({ title: `${bulkFormData.quantity} voucher codes added successfully` });
      setIsBulkAddDialogOpen(false);
      setBulkFormData({ product_variant_id: "", quantity: 1, prefix: "" });
      fetchVouchers();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("voucher_codes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Voucher code deleted successfully" });
      fetchVouchers();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (voucher: typeof vouchers[0]) => {
    setEditingVoucher(voucher);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVoucher(null);
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
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>Voucher Code Management</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full sm:w-auto">
                <Package className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Voucher Codes in Bulk</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBulkAdd} className="space-y-4">
                <div>
                  <Label>Product Variant</Label>
                  <Select
                    value={bulkFormData.product_variant_id}
                    onValueChange={(value) =>
                      setBulkFormData({ ...bulkFormData, product_variant_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant: typeof variants[0]) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.products.name} - {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={bulkFormData.quantity}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label>Prefix (Optional)</Label>
                  <Input
                    value={bulkFormData.prefix}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, prefix: e.target.value })}
                    placeholder="e.g., DIAMOND"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add {bulkFormData.quantity} Voucher Codes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingVoucher(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Voucher Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVoucher ? "Edit Voucher Code" : "Add Voucher Code"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Product Variant</Label>
                  <Select
                    value={formData.product_variant_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_variant_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant: typeof variants[0]) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.products.name} - {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Voucher Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="Enter voucher code"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingVoucher ? "Update Voucher Code" : "Add Voucher Code"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Product</TableHead>
                <TableHead className="whitespace-nowrap">Code</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher: typeof vouchers[0]) => (
                <TableRow key={voucher.id}>
                  <TableCell className="max-w-[150px] truncate">
                    {voucher.product_variants?.products?.name} - {voucher.product_variants?.name}
                  </TableCell>
                  <TableCell className="font-mono max-w-[120px] truncate">{voucher.code}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        voucher.status === "available"
                          ? "default"
                          : voucher.status === "delivered"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {voucher.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(voucher.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(voucher)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(voucher.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherManagement;
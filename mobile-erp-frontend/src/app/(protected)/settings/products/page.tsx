"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Package, Plus, Search, Smartphone, Tag, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  id: number;
  name: string;
  productCategoryId: number;
  hasIMEI: boolean;
  sku: string;
  imageLink: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    productCategoryId: "",
    hasIMEI: true,
    sku: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        apiFetch("/setup/products"),
        apiFetch("/setup/categories"),
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (error: any) {
      toast.error("Failed to load products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.productCategoryId) {
      toast.error("Name and Category are required.");
      return;
    }
    try {
      await apiFetch("/setup/products", {
        method: "POST",
        body: JSON.stringify({
          ...newProduct,
          productCategoryId: parseInt(newProduct.productCategoryId),
          comId: 1
        }),
      });
      toast.success("Product added to catalog!");
      setIsAddOpen(false);
      setNewProduct({ name: "", productCategoryId: "", hasIMEI: true, sku: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Define and manage items in your master database.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Define New Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Product to Master</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g. Samsung 25W Adapter" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={newProduct.productCategoryId}
                      onChange={e => setNewProduct({...newProduct, productCategoryId: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>SKU / Model No</Label>
                    <Input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Checkbox id="hasImei" checked={newProduct.hasIMEI} onCheckedChange={(c) => setNewProduct({...newProduct, hasIMEI: !!c})} />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="hasImei" className="text-sm font-bold text-blue-900 leading-none">Track by IMEI/Serial?</label>
                    <p className="text-xs text-blue-600">Enable this for Phones and Tablets.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Master Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or SKU..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading catalog...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No products defined yet.</TableCell></TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium flex items-center">
                      <div className="h-8 w-8 bg-slate-100 rounded mr-3 flex items-center justify-center">
                         <Package className="h-4 w-4 text-slate-400" />
                      </div>
                      {p.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku || "N/A"}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[10px] uppercase">{categories.find(c => c.id === p.productCategoryId)?.name || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                       {p.hasIMEI ? (
                         <Badge className="bg-blue-100 text-blue-700 border-none">IMEI / Serial</Badge>
                       ) : (
                         <Badge className="bg-slate-100 text-slate-600 border-none">Quantity Only</Badge>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Trash2, Save, UserPlus, Smartphone, Copy, History, ShieldCheck, Box } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Contact { id: number; name: string; isSupplier: boolean; }
interface MobileDevice { id: number; brand: string; modelName: string; defaultCostPrice: number; defaultSalesPrice: number; }
interface ProductCategory { id: number; name: string; }

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: "" as string | number,
    invoiceNo: "",
    paidAmount: 0,
    items: [] as any[]
  });

  useEffect(() => { fetchBaseData(); }, []);

  const fetchBaseData = async () => {
    try {
      const [sData, dData, cData] = await Promise.all([
        apiFetch("/setup/suppliers"),
        apiFetch("/setup/mobile-devices?pageSize=1000"),
        apiFetch("/setup/categories")
      ]);
      setSuppliers(sData.items || sData);
      setDevices(dData.items || dData);
      setCategories(cData);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        mobileDeviceId: "", 
        imeiList: "", 
        costPrice: 0, 
        salePrice: 0, 
        condition: "New", 
        boxStatus: "Intact", 
        isOfficial: true, 
        warrantyMonths: 12 
      }]
    }));
  };

  const duplicateItem = (item: any) => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...item, imeiList: "" }] }));
    toast.info("Model details copied. Paste new IMEIs.");
  };

  const removeItem = (idx: number) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setFormData(prev => {
        const newItems = [...prev.items];
        let updatedItem = { ...newItems[idx], [field]: value };
        if (field === "mobileDeviceId") {
            const device = devices.find(d => d.id === value);
            if (device) { updatedItem.costPrice = device.defaultCostPrice; updatedItem.salePrice = device.defaultSalesPrice; }
        }
        newItems[idx] = updatedItem;
        return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!formData.supplierId) { toast.error("Select a supplier."); setIsSaving(false); return; }
    if (formData.items.length === 0) { toast.error("Add at least one item."); setIsSaving(false); return; }

    try {
      await apiFetch("/erp/purchase", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          supplierId: typeof formData.supplierId === "string" ? parseInt(formData.supplierId) : formData.supplierId,
          items: formData.items.map(i => ({
            mobileDeviceId: parseInt(i.mobileDeviceId),
            ImeiItems: i.imeiList.split(/[\n,\s]+/).filter(Boolean).map((imei: string) => ({ IMEI1: imei, IMEI2: "", SerialNumber: "" })),
            costPrice: parseFloat(i.costPrice),
            salePrice: parseFloat(i.salePrice),
            condition: i.condition,
            boxStatus: i.boxStatus,
            isOfficial: i.isOfficial === "true" || i.isOfficial === true,
            warrantyMonths: parseInt(i.warrantyMonths || 0)
          }))
        }),
      });
      toast.success("Purchase recorded successfully!");
      router.push("/purchases");
    } catch (error: any) {
      toast.error("Failed to save purchase: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Initializing Purchase Module...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Stock Purchase</h1>
          <p className="text-muted-foreground">Inbound inventory management with IMEI tracking.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/purchases")}><History className="mr-2 h-4 w-4" /> View History</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="bg-blue-50/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-blue-600" /> Supplier & Invoice</CardTitle>
              <Button type="button" variant="ghost" size="sm" className="text-blue-600 font-bold" onClick={() => setIsQuickAddOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" /> New Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Supplier Name</Label>
              <SearchableSelect options={suppliers.map(s => ({ label: s.name, value: s.id }))} value={formData.supplierId} onChange={val => setFormData(prev => ({...prev, supplierId: val}))} placeholder="Search Supplier..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Invoice No.</Label>
              <Input placeholder="Leave blank for auto-gen" value={formData.invoiceNo} onChange={e => setFormData(prev => ({...prev, invoiceNo: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground text-green-600">Initial Payment</Label>
              <Input type="number" value={formData.paidAmount} onChange={e => setFormData(prev => ({...prev, paidAmount: parseFloat(e.target.value) || 0}))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" /> Product Details & IMEIs</CardTitle>
            <Button type="button" variant="default" size="sm" onClick={addItem} className="shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Add Bulk Row
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px] pl-6">Model</TableHead>
                  <TableHead className="w-[180px]">Attributes</TableHead>
                  <TableHead className="w-[300px]">Bulk IMEIs (Scanning Mode)</TableHead>
                  <TableHead className="w-[120px] text-right">Pricing (৳)</TableHead>
                  <TableHead className="w-[80px] text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No products added yet. Click 'Add Bulk Row' to begin.</TableCell></TableRow>
                ) : (
                  formData.items.map((item, idx) => (
                    <TableRow key={idx} className="group hover:bg-muted/20">
                      <TableCell className="pl-6 align-top pt-4">
                        <SearchableSelect options={devices.map(d => ({ label: `${d.brand} ${d.modelName}`, value: d.id }))} value={item.mobileDeviceId} onChange={val => updateItem(idx, "mobileDeviceId", val)} placeholder="Select Device..." />
                      </TableCell>
                      <TableCell className="align-top pt-4 space-y-2">
                         <div className="flex gap-1 flex-wrap">
                            <Select value={item.condition} onValueChange={v => updateItem(idx, "condition", v)}>
                                <SelectTrigger className="h-7 text-[10px] w-[85px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="New">Brand New</SelectItem><SelectItem value="Used">Pre-owned</SelectItem></SelectContent>
                            </Select>
                            <Select value={item.isOfficial.toString()} onValueChange={v => updateItem(idx, "isOfficial", v)}>
                                <SelectTrigger className="h-7 text-[10px] w-[85px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="true">Official</SelectItem><SelectItem value="false">Unofficial</SelectItem></SelectContent>
                            </Select>
                            <Select value={item.boxStatus} onValueChange={v => updateItem(idx, "boxStatus", v)}>
                                <SelectTrigger className="h-7 text-[10px] w-[85px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Intact">Intact/Box</SelectItem><SelectItem value="WithBox">With Box</SelectItem><SelectItem value="NoBox">No Box</SelectItem></SelectContent>
                            </Select>
                         </div>
                         <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                            <Input type="number" className="h-7 text-[10px] w-[60px]" value={item.warrantyMonths} onChange={e => updateItem(idx, "warrantyMonths", e.target.value)} title="Warranty Months" />
                            <span className="text-[10px] text-muted-foreground">Months</span>
                         </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <textarea placeholder="Paste or Scan IMEIs here..." className="w-full min-h-[100px] p-3 border rounded-md font-mono text-xs bg-background resize-none focus:ring-1 focus:ring-primary" value={item.imeiList} onChange={e => updateItem(idx, "imeiList", e.target.value)} required />
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Units: {item.imeiList ? item.imeiList.split(/[\n,\s]+/).filter(Boolean).length : 0}</span>
                            <span className="text-[10px] text-muted-foreground">1 IMEI per line</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4 space-y-2">
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold opacity-50">Cost</Label>
                            <Input type="number" className="h-8 text-right font-mono" value={item.costPrice} onChange={e => updateItem(idx, "costPrice", e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold opacity-50">Retail</Label>
                            <Input type="number" className="h-8 text-right font-mono text-green-600" value={item.salePrice} onChange={e => updateItem(idx, "salePrice", e.target.value)} required />
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 align-top pt-4">
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-blue-600" onClick={() => duplicateItem(item)}><Copy className="h-4 w-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t justify-between py-6">
             <div className="flex gap-8 items-center px-4">
                <div className="text-sm">Total Models: <span className="font-bold">{formData.items.length}</span></div>
                <div className="text-sm">Total Units: <span className="font-bold">{formData.items.reduce((acc, item) => acc + (item.imeiList ? item.imeiList.split(/[\n,\s]+/).filter(Boolean).length : 0), 0)}</span></div>
             </div>
             <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 px-12 font-bold shadow-lg" disabled={isSaving}>
               {isSaving ? "Finalizing Transaction..." : <><Save className="mr-2 h-5 w-5" /> Confirm & Complete Purchase</>}
             </Button>
          </CardFooter>
        </Card>
      </form>

      <QuickAddContact isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSuccess={(c) => { setSuppliers(prev => [...prev, c]); setFormData(prev => ({...prev, supplierId: c.id})); }} defaultRole="Supplier" />
    </div>
  );
}

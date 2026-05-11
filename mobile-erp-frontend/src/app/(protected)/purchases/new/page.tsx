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
import { Truck, Plus, Trash2, Save, UserPlus, Smartphone, Copy, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface Contact {
  id: number;
  name: string;
  isSupplier: boolean;
}

interface MobileDevice {
  id: number;
  brand: string;
  modelName: string;
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: "" as string | number,
    invoiceNo: "",
    paidAmount: 0,
    items: [] as any[]
  });

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const [sData, dData] = await Promise.all([
        apiFetch("/setup/suppliers"),
        apiFetch("/setup/mobile-devices"),
      ]);
      setSuppliers(sData);
      setDevices(dData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { mobileDeviceId: "", imei1: "", imei2: "", costPrice: 0, salePrice: 0, commissionAmount: 0 }]
    });
  };

  const duplicateItem = (item: any) => {
    setFormData({
      ...formData,
      items: [...formData.items, { ...item, imei1: "", imei2: "" }]
    });
    toast.info("Model details copied to new row. Enter IMEI.");
  };

  const removeItem = (idx: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || formData.items.length === 0) {
      toast.error("Supplier and at least one item are required.");
      return;
    }

    // Validation for IMEIs
    if (formData.items.some(i => !i.imei1)) {
        toast.error("All items must have at least IMEI 1.");
        return;
    }

    try {
      await apiFetch("/erp/purchase", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          supplierId: typeof formData.supplierId === "string" ? parseInt(formData.supplierId) : formData.supplierId,
          items: formData.items.map(i => ({
            ...i,
            mobileDeviceId: parseInt(i.mobileDeviceId),
            costPrice: parseFloat(i.costPrice),
            salePrice: parseFloat(i.salePrice),
            commissionAmount: parseFloat(i.commissionAmount)
          }))
        }),
      });
      toast.success("Purchase recorded successfully!");
      router.push("/inventory");
    } catch (error: any) {
      toast.error("Failed to save purchase: " + error.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading form data...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Purchase</h1>
          <p className="text-muted-foreground">Multiple Products & Batch IMEIs Support.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center"><Truck className="mr-2 h-5 w-5 text-blue-600" /> Supplier Information</CardTitle>
              <Button type="button" variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200" onClick={() => setIsQuickAddOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" /> Quick Add Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Select Supplier</Label>
              <SearchableSelect 
                options={suppliers.map(s => ({ label: s.name, value: s.id }))}
                value={formData.supplierId}
                onChange={val => setFormData({...formData, supplierId: val})}
                placeholder="Search Supplier..."
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice / Ref No.</Label>
              <Input placeholder="e.g. PUR-10023" value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <Input type="number" placeholder="0.00" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-blue-50/30">
            <CardTitle className="text-sm font-bold flex items-center"><Smartphone className="mr-2 h-5 w-5 text-blue-600" /> Items & IMEIs</CardTitle>
            <Button type="button" variant="default" size="sm" onClick={addItem} className="bg-blue-600">
              <Plus className="mr-2 h-4 w-4" /> Add New Row
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[30%] pl-6">Device Model</TableHead>
                  <TableHead>IMEI 1 (Required)</TableHead>
                  <TableHead>IMEI 2</TableHead>
                  <TableHead className="w-[12%] text-right">Cost Price</TableHead>
                  <TableHead className="w-[12%] text-right">Sale Price</TableHead>
                  <TableHead className="w-[10%] text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No products added. Click "Add New Row" to start scanning IMEIs.</TableCell></TableRow>
                ) : (
                  formData.items.map((item, idx) => (
                    <TableRow key={idx} className="group hover:bg-slate-50/50">
                      <TableCell className="pl-6">
                        <SearchableSelect 
                          className="h-9 text-xs"
                          options={devices.map(d => ({ label: `${d.brand} ${d.modelName}`, value: d.id }))}
                          value={item.mobileDeviceId}
                          onChange={val => {
                            const newItems = [...formData.items];
                            newItems[idx].mobileDeviceId = val;
                            setFormData({...formData, items: newItems});
                          }}
                          placeholder="Search Device..."
                        />
                      </TableCell>
                      <TableCell><Input placeholder="Scan IMEI 1" className="h-9 font-mono bg-white" value={item.imei1} onChange={e => { const newItems = [...formData.items]; newItems[idx].imei1 = e.target.value; setFormData({...formData, items: newItems}); }} required /></TableCell>
                      <TableCell><Input placeholder="IMEI 2" className="h-9 font-mono bg-white" value={item.imei2} onChange={e => { const newItems = [...formData.items]; newItems[idx].imei2 = e.target.value; setFormData({...formData, items: newItems}); }} /></TableCell>
                      <TableCell><Input type="number" className="h-9 text-right bg-white" value={item.costPrice} onChange={e => { const newItems = [...formData.items]; newItems[idx].costPrice = e.target.value; setFormData({...formData, items: newItems}); }} required /></TableCell>
                      <TableCell><Input type="number" className="h-9 text-right bg-white" value={item.salePrice} onChange={e => { const newItems = [...formData.items]; newItems[idx].salePrice = e.target.value; setFormData({...formData, items: newItems}); }} required /></TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Duplicate row for same model" onClick={() => duplicateItem(item)}><Copy className="h-3.5 w-3.5" /></Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t justify-between py-4 px-6">
             <div className="text-sm font-medium text-slate-500">
                Total Items: <span className="text-slate-900 font-bold">{formData.items.length}</span>
             </div>
             <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md">
               <Save className="mr-2 h-4 w-4" /> Finalize Purchase
             </Button>
          </CardFooter>
        </Card>
      </form>

      <QuickAddContact 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onSuccess={(c) => {
          setSuppliers([...suppliers, c]);
          setFormData({...formData, supplierId: c.id});
        }} 
        defaultRole="Supplier"
      />
    </div>
  );
}

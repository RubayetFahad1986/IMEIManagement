"use client";

import { useEffect, useState, use } from "react";
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
import { Truck, Plus, Trash2, Save, UserPlus, Smartphone, Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { SearchableSelect } from "@/components/ui/searchable-select";
import Link from "next/link";

interface Contact {
  id: number;
  name: string;
  isSupplier: boolean;
}

interface MobileDevice {
  id: number;
  brand: string;
  modelName: string;
  defaultCostPrice: number;
  defaultSalesPrice: number;
}

export default function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
      const [sData, dData, pData] = await Promise.all([
        apiFetch("/setup/suppliers"),
        apiFetch("/setup/mobile-devices?pageSize=100"),
        apiFetch(`/erp/purchases/${id}`)
      ]);
      setSuppliers(sData.items || sData);
      setDevices(dData.items || dData);

      // Populate form
      const purchase = pData.purchase;
      setFormData({
        supplierId: purchase.supplierId,
        invoiceNo: purchase.invoiceNo,
        paidAmount: purchase.paidAmount,
        items: purchase.details.map((d: any) => ({
          mobileDeviceId: d.mobileDeviceId,
          imeiList: d.imeiItems.map((im: any) => im.imei1).join("\n"),
          costPrice: d.costPrice,
          salePrice: d.salePrice,
          commissionAmount: 0 // Not stored in purchase details currently
        }))
      });

    } catch (error: any) {
      toast.error("Failed to load purchase data: " + error.message);
      router.push("/purchases");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { mobileDeviceId: "", imeiList: "", costPrice: 0, salePrice: 0, commissionAmount: 0 }]
    }));
  };

  const duplicateItem = (item: any) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...item, imeiList: "" }]
    }));
    toast.info("Model details copied. Paste new IMEIs.");
  };

  const removeItem = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setFormData(prev => {
        const newItems = [...prev.items];
        let updatedItem = { ...newItems[idx], [field]: value };
        
        if (field === "mobileDeviceId") {
            const device = devices.find(d => d.id === value);
            if (device) {
                updatedItem.costPrice = device.defaultCostPrice;
                updatedItem.salePrice = device.defaultSalesPrice;
            }
        }
        
        newItems[idx] = updatedItem;
        return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!formData.supplierId) {
      toast.error("Please select a supplier.");
      setIsSaving(false);
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Please add at least one item.");
      setIsSaving(false);
      return;
    }

    try {
      await apiFetch(`/erp/purchases/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          supplierId: typeof formData.supplierId === "string" ? parseInt(formData.supplierId) : formData.supplierId,
          items: formData.items.map(i => {
            const parsedImeis = i.imeiList.split(/[\n,\s]+/).filter(Boolean).map((imei: string) => ({
                IMEI1: imei,
                IMEI2: "",
                SerialNumber: ""
            }));

            return {
              mobileDeviceId: parseInt(i.mobileDeviceId),
              ImeiItems: parsedImeis,
              costPrice: parseFloat(i.costPrice.toString()),
              salePrice: parseFloat(i.salePrice.toString()),
              commissionAmount: parseFloat((i.commissionAmount || 0).toString())
            };
          })
        }),
      });
      toast.success("Purchase updated successfully!");
      router.push("/purchases");
    } catch (error: any) {
      toast.error("Failed to update purchase: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading purchase details...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/purchases">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Purchase</h1>
            <p className="text-muted-foreground font-mono text-sm uppercase">Invoice: {formData.invoiceNo}</p>
          </div>
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
                onChange={val => setFormData(prev => ({...prev, supplierId: val}))}
                placeholder="Search Supplier..."
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice / Ref No.</Label>
              <Input placeholder="Invoice Number" value={formData.invoiceNo} onChange={e => setFormData(prev => ({...prev, invoiceNo: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <Input type="number" placeholder="0.00" value={formData.paidAmount} onChange={e => setFormData(prev => ({...prev, paidAmount: parseFloat(e.target.value) || 0}))} />
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
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[30%] pl-6">Device Model</TableHead>
                  <TableHead className="w-[35%]">Bulk IMEIs (Paste List)</TableHead>
                  <TableHead className="w-[12%] text-right">Cost Price</TableHead>
                  <TableHead className="w-[12%] text-right">Sale Price</TableHead>
                  <TableHead className="w-[10%] text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No products added.</TableCell></TableRow>
                ) : (
                  formData.items.map((item, idx) => (
                    <TableRow key={idx} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 align-top pt-4">
                        <SearchableSelect 
                          options={devices.map(d => ({ label: `${d.brand} ${d.modelName}`, value: d.id }))}
                          value={item.mobileDeviceId}
                          onChange={val => updateItem(idx, "mobileDeviceId", val)}
                          placeholder="Search Device..."
                        />
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <textarea 
                          placeholder="Paste IMEIs here" 
                          className="w-full min-h-[100px] p-3 border rounded-md font-mono text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/50" 
                          value={item.imeiList} 
                          onChange={e => updateItem(idx, "imeiList", e.target.value)} 
                          required 
                        />
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          Detected Devices: <span className="text-primary font-bold text-sm ml-1">{item.imeiList ? item.imeiList.split(/[\n,\s]+/).filter(Boolean).length : 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4"><Input type="number" className="h-10 text-right bg-background" value={item.costPrice} onChange={e => updateItem(idx, "costPrice", e.target.value)} required /></TableCell>
                      <TableCell className="align-top pt-4"><Input type="number" className="h-10 text-right bg-background" value={item.salePrice} onChange={e => updateItem(idx, "salePrice", e.target.value)} required /></TableCell>
                      <TableCell className="pr-6 align-top pt-4">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 text-primary" title="Duplicate model" onClick={() => duplicateItem(item)}><Copy className="h-4 w-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
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
                Total Unique Models: <span className="text-slate-900 font-bold">{formData.items.length}</span>
             </div>
             <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md" disabled={isSaving}>
               {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
             </Button>
          </CardFooter>
        </Card>
      </form>

      <QuickAddContact 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onSuccess={(c) => {
          setSuppliers(prev => [...prev, c]);
          setFormData(prev => ({...prev, supplierId: c.id}));
        }} 
        defaultRole="Supplier"
      />
    </div>
  );
}

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
import { Truck, Plus, Trash2, Save, Search, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  
  const [formData, setFormData] = useState({
    supplierId: "",
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

  const removeItem = (idx: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || formData.items.length === 0) {
      toast.error("Supplier and at least one item are required.");
      return;
    }

    try {
      await apiFetch("/erp/purchase", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          supplierId: parseInt(formData.supplierId),
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
          <p className="text-muted-foreground">Add new stock to your inventory by recording a supplier invoice.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Truck className="mr-2 h-5 w-5" /> Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Select Supplier</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={formData.supplierId}
                onChange={e => setFormData({...formData, supplierId: e.target.value})}
                required
              >
                <option value="">Choose Supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Invoice / Ref No.</Label>
              <Input 
                placeholder="e.g. PUR-001" 
                value={formData.invoiceNo}
                onChange={e => setFormData({...formData, invoiceNo: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid (Optional)</Label>
              <Input 
                type="number"
                placeholder="0.00" 
                value={formData.paidAmount}
                onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Smartphone className="mr-2 h-5 w-5" /> Purchase Items (IMEIs)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item Row
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Device Model</TableHead>
                  <TableHead>IMEI 1</TableHead>
                  <TableHead>IMEI 2</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Sale</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      No items added. Click "Add Item Row" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <select 
                          className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm"
                          value={item.mobileDeviceId}
                          onChange={e => {
                            const newItems = [...formData.items];
                            newItems[idx].mobileDeviceId = e.target.value;
                            setFormData({...formData, items: newItems});
                          }}
                          required
                        >
                          <option value="">Select Device</option>
                          {devices.map(d => <option key={d.id} value={d.id}>{d.brand} {d.modelName}</option>)}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="IMEI 1" 
                          className="h-9 font-mono"
                          value={item.imei1}
                          onChange={e => {
                            const newItems = [...formData.items];
                            newItems[idx].imei1 = e.target.value;
                            setFormData({...formData, items: newItems});
                          }}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="IMEI 2" 
                          className="h-9 font-mono"
                          value={item.imei2}
                          onChange={e => {
                            const newItems = [...formData.items];
                            newItems[idx].imei2 = e.target.value;
                            setFormData({...formData, items: newItems});
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="h-9"
                          value={item.costPrice}
                          onChange={e => {
                            const newItems = [...formData.items];
                            newItems[idx].costPrice = e.target.value;
                            setFormData({...formData, items: newItems});
                          }}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="h-9"
                          value={item.salePrice}
                          onChange={e => {
                            const newItems = [...formData.items];
                            newItems[idx].salePrice = e.target.value;
                            setFormData({...formData, items: newItems});
                          }}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t justify-end py-4">
             <Button type="submit" size="lg">
               <Save className="mr-2 h-4 w-4" /> Finalize Purchase
             </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

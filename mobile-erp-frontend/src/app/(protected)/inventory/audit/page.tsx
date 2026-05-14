"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Search, AlertTriangle, Save, ArrowLeft, Loader2, Package, Smartphone } from "lucide-react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StockAuditPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Fetch in-stock items. We use a large pageSize to get all items for audit.
      const data = await apiFetch("/erp/inventory?pageSize=2000&stockStatus=InStock");
      // Add audit fields
      const auditItems = (data.items || []).map((item: any) => ({
        ...item,
        isPresent: true, // Default to present for IMEIs
        physicalQuantity: item.quantity || 1, // Default to software quantity for general products
      }));
      setItems(auditItems);
    } catch (e: any) {
      toast.error("Failed to load inventory: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAuditItem = (id: number, field: string, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    const discrepancies = items.filter(item => {
      if (item.mobileDeviceId) return !item.isPresent;
      return item.quantity !== item.physicalQuantity;
    });

    if (discrepancies.length === 0) {
      toast.info("No discrepancies found. Stock is perfect!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        remarks: remarks || "Regular Stock Audit",
        items: items.map(item => ({
          inventoryItemId: item.id,
          physicalQuantity: item.physicalQuantity,
          isPresent: item.isPresent
        }))
      };

      const result = await apiFetch("/erp/stock-audit", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success(result.message || "Stock adjustment completed successfully!");
      router.push("/inventory");
    } catch (e: any) {
      toast.error("Adjustment failed: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.imei1 && item.imei1.includes(searchTerm)) ||
    (item.serialNumber && item.serialNumber.includes(searchTerm))
  );

  const stats = {
    total: items.length,
    discrepancies: items.filter(item => {
        if (item.mobileDeviceId) return !item.isPresent;
        return item.quantity !== item.physicalQuantity;
    }).length
  };

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">BOOTING AUDIT MODULE...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="icon" className="rounded-xl border-2"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Physical <span className="text-primary italic">Audit</span></h1>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Reconcile software data with your actual floor stock</p>
          </div>
        </div>
        <div className="flex gap-8 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
            <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Stock</p>
                <p className="text-xl font-black italic">{stats.total}</p>
            </div>
            <div className="text-right border-l pl-8">
                <p className="text-[9px] font-black uppercase text-destructive tracking-widest">Discrepancy</p>
                <p className="text-xl font-black text-destructive italic">{stats.discrepancies}</p>
            </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Scan IMEI or Search Product Name..." 
            className="pl-12 h-14 rounded-2xl border-none bg-white shadow-xl shadow-slate-200/50 font-bold text-lg focus-visible:ring-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-[0.6]">
          <Input 
              placeholder="Audit Remarks (e.g. Monthly Audit)" 
              className="h-14 rounded-2xl border-none bg-white shadow-xl shadow-slate-200/50 font-bold italic"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-slate-900 sticky top-0 z-10">
                <TableRow className="border-none hover:bg-slate-900">
                  <TableHead className="text-white font-black uppercase text-[10px] tracking-widest pl-10 h-16">Item Description</TableHead>
                  <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-16">Tracking ID</TableHead>
                  <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-center h-16">System Qty</TableHead>
                  <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-center h-16">Actual Floor Count</TableHead>
                  <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right pr-10 h-16">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No items found matching your search.</TableCell></TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isMismatch = item.mobileDeviceId ? !item.isPresent : item.quantity !== item.physicalQuantity;
                    
                    return (
                      <TableRow key={item.id} className={`transition-colors border-slate-50 ${isMismatch ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-slate-50/50"}`}>
                        <TableCell className="pl-10 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm ${item.mobileDeviceId ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                              {item.mobileDeviceId ? <Smartphone className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className={`font-black text-sm uppercase tracking-tight ${isMismatch ? 'text-destructive' : 'text-slate-900'}`}>{item.deviceName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.brand || 'General'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs space-y-0.5">
                            {item.imei1 && <p className="font-black text-slate-700">{item.imei1}</p>}
                            {item.serialNumber && <p className="text-slate-400 font-bold">{item.serialNumber}</p>}
                            {!item.imei1 && !item.serialNumber && <p className="text-slate-300 italic">Bulk Stock Item</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-black text-xl italic text-slate-400">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.mobileDeviceId ? (
                            <div className="flex justify-center">
                                <Checkbox 
                                    checked={item.isPresent} 
                                    onCheckedChange={(val) => updateAuditItem(item.id, "isPresent", !!val)}
                                    className="h-7 w-7 rounded-xl border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                />
                            </div>
                          ) : (
                            <Input 
                                type="number" 
                                value={item.physicalQuantity} 
                                onChange={e => updateAuditItem(item.id, "physicalQuantity", parseFloat(e.target.value) || 0)}
                                className={`w-24 mx-auto text-center font-black text-lg h-12 rounded-xl border-2 transition-all ${isMismatch ? 'border-destructive bg-destructive/5' : 'border-slate-100 bg-slate-50'}`}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-10">
                            {isMismatch ? (
                                <Badge variant="destructive" className="font-black uppercase italic py-1.5 px-3 rounded-lg shadow-sm">
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Discrepancy
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-black uppercase py-1.5 px-3 rounded-lg">
                                    Verified OK
                                </Badge>
                            )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-900 text-white p-10 justify-between">
            <div className="flex gap-12 items-center">
                <div className="space-y-1">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Audit Summary</p>
                    <p className="text-2xl font-black italic">
                        {stats.total} Items <span className="text-slate-600 mx-2">/</span> <span className="text-destructive">{stats.discrepancies} Gaps</span>
                    </p>
                </div>
                {stats.discrepancies > 0 && (
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 max-w-sm">
                        <p className="text-[10px] font-bold text-amber-400 uppercase leading-tight">
                            Warning: Finalizing this audit will permanently remove missing IMEIs and update grocery stock counts in the software.
                        </p>
                    </div>
                )}
            </div>
            <Button 
                size="lg"
                onClick={handleSubmit} 
                disabled={isSaving}
                className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95 group"
            >
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                        <span>Reconcile All Stock</span>
                    </div>
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

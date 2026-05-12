"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { format } from "date-fns";
import { Plus, Trash2, List, Eye, RotateCcw, X, Search, Check, ShoppingCart, ScanLine, ArrowRightLeft, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface SalesInvoice { id: number; invoiceNo: string; customerName: string; salesDate: string; }
interface InventoryItem { 
    id: number; 
    deviceName: string; 
    imei1: string; 
    currentSalePrice: number; 
    branchId: number;
    condition: string;
}

interface SalesReturnDetail {
  id: number;
  inventoryItemId: number;
  deviceName: string;
  imei: string;
  refundAmount: number;
}

interface SalesReturn {
  id: number;
  returnDate: string;
  totalReturnAmount: number;
  reason: string;
  invoiceNo: string;
  customerName: string;
  itemCount: number;
  details?: SalesReturnDetail[];
}

export default function SalesReturnsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection Logic
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [reason, setReason] = useState("");
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);

  const [viewingReturn, setViewingReturn] = useState<SalesReturn | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiFetch("/erp/sales");
      setInvoices(res.items);
    } catch (e: any) { toast.error(e.message); }
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/salesreturn");
      setReturns(res.items);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); fetchReturns(); }, [fetchData, fetchReturns]);

  const handleInvoiceChange = async (val: string) => {
    setSelectedInvoiceId(val);
    setSelectedItemIds([]);
    if (!val) {
      setAvailableItems([]);
      return;
    }

    setFetchingItems(true);
    try {
      const res = await apiFetch(`/erp/sales/${val}`);
      // The API returns sale with details. Each detail has inventoryItem.
      const items = res.sale.details.map((d: any) => ({
          id: d.inventoryItem.id,
          deviceName: `${d.inventoryItem.mobileDevice.brand} ${d.inventoryItem.mobileDevice.modelName}`,
          imei1: d.inventoryItem.imeI1 || d.inventoryItem.imei1,
          currentSalePrice: d.unitPrice,
          condition: d.inventoryItem.condition
      }));
      setAvailableItems(items);
    } catch (e: any) { toast.error("Failed to load invoice items"); }
    finally { setFetchingItems(false); }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      toast.error("Select items to return.");
      return;
    }

    try {
      await apiFetch("/salesreturn", {
        method: "POST",
        body: JSON.stringify({
          salesInvoiceId: parseInt(selectedInvoiceId),
          inventoryItemIds: selectedItemIds,
          reason: reason
        })
      });

      toast.success("Sales return processed!");
      setSelectedItemIds([]);
      setReason("");
      setSelectedInvoiceId("");
      setAvailableItems([]);
      setActiveTab("list");
      fetchReturns();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will mark items as sold again.")) return;
    try {
      await apiFetch(`/salesreturn/${id}`, { method: "DELETE" });
      toast.success("Return record deleted.");
      fetchReturns();
    } catch (e: any) { toast.error(e.message); }
  };

  const openView = async (id: number) => {
    try {
      const res = await apiFetch(`/salesreturn/${id}`);
      setViewingReturn(res);
    } catch (e: any) { toast.error(e.message); }
  };

  const totalRefund = availableItems
    .filter(i => selectedItemIds.includes(i.id))
    .reduce((sum, i) => sum + i.currentSalePrice, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <RotateCcw className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Sales Returns & Credits</h1>
            <p className="text-muted-foreground font-medium">Handle customer returns and adjust inventory stocks.</p>
          </div>
        </div>
        <Button size="lg" onClick={() => setActiveTab(activeTab === "list" ? "new" : "list")} className="gap-2">
          {activeTab === "list" ? <Plus className="h-5 w-5" /> : <List className="h-5 w-5" />}
          {activeTab === "list" ? "New Return" : "History Log"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="list" className="gap-2"><History className="h-4 w-4" /> Return History</TabsTrigger>
          <TabsTrigger value="new" className="gap-2"><ArrowRightLeft className="h-4 w-4" /> Process Return</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>RMA Records (Customer)</CardTitle>
              <CardDescription>Track all device returns from customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead className="text-right">Credit Value</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12">Loading returns...</TableCell></TableRow>
                  ) : returns.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No return records found.</TableCell></TableRow>
                  ) : returns.map(r => (
                    <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6 font-medium">{format(new Date(r.returnDate), "dd MMM yyyy")}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{r.invoiceNo}</Badge></TableCell>
                      <TableCell className="font-bold">{r.customerName || "Walk-in"}</TableCell>
                      <TableCell>{r.itemCount} items</TableCell>
                      <TableCell className="text-right font-black text-primary">৳{r.totalReturnAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openView(r.id)}><Eye className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
               <Card className="shadow-md border-primary/10">
                  <CardHeader>
                     <CardTitle className="text-xl">Find Original Sale</CardTitle>
                     <CardDescription>Select the invoice from which items are being returned.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <SearchableSelect 
                        label="Invoice Number" 
                        placeholder="Search SAL-..."
                        options={invoices.map(i => ({ 
                           label: `${i.invoiceNo} | ${i.customerName} (${format(new Date(i.salesDate), "dd MMM yy")})`, 
                           value: i.id 
                        }))} 
                        value={selectedInvoiceId} 
                        onChange={handleInvoiceChange} 
                     />
                  </CardContent>
               </Card>

               <Card className="shadow-md min-h-[400px]">
                  <CardHeader className="bg-slate-50 border-b">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Sold Items</CardTitle>
                        <Badge variant="outline">{availableItems.length} items in invoice</Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-4">
                     {!selectedInvoiceId ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-30">
                           <Search className="h-16 w-16 mb-2" />
                           <p className="font-bold">Select an invoice to list items</p>
                        </div>
                     ) : fetchingItems ? (
                        <div className="py-20 text-center font-bold animate-pulse">Fetching invoice data...</div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {availableItems.map(item => (
                              <div 
                                 key={item.id} 
                                 className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center ${selectedItemIds.includes(item.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-slate-300 hover:bg-slate-50"}`}
                                 onClick={() => toggleItemSelection(item.id)}
                              >
                                 <div className="space-y-1">
                                    <div className="font-black text-sm">{item.deviceName}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase">IMEI: {item.imei1}</div>
                                    <div className="text-xs font-black text-primary">Sold @ ৳{item.currentSalePrice.toLocaleString()}</div>
                                 </div>
                                 {selectedItemIds.includes(item.id) && <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"><Check className="h-4 w-4" /></div>}
                              </div>
                           ))}
                           {availableItems.length === 0 && <div className="col-span-2 text-center py-10 italic text-muted-foreground">No items available for return in this invoice.</div>}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-5">
               <Card className="shadow-2xl border-none sticky top-6">
                  <CardHeader className="bg-primary text-white rounded-t-xl">
                     <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Return Summary</CardTitle>
                        <Badge variant="secondary" className="bg-white/20 text-white border-none">{selectedItemIds.length} Selected</Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                     <div className="space-y-3">
                        {availableItems.filter(i => selectedItemIds.includes(i.id)).map(i => (
                           <div key={i.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                              <div>
                                 <div className="font-bold">{i.deviceName}</div>
                                 <div className="text-[10px] font-mono opacity-50">{i.imei1}</div>
                              </div>
                              <span className="font-black">৳{i.currentSalePrice.toLocaleString()}</span>
                           </div>
                        ))}
                        {selectedItemIds.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm italic">No items selected for return.</p>}
                     </div>

                     <div className="pt-4 border-t space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-black uppercase text-slate-400">Total Credit Value</span>
                           <span className="text-3xl font-black text-primary leading-none">৳{totalRefund.toLocaleString()}</span>
                        </div>

                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-500">Reason for Return</Label>
                           <textarea 
                              placeholder="Defective unit, Customer changed mind, incorrect specs..." 
                              className="w-full min-h-[100px] p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white transition-all focus:ring-1 focus:ring-primary outline-none"
                              value={reason}
                              onChange={e => setReason(e.target.value)}
                           />
                        </div>

                        <Button 
                           size="lg" 
                           className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20" 
                           disabled={selectedItemIds.length === 0}
                           onClick={handleSubmit}
                        >
                           Process Return & Credit
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={!!viewingReturn} onOpenChange={() => setViewingReturn(null)}>
        <DialogContent className="max-w-3xl border-none p-0 overflow-hidden rounded-2xl">
          {viewingReturn && (
             <>
               <div className="bg-primary p-6 text-white">
                  <DialogHeader>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg"><RotateCcw className="h-6 w-6" /></div>
                        <div>
                           <DialogTitle className="text-2xl font-black">Return Transaction</DialogTitle>
                           <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Invoice Ref: {viewingReturn.invoiceNo}</p>
                        </div>
                     </div>
                  </DialogHeader>
               </div>
               
               <div className="p-6 space-y-6 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Return Date</p>
                        <p className="text-sm font-bold">{format(new Date(viewingReturn.returnDate), "dd MMM yyyy")}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Credit Amount</p>
                        <p className="text-sm font-black text-primary">৳{viewingReturn.totalReturnAmount.toLocaleString()}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Units Returned</p>
                        <p className="text-sm font-bold">{viewingReturn.details?.length} Units</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
                        <Badge className="h-5 text-[9px] bg-emerald-500">Inventory Updated</Badge>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Reason / Remarks:</p>
                     <div className="p-4 bg-slate-50 rounded-xl border italic text-sm text-slate-600">
                        {viewingReturn.reason || "No specific reason provided."}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Detailed Item List:</p>
                     <div className="border rounded-xl overflow-hidden">
                        <Table>
                           <TableHeader className="bg-slate-50">
                              <TableRow>
                                 <TableHead className="pl-4">Product</TableHead>
                                 <TableHead>IMEI</TableHead>
                                 <TableHead className="text-right pr-4">Refund Val</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {viewingReturn.details?.map((d, i) => (
                                 <TableRow key={i}>
                                    <TableCell className="pl-4 font-bold">{d.deviceName}</TableCell>
                                    <TableCell className="font-mono text-xs">{d.imei}</TableCell>
                                    <TableCell className="text-right pr-4 font-black">৳{d.refundAmount.toLocaleString()}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <Button size="lg" className="rounded-xl px-12" onClick={() => setViewingReturn(null)}>Close Receipt</Button>
                  </div>
               </div>
             </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

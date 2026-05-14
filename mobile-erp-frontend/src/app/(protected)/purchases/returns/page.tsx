"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { format } from "date-fns";
import { Plus, Trash2, List, Eye, PackageMinus, X, Search, Check, ShoppingCart, ScanBarcode, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PurchaseInvoice { id: number; invoiceNo: string; supplierName: string; purchaseDate: string; }
interface InventoryItem { 
    id: number; 
    deviceName: string; 
    imei1: string; 
    costPrice: number; 
    purchaseInvoiceId?: number;
    supplierName?: string;
    branchId: number;
}

interface PurchaseReturnDetail {
  id: number;
  inventoryItemId: number;
  deviceName: string;
  imei: string;
  refundAmount: number;
}

interface PurchaseReturn {
  id: number;
  purchaseInvoiceId: number;
  invoiceNo: string;
  supplierName: string;
  returnDate: string;
  totalReturnAmount: number;
  reason: string;
  itemCount: number;
  details?: PurchaseReturnDetail[];
}

export default function PurchaseReturnsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection Logic
  const [returnMode, setReturnMode] = useState<"invoice" | "global">("invoice");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reason, setReason] = useState("");
  const [cart, setCart] = useState<InventoryItem[]>([]);

  const [viewingReturn, setViewingReturn] = useState<PurchaseReturn | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [invoicesRes, invRes] = await Promise.all([
        apiFetch("/erp/purchases"),
        apiFetch("/inventory/all")
      ]);
      setInvoices(invoicesRes.items);
      setAllInventory(invRes);
    } catch (e: any) { toast.error(e.message); }
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/purchasereturn");
      setReturns(res.items);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); fetchReturns(); }, [fetchData, fetchReturns]);

  const availableItems = useMemo(() => {
    if (returnMode === "invoice") {
      if (!selectedInvoiceId) return [];
      const invoice = invoices.find(inv => inv.id === parseInt(selectedInvoiceId));
      return allInventory.filter(i => 
        (i.purchaseInvoiceId === parseInt(selectedInvoiceId) || (invoice && i.supplierName === invoice.supplierName)) &&
        !cart.some(c => c.id === i.id)
      );
    } else {
      if (!searchQuery) return [];
      const query = searchQuery.toLowerCase();
      return allInventory.filter(i => 
        (i.imei1.toLowerCase().includes(query) || i.deviceName.toLowerCase().includes(query)) &&
        !cart.some(c => c.id === i.id)
      );
    }
  }, [allInventory, returnMode, selectedInvoiceId, searchQuery, cart, invoices]);

  const addToCart = (item: InventoryItem) => {
    setCart([...cart, item]);
    setSearchQuery("");
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your return cart is empty.");
      return;
    }

    // Since our backend currently expects a single PurchaseInvoiceId, 
    // we'll split the cart by supplier or invoice if needed, 
    // or just pass the first item's invoice ID as a primary reference.
    // For now, let's assume the user returns items from one supplier at a time for consistency.
    
    try {
      // Grouping by invoice to send multiple requests if necessary, 
      // but the user likely wants a single action.
      // Let's just use the invoice ID of the first item if none selected.
      const invId = returnMode === "invoice" ? parseInt(selectedInvoiceId) : (cart[0].purchaseInvoiceId || 0);

      await apiFetch("/purchasereturn", {
        method: "POST",
        body: JSON.stringify({
          purchaseInvoiceId: invId,
          inventoryItemIds: cart.map(i => i.id),
          reason: reason
        })
      });

      toast.success("Purchase return processed!");
      setCart([]);
      setReason("");
      setSelectedInvoiceId("");
      setActiveTab("list");
      fetchReturns();
      fetchData(); // Refresh inventory
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will restore the items to inventory.")) return;
    try {
      await apiFetch(`/purchasereturn/${id}`, { method: "DELETE" });
      toast.success("Return deleted and items restored.");
      fetchReturns();
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const openView = async (id: number) => {
    try {
      const res = await apiFetch(`/purchasereturn/${id}`);
      setViewingReturn(res);
    } catch (e: any) { toast.error(e.message); }
  };

  const totalRefund = cart.reduce((sum, item) => sum + item.costPrice, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
            <PackageMinus className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive">Supplier RMA Management</h1>
            <p className="text-muted-foreground font-medium">Handle returns via specific invoices or global IMEI search.</p>
          </div>
        </div>
        <Button size="lg" onClick={() => setActiveTab(activeTab === "list" ? "new" : "list")}>
          {activeTab === "list" ? <Plus className="mr-2 h-5 w-5" /> : <List className="mr-2 h-5 w-5" />}
          {activeTab === "list" ? "Process New RMA" : "Back to History"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="list" className="gap-2"><List className="h-4 w-4" /> RMA History</TabsTrigger>
          <TabsTrigger value="new" className="gap-2"><ShoppingCart className="h-4 w-4" /> New Return</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-muted shadow-sm">
            <CardHeader className="bg-muted/10">
              <CardTitle>RMA Records</CardTitle>
              <CardDescription>Track all products returned to vendors.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Return Date</TableHead>
                    <TableHead>Primary Invoice</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Refund Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10">Loading returns...</TableCell></TableRow>
                  ) : returns.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">No RMA records found.</TableCell></TableRow>
                  ) : returns.map(r => (
                    <TableRow key={r.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="font-medium">{format(new Date(r.returnDate), "dd MMM yyyy")}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{r.invoiceNo}</Badge></TableCell>
                      <TableCell className="font-semibold">{r.supplierName}</TableCell>
                      <TableCell>{r.itemCount} items</TableCell>
                      <TableCell className="font-bold text-destructive">-${r.totalReturnAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openView(r.id)} title="View Details"><Eye className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} title="Delete & Restore Stock"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            {/* Left Side: Selection */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Identification Method</CardTitle>
                      <CardDescription>How would you like to find the items?</CardDescription>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg">
                      <Button 
                        variant={returnMode === "invoice" ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setReturnMode("invoice")}
                        className="rounded-md px-4"
                      >
                        By Invoice
                      </Button>
                      <Button 
                        variant={returnMode === "global" ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setReturnMode("global")}
                        className="rounded-md px-4"
                      >
                        Global Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {returnMode === "invoice" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Original Purchase Invoice</Label>
                        <SearchableSelect 
                          placeholder="Search by Invoice No or Supplier Name..."
                          options={invoices.map(i => ({ 
                            label: `${i.invoiceNo} | ${i.supplierName} (${format(new Date(i.purchaseDate), "dd MMM yy")})`, 
                            value: i.id 
                          }))} 
                          value={selectedInvoiceId} 
                          onChange={(val: string | number) => setSelectedInvoiceId(val.toString())} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <ScanBarcode className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="Scan IMEI or Search Device Name..." 
                          className="pl-10 h-11 text-lg"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Item Selection List */}
              <Card className="shadow-sm min-h-[400px]">
                <CardHeader className="border-b bg-muted/5">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Available for Return</CardTitle>
                    <Badge variant="outline">{availableItems.length} items found</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {!selectedInvoiceId && returnMode === "invoice" && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Search className="h-12 w-12 mb-2 opacity-20" />
                      <p>Please select an invoice to view its items.</p>
                    </div>
                  )}
                  {!searchQuery && returnMode === "global" && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <ScanBarcode className="h-12 w-12 mb-2 opacity-20" />
                      <p>Scan an IMEI or type to search across all inventory.</p>
                    </div>
                  )}
                  {((returnMode === "invoice" && selectedInvoiceId) || (returnMode === "global" && searchQuery)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableItems.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                          No matching unsold items found.
                        </div>
                      ) : availableItems.map(item => (
                        <div 
                          key={item.id} 
                          className="p-3 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex justify-between items-center"
                          onClick={() => addToCart(item)}
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-sm group-hover:text-primary transition-colors">{item.deviceName}</div>
                            <div className="flex gap-2 items-center">
                                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 h-4 tracking-tighter">IMEI: {item.imei1}</Badge>
                                {returnMode === "global" && <span className="text-[10px] text-muted-foreground">| {item.supplierName}</span>}
                            </div>
                            <div className="text-xs font-bold text-destructive">Cost: ${item.costPrice.toLocaleString()}</div>
                          </div>
                          <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Cart Summary */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-lg border-destructive/20 h-full flex flex-col">
                <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <ShoppingCart className="h-5 w-5" /> Return Cart
                    </CardTitle>
                    <Badge variant="destructive" className="rounded-full px-3">{cart.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground p-10 text-center">
                      <PackageMinus className="h-16 w-16 mb-4 opacity-10" />
                      <h3 className="text-lg font-semibold mb-1">Cart is Empty</h3>
                      <p className="text-sm">Select items from the left to add them to your return request.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 text-[10px] uppercase font-bold tracking-wider">
                          <TableHead className="h-8">Item</TableHead>
                          <TableHead className="h-8">Supplier</TableHead>
                          <TableHead className="h-8 text-right">Amount</TableHead>
                          <TableHead className="h-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map(item => (
                          <TableRow key={item.id} className="group">
                            <TableCell className="py-3">
                              <div className="font-bold text-xs">{item.deviceName}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{item.imei1}</div>
                            </TableCell>
                            <TableCell className="py-3 text-[10px]">{item.supplierName || "N/A"}</TableCell>
                            <TableCell className="py-3 text-right font-bold text-xs">${item.costPrice.toLocaleString()}</TableCell>
                            <TableCell className="py-3 text-right">
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.id)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <div className="p-6 bg-muted/20 border-t space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Refund Value:</span>
                    <span className="text-destructive font-mono text-2xl">${totalRefund.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">RMA Reason / Notes</label>
                    <Input 
                        placeholder="Explain why you are returning these items..." 
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="bg-background border-muted-foreground/20"
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold shadow-md shadow-destructive/20 gap-2"
                    disabled={cart.length === 0}
                    onClick={handleSubmit}
                  >
                    Confirm Return <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Details Modal */}
      <Dialog open={!!viewingReturn} onOpenChange={() => setViewingReturn(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <PackageMinus className="h-6 w-6 text-destructive" />
              Purchase Return Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div><div className="text-xs text-muted-foreground uppercase font-bold">Return Date</div><div>{format(new Date(viewingReturn.returnDate), "dd MMM yyyy")}</div></div>
                <div><div className="text-xs text-muted-foreground uppercase font-bold">Original Invoice</div><Badge variant="outline">{viewingReturn.invoiceNo}</Badge></div>
                <div><div className="text-xs text-muted-foreground uppercase font-bold">Total Refund</div><div className="font-bold text-destructive">${viewingReturn.totalReturnAmount.toLocaleString()}</div></div>
                <div><div className="text-xs text-muted-foreground uppercase font-bold">Items</div><div>{viewingReturn.details?.length} Units</div></div>
              </div>

              <div>
                <div className="text-sm font-bold mb-1 text-muted-foreground uppercase">Reason:</div>
                <div className="p-3 bg-card border rounded text-sm italic shadow-sm">{viewingReturn.reason || "No reason provided."}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-muted-foreground uppercase">Returned Items:</div>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Product / Device</TableHead>
                            <TableHead>IMEI / SN</TableHead>
                            <TableHead className="text-right">Refund Amount</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {viewingReturn.details?.map((d, i) => (
                            <TableRow key={i}>
                            <TableCell className="font-semibold">{d.deviceName}</TableCell>
                            <TableCell className="font-mono text-xs">{d.imei}</TableCell>
                            <TableCell className="text-right font-bold text-destructive">${d.refundAmount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="lg" onClick={() => setViewingReturn(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

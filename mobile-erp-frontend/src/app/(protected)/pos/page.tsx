"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  CreditCard, 
  User, 
  UserPlus, 
  Phone, 
  SearchCode, 
  ArrowLeft, 
  ScanLine, 
  Smartphone, 
  Tag, 
  Percent, 
  Banknote,
  Receipt,
  Info,
  X,
  Plus,
  Minus,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface InventoryItem {
  id: number;
  mobileDevice: { brand: string; modelName: string; variantName: string; };
  imei1: string;
  currentSalePrice: number;
  condition: string;
  isOfficial: boolean;
}

interface CartItem extends InventoryItem {
  warrantyMonths: number;
}

export default function POSPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold animate-pulse text-primary">Initializing Terminal...</div>}>
      <POSContent />
    </Suspense>
  );
}

function POSContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Walk-in / Customer Logic
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ id: 1, name: "Walk-in Customer", phone: "", address: "" });
  const [phoneSuggestions, setPhoneSuggestions] = useState<any[]>([]);

  const loadExistingSale = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/erp/sales/${id}`);
      const { sale, customer } = data;
      setInvoiceNo(sale.invoiceNo);
      setDiscount(sale.discount || 0);
      setPaidAmount(sale.paidAmount || 0);
      if (customer) {
        setCustomerInfo({ id: customer.id, name: customer.name, phone: customer.phone, address: customer.address });
      }
      setCart(sale.details.map((item: any) => ({
        id: item.inventoryItem.id,
        mobileDevice: {
           brand: item.inventoryItem.mobileDevice.brand,
           modelName: item.inventoryItem.mobileDevice.modelName,
           variantName: ""
        },
        imei1: item.inventoryItem.imeI1 || item.inventoryItem.imei1,
        currentSalePrice: item.unitPrice,
        warrantyMonths: item.warrantyMonths,
        condition: item.inventoryItem.condition,
        isOfficial: item.inventoryItem.isOfficial
      })));
    } catch (error: any) {
      toast.error("Failed to load sale: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (editId) {
      loadExistingSale(editId);
    }
  }, [editId, loadExistingSale]);

  const searchInventory = async (term: string) => {
    if (term.length < 3) { setSearchResults([]); return; }
    try {
      const result = await apiFetch(`/erp/inventory?search=${term}&pageSize=50`);
      const groups = result.items || result.Items || [];
      
      const flattened: InventoryItem[] = [];
      groups.forEach((group: any) => {
        const groupImeis = group.imeis || group.Imeis || [];
        groupImeis.forEach((imei: any) => {
          flattened.push({
            id: imei.id,
            mobileDevice: {
              brand: group.brand || group.Brand,
              modelName: group.modelName || group.ModelName,
              variantName: ""
            },
            imei1: imei.imeI1 || imei.IMEI1,
            currentSalePrice: imei.currentSalePrice || imei.CurrentSalePrice,
            condition: imei.condition || "New",
            isOfficial: imei.isOfficial ?? true
          });
        });
      });
      
      setSearchResults(flattened);
    } catch (error) { 
      console.error("Inventory search failed:", error); 
    }
  };

  const searchCustomerByPhone = async (phone: string) => {
    setCustomerInfo({ ...customerInfo, phone });
    if (phone.length < 4) { setPhoneSuggestions([]); return; }
    try {
      const results = await apiFetch(`/setup/contacts/search/${phone}`);
      setPhoneSuggestions(results.filter((c: any) => c.isCustomer));
    } catch (error) { console.error(error); }
  };

  const selectCustomer = (c: any) => {
    setCustomerInfo({ id: c.id, name: c.name, phone: c.phone, address: c.address });
    setPhoneSuggestions([]);
    toast.success(`Selected Customer: ${c.name}`);
  };

  const addToCart = (item: InventoryItem) => {
    if (cart.find(c => c.id === item.id)) { toast.warning("Item already added to cart."); return; }
    setCart([...cart, { ...item, warrantyMonths: 12 }]);
    setSearchTerm("");
    setSearchResults([]);
    toast.info("Added to cart");
  };

  const subtotal = cart.reduce((acc, item) => acc + item.currentSalePrice, 0);
  const netTotal = subtotal - discount;
  const changeAmount = (typeof paidAmount === "number" ? paidAmount : 0) - netTotal;

  const handleSale = async () => {
    if (cart.length === 0) { toast.error("Please add items to cart."); return; }
    setLoading(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/erp/sales/${editId}` : "/erp/sales";
      const actualPaid = paidAmount === "" ? netTotal : paidAmount;

      const data = await apiFetch(url, {
        method: method,
        body: JSON.stringify({
          invoiceNo,
          customerId: customerInfo.id,
          discount,
          paidAmount: actualPaid,
          items: cart.map(c => ({ inventoryItemId: c.id, warrantyMonths: c.warrantyMonths })),
        }),
      });
      toast.success(editId ? "Sale updated successfully!" : "Invoice processed!");
      router.push(`/reports/invoice/sale/${data.invoiceId || data.InvoiceId || editId}`);
    } catch (error: any) {
      toast.error("Process failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/sales">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Terminal POS
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
               {editId ? `Editing Invoice #${invoiceNo}` : `Active Session: ${format(new Date(), "dd MMM yyyy")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Available Credits</span>
                <span className="text-sm font-black text-emerald-600">৳0.00</span>
             </div>
             <Button variant="outline" className="border-slate-200" onClick={() => { setCart([]); setDiscount(0); setCustomerInfo({ id: 1, name: "Walk-in Customer", phone: "", address: "" }); }}>
                Reset Terminal
             </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area: Items & Search */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 gap-6">
             {/* Dynamic Item Search */}
             <Card className="border-none shadow-md overflow-visible relative">
                <CardContent className="p-4">
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                         <ScanLine className="h-5 w-5 text-primary group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input 
                         placeholder="Scan IMEI / Serial or Type Model Name..." 
                         className="h-14 pl-12 text-lg font-medium bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl transition-all shadow-inner"
                         value={searchTerm} 
                         onChange={e => { setSearchTerm(e.target.value); searchInventory(e.target.value); }} 
                         autoFocus
                      />
                   </div>

                   {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-[400px]">
                         <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b">Search Results ({searchResults.length})</div>
                         <div className="overflow-y-auto">
                            {searchResults.map(item => (
                               <div 
                                  key={item.id} 
                                  className="p-4 hover:bg-primary/5 cursor-pointer flex justify-between items-center transition-colors border-b last:border-0 border-slate-100 group" 
                                  onClick={() => addToCart(item)}
                               >
                                  <div className="flex gap-4 items-center">
                                     <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Smartphone className="h-5 w-5" />
                                     </div>
                                     <div>
                                        <div className="font-black text-slate-900 leading-tight">{item.mobileDevice.brand} {item.mobileDevice.modelName}</div>
                                        <div className="flex gap-2 items-center mt-1">
                                           <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-mono font-bold uppercase">{item.imei1}</Badge>
                                           <span className="text-[10px] text-slate-400 font-bold uppercase">{item.condition} | {item.isOfficial ? "Official" : "Unofficial"}</span>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-lg font-black text-primary">৳{item.currentSalePrice.toLocaleString()}</div>
                                     <div className="text-[9px] font-bold text-emerald-600 uppercase">Available in Stock</div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </CardContent>
             </Card>

             {/* Cart Table */}
             <Card className="border-none shadow-md overflow-hidden flex-1 min-h-[400px]">
                <CardHeader className="bg-white border-b py-3 px-6">
                   <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Active Cart</CardTitle>
                      <Badge variant="secondary" className="px-3 rounded-full font-black">{cart.length} Units</Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-slate-50/80">
                         <TableRow>
                            <TableHead className="pl-6 text-[10px] font-black uppercase">Model & Specs</TableHead>
                            <TableHead className="text-[10px] font-black uppercase">Warranty</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase">Unit Price</TableHead>
                            <TableHead className="text-right pr-6"></TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {cart.length === 0 ? (
                            <TableRow>
                               <TableCell colSpan={4} className="py-24 text-center">
                                  <div className="flex flex-col items-center gap-2 text-slate-400">
                                     <ShoppingCart className="h-12 w-12 opacity-10" />
                                     <p className="text-sm font-medium">Cart is currently empty. Scan items to start.</p>
                                  </div>
                               </TableCell>
                            </TableRow>
                         ) : (
                            cart.map((item, idx) => (
                               <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                  <TableCell className="pl-6 py-4">
                                     <div className="font-bold text-slate-900">{item.mobileDevice.brand} {item.mobileDevice.modelName}</div>
                                     <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[9px] h-4 font-mono font-bold tracking-tighter">IMEI: {item.imei1}</Badge>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.condition} • {item.isOfficial ? "Official" : "Int"}</span>
                                     </div>
                                  </TableCell>
                                  <TableCell>
                                     <Select 
                                        value={item.warrantyMonths.toString()} 
                                        onValueChange={v => {
                                           const newCart = [...cart];
                                           newCart[idx].warrantyMonths = parseInt(v);
                                           setCart(newCart);
                                        }}
                                     >
                                        <SelectTrigger className="h-8 w-[120px] text-xs font-bold border-slate-200 bg-white shadow-sm">
                                           <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="0">No Warranty</SelectItem>
                                           <SelectItem value="6">6 Months</SelectItem>
                                           <SelectItem value="12">1 Year</SelectItem>
                                           <SelectItem value="24">2 Years</SelectItem>
                                        </SelectContent>
                                     </Select>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                     <div className="font-black text-slate-900">৳{item.currentSalePrice.toLocaleString()}</div>
                                     <div className="text-[9px] font-bold text-slate-400 uppercase">Per Unit</div>
                                  </TableCell>
                                  <TableCell className="text-right pr-6 py-4">
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                        onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                                     >
                                        <Trash2 className="h-4 w-4" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                            ))
                         )}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Sidebar Area: Customer & Checkout */}
        <div className="w-[420px] bg-white border-l shadow-2xl z-10 flex flex-col overflow-y-auto">
          {/* Customer Section */}
          <div className="p-6 space-y-4 border-b">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Customer Info</h3>
                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase rounded-lg border-primary/20 text-primary hover:bg-primary/5" onClick={() => setIsQuickAddOpen(true)}>
                   <UserPlus className="h-3 w-3 mr-1" /> New Customer
                </Button>
             </div>

             <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                   placeholder="Search Phone or Name..." 
                   className="h-11 pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-all rounded-xl"
                   value={customerInfo.phone} 
                   onChange={e => searchCustomerByPhone(e.target.value)} 
                />
                
                {phoneSuggestions.length > 0 && (
                   <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                      {phoneSuggestions.map(s => (
                         <div key={s.id} className="px-4 py-3 hover:bg-primary/5 cursor-pointer flex justify-between items-center border-b last:border-0 border-slate-100 group" onClick={() => selectCustomer(s)}>
                            <div>
                               <div className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{s.name}</div>
                               <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">{s.phone}</div>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                      <User className="h-4 w-4" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <Input 
                         className="h-8 border-none bg-transparent font-bold text-slate-900 p-0 focus:ring-0 focus-visible:ring-0" 
                         value={customerInfo.name} 
                         onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                         placeholder="Customer Name"
                      />
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                      <Tag className="h-4 w-4" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <Input 
                         className="h-8 border-none bg-transparent font-medium text-slate-500 text-xs p-0 focus:ring-0 focus-visible:ring-0" 
                         value={customerInfo.address} 
                         onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                         placeholder="Customer Address / Notes"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Payment Details */}
          <div className="flex-1 p-6 space-y-6">
             <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Payment Breakdown</h3>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Cart Total</span>
                      <span className="font-bold text-slate-900 text-lg">৳{subtotal.toLocaleString()}</span>
                   </div>
                   
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                         <Percent className="h-4 w-4 text-orange-500" />
                         <span className="text-xs font-bold text-slate-600 uppercase">Discount</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono font-bold text-slate-400">৳</span>
                         <input 
                            type="number" 
                            className="w-24 text-right bg-transparent border-none font-black text-slate-900 focus:ring-0 p-0" 
                            value={discount} 
                            onChange={e => setDiscount(parseFloat(e.target.value) || 0)} 
                         />
                      </div>
                   </div>

                   <Separator className="my-2" />

                   <div className="flex justify-between items-center py-2">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Payable</span>
                         <span className="text-3xl font-black text-primary leading-none mt-1">৳{netTotal.toLocaleString()}</span>
                      </div>
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                         <Banknote className="h-6 w-6" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Received</Label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                         <span className="font-black text-slate-300 group-focus-within:text-primary transition-colors">৳</span>
                      </div>
                      <Input 
                         type="number" 
                         className="h-14 pl-10 text-2xl font-black text-right text-emerald-700 bg-emerald-50 border-emerald-100 focus:bg-white transition-all shadow-inner rounded-xl" 
                         placeholder={netTotal.toString()} 
                         value={paidAmount} 
                         onChange={e => setPaidAmount(e.target.value === "" ? "" : parseFloat(e.target.value))} 
                      />
                   </div>
                   {changeAmount > 0 && (
                      <div className="flex justify-between items-center px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                         <span className="text-xs font-bold text-rose-600 uppercase">Change Due</span>
                         <span className="font-black text-rose-700">৳{changeAmount.toLocaleString()}</span>
                      </div>
                   )}
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Custom Invoice #</Label>
                   <div className="relative">
                      <Receipt className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                      <Input 
                         className="h-10 pl-9 border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl shadow-inner" 
                         placeholder="Leave blank for Auto-Gen" 
                         value={invoiceNo} 
                         onChange={e => setInvoiceNo(e.target.value)} 
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Action Button */}
          <div className="p-6 bg-slate-50 border-t mt-auto">
             <Button 
                className="w-full h-16 text-xl bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 border-none transition-all hover:scale-[1.02] active:scale-95 group disabled:opacity-50 disabled:scale-100" 
                disabled={cart.length === 0 || loading} 
                onClick={handleSale}
             >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin"></div>
                        Processing...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        <CreditCard className="h-6 w-6 group-hover:animate-bounce" />
                        FINALIZE INVOICE
                    </div>
                )}
             </Button>
             <p className="text-center mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ready for Next Transaction</p>
          </div>
        </div>
      </div>

      <QuickAddContact isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSuccess={selectCustomer} />
    </div>
  );
}

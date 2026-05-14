"use client";

import { useEffect, useState, Suspense, useCallback, useRef, useMemo } from "react";
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
import { toast } from "@/lib/toast";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/context/LanguageContext";

interface InventoryItem {
  id: number;
  imeiItemId?: number;
  mobileDeviceId?: number;
  productId?: number;
  mobileDevice: { 
    brand: string; 
    modelName: string; 
    variantName: string;
    ram?: string;
    storage?: string;
    color?: string;
  };
  imei1: string;
  currentSalePrice: number;
  costPrice: number;
  condition: string;
  isOfficial: boolean;
  warrantyMonths?: number;
  warrantyDurationId?: number;
}

interface CartItem {
  mobileDeviceId?: number;
  productId?: number;
  brand: string;
  modelName: string;
  variantName: string;
  ram?: string;
  storage?: string;
  color?: string;
  condition: string;
  isOfficial: boolean;
  unitPrice: number;
  costPrice: number;
  warrantyMonths: number;
  imeis: {
    id: number;
    imeiItemId?: number;
    imei1: string;
  }[];
}

export default function POSPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold animate-pulse text-primary">{t('loading')}</div>}>
      <POSContent />
    </Suspense>
  );
}

function POSContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paymentInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [vat, setVat] = useState(0);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Walk-in / Customer Logic
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [customerType, setCustomerType] = useState<"walk-in" | "registered">("walk-in");
  const [customerInfo, setCustomerInfo] = useState({ id: 1, name: "Walk-in Customer", phone: "", address: "" });
  const [phoneSuggestions, setPhoneSuggestions] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Derived Values
  const subtotal = useMemo(() => cart.reduce((acc, row) => acc + (row.unitPrice * row.imeis.length), 0), [cart]);
  const netTotal = useMemo(() => subtotal - discount + serviceCharge + vat, [subtotal, discount, serviceCharge, vat]);
  const changeAmount = useMemo(() => {
    if (paidAmount === "" || paidAmount <= netTotal) return 0;
    return (paidAmount as number) - netTotal;
  }, [paidAmount, netTotal]);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiFetch("/setup/contacts?pageSize=1000");
      setContacts(data.items || []);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  }, []);

  const fetchInvoiceForEdit = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/erp/sales/${id}`);
      const sale = data.sale;
      const customer = data.customer;
      
      setInvoiceNo(sale.invoiceNo);
      setDiscount(sale.discount || 0);
      setServiceCharge(sale.serviceCharge || 0);
      setVat(sale.vat || 0);
      setPaidAmount(sale.paidAmount || "");
      setCustomerInfo({
        id: sale.customerId,
        name: customer?.name || sale.walkInName || "Walk-in Customer",
        phone: customer?.phone || sale.walkInPhone || "",
        address: customer?.address || sale.walkInAddress || ""
      });
      setCustomerType(sale.customerId === 1 ? "walk-in" : "registered");

      // Reconstruct cart
      const groupedItems: { [key: string]: CartItem } = {};
      sale.details.forEach((item: any) => {
        const key = `${item.inventoryItem.mobileDeviceId}-${item.inventoryItem.condition}-${item.inventoryItem.isOfficial}-${item.unitPrice}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            mobileDeviceId: item.inventoryItem.mobileDeviceId,
            brand: item.inventoryItem.mobileDevice?.brand || "N/A",
            modelName: item.inventoryItem.mobileDevice?.modelName || "N/A",
            variantName: item.inventoryItem.mobileDevice?.variantName || "",
            ram: item.inventoryItem.mobileDevice?.ram,
            storage: item.inventoryItem.mobileDevice?.storage,
            color: item.inventoryItem.mobileDevice?.color,
            condition: item.inventoryItem.condition,
            isOfficial: item.inventoryItem.isOfficial,
            unitPrice: item.unitPrice,
            costPrice: item.inventoryItem.costPrice,
            warrantyMonths: item.warrantyMonths,
            imeis: []
          };
        }
        groupedItems[key].imeis.push({
          id: item.inventoryItemId,
          imei1: item.inventoryItem.imei1 || item.inventoryItem.imeiItem?.imei1 || ""
        });
      });
      setCart(Object.values(groupedItems));
    } catch (error: any) {
      toast.error("Failed to load invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    if (editId) {
      fetchInvoiceForEdit(editId);
    }
  }, [editId, fetchContacts, fetchInvoiceForEdit]);

  const searchInventory = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await apiFetch(`/erp/inventory?search=${encodeURIComponent(query)}`);
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  const addToCart = (item: any) => {
    const existingIndex = cart.findIndex(c => 
      c.mobileDeviceId === item.mobileDeviceId && 
      c.condition === item.condition && 
      c.isOfficial === item.isOfficial &&
      c.unitPrice === item.currentSalePrice
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      if (newCart[existingIndex].imeis.some(im => im.id === item.id)) {
        toast.warning("Item already in cart");
        return;
      }
      newCart[existingIndex].imeis.push({ id: item.id, imei1: item.imei1 });
      setCart(newCart);
    } else {
      setCart([...cart, {
        mobileDeviceId: item.mobileDeviceId,
        brand: item.brand,
        modelName: item.modelName,
        variantName: item.variantName,
        ram: item.ram,
        storage: item.storage,
        color: item.color,
        condition: item.condition,
        isOfficial: item.isOfficial,
        unitPrice: item.currentSalePrice,
        costPrice: item.costPrice,
        warrantyMonths: item.warrantyMonths || 0,
        imeis: [{ id: item.id, imei1: item.imei1 }]
      }]);
    }
    setSearchTerm("");
    setSearchResults([]);
    searchInputRef.current?.focus();
    toast.success("Added to cart");
  };

  const searchCustomerHistory = async (phone: string) => {
    setCustomerInfo({ ...customerInfo, phone });
    if (phone.length < 5) {
      setPhoneSuggestions([]);
      return;
    }
    try {
      const data = await apiFetch(`/setup/contacts/search/${phone}`);
      setPhoneSuggestions(data || []);
    } catch (error) {
      console.error("Failed to fetch customer history", error);
    }
  };

  const selectCustomer = (contact: any) => {
    setCustomerInfo({
      id: contact.id,
      name: contact.name,
      phone: contact.phone || "",
      address: contact.address || ""
    });
    setCustomerType("registered");
    setIsQuickAddOpen(false);
    fetchContacts();
  };

  const handleReset = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setPaidAmount("");
    setCustomerInfo({ id: 1, name: "Walk-in Customer", phone: "", address: "" });
    setCustomerType("walk-in");
    toast.info("Terminal Reset");
  }, []);

  const handleSale = useCallback(async () => {
    if (cart.length === 0) { toast.error("Please add items to cart."); return; }
    setLoading(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/erp/sales/${editId}` : "/erp/sales";
      const subtotalVal = cart.reduce((acc, row) => acc + (row.unitPrice * row.imeis.length), 0);
      const netTotalVal = subtotalVal - discount + serviceCharge + vat;
      const actualPaid = paidAmount === "" ? netTotalVal : paidAmount;

      // Flatten cart for API
      const flatItems: any[] = [];
      cart.forEach(row => {
          row.imeis.forEach(im => {
              flatItems.push({ 
                  inventoryItemId: im.id, 
                  warrantyMonths: row.warrantyMonths,
                  unitPrice: row.unitPrice
              });
          });
      });

      const data = await apiFetch(url, {
        method: method,
        body: JSON.stringify({
          invoiceNo,
          customerId: customerInfo.id,
          discount,
          serviceCharge,
          vat,
          paidAmount: actualPaid,
          items: flatItems,
          walkInName: customerInfo.id === 1 || customerType === "walk-in" ? customerInfo.name : null,
          walkInPhone: customerInfo.id === 1 || customerType === "walk-in" ? customerInfo.phone : null,
          walkInAddress: customerInfo.id === 1 || customerType === "walk-in" ? customerInfo.address : null,
        }),
      });
      toast.success(editId ? "Sale updated successfully!" : "Invoice processed!");
      router.push(`/reports/invoice/sale/${data.invoiceId || data.InvoiceId || editId}`);
    } catch (error: any) {
      toast.error("Process failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [cart, customerInfo, customerType, discount, editId, invoiceNo, paidAmount, router, serviceCharge, vat]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F2: Focus Search
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        toast.info("Searching Mode [F2]", { duration: 1000 });
      }
      // F8: Finalize Sale
      if (e.key === "F8") {
        e.preventDefault();
        handleSale();
      }
      // F9: Quick Add Contact
      if (e.key === "F9") {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
      // F10: Focus Payment
      if (e.key === "F10") {
        e.preventDefault();
        paymentInputRef.current?.focus();
        toast.info("Payment Mode [F10]", { duration: 1000 });
      }
      // Ctrl + R: Reset
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleSale, handleReset]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
        addToCart(searchResults[0]);
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
              {t('pos')}
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
             <Button variant="outline" className="border-slate-200" onClick={() => { setCart([]); setDiscount(0); setCustomerInfo({ id: 1, name: "Walk-in Customer", phone: "", address: "" }); setCustomerType("walk-in"); }}>
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
                         ref={searchInputRef}
                         placeholder={`${t('imei_placeholder')} [F2]`} 
                         className="h-14 pl-12 text-lg font-medium bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl transition-all shadow-inner"
                         value={searchTerm} 
                         onChange={e => { setSearchTerm(e.target.value); searchInventory(e.target.value); }} 
                         onKeyDown={handleKeyDown}
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
                                        <div className="font-black text-slate-900 leading-tight">{item.mobileDevice?.brand || item.brand || "N/A"} {item.mobileDevice?.modelName || item.modelName || ""}</div>
                                        <div className="flex flex-wrap gap-2 items-center mt-1">
                                           <Badge variant="outline" className="text-[14px] px-3 h-8 font-mono font-black uppercase border-primary/40 text-primary shadow-sm">{item.imei1}</Badge>
                                           {(item.mobileDevice?.ram || item.ram || item.mobileDevice?.storage || item.storage) && (
                                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 uppercase">
                                                 {item.mobileDevice?.ram || item.ram}/{item.mobileDevice?.storage || item.storage}
                                              </span>
                                           )}
                                           {(item.mobileDevice?.color || item.color) && (
                                              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.mobileDevice?.color || item.color}</span>
                                           )}
                                           <span className="text-[10px] text-slate-400 font-bold uppercase">• {item.condition} | {item.isOfficial ? "Official" : "Unofficial"}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Cost: ৳{item.costPrice.toLocaleString()}</div>
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
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">{t('live_inventory')}</CardTitle>
                      <Badge variant="secondary" className="px-3 rounded-full font-black">{cart.reduce((acc, row) => acc + row.imeis.length, 0)} Units</Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-slate-50/80">
                         <TableRow>
                            <TableHead className="pl-6 text-[10px] font-black uppercase">{t('model')} & Specs</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-center w-[100px]">{t('quantity')}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase">Warranty</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase">Unit {t('price')}</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase">{t('amount')}</TableHead>
                            <TableHead className="text-right pr-6"></TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {cart.length === 0 ? (
                            <TableRow>
                               <TableCell colSpan={6} className="py-24 text-center">
                                  <div className="flex flex-col items-center gap-2 text-slate-400">
                                     <ShoppingCart className="h-12 w-12 opacity-10" />
                                     <p className="text-sm font-medium">Cart is currently empty. Scan items to start.</p>
                                  </div>
                               </TableCell>
                            </TableRow>
                         ) : (
                            cart.map((row, idx) => (
                               <TableRow key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                  <TableCell className="pl-6 py-4">
                                     <div className="font-bold text-slate-900">{row.brand} {row.modelName}</div>
                                     <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {(row.ram || row.storage) && (
                                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 uppercase">
                                                {row.ram}/{row.storage}
                                            </span>
                                        )}
                                        {row.color && (
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{row.color}</span>
                                        )}
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">• {row.condition} • {row.isOfficial ? "Official" : "Int"}</span>
                                     </div>
                                     <div className="flex flex-wrap gap-1 mt-2">
                                        {row.imeis.map((im, iIdx) => (
                                            <Badge key={iIdx} variant="secondary" className="text-[13px] h-7 font-mono font-black flex items-center gap-1 group/badge shadow-sm border-slate-200">
                                                {im.imei1}
                                                <button 
                                                    className="opacity-0 group-hover/badge:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity"
                                                    onClick={() => {
                                                        const newCart = [...cart];
                                                        const updatedRow = { ...newCart[idx] };
                                                        updatedRow.imeis = updatedRow.imeis.filter(it => it.id !== im.id);
                                                        if (updatedRow.imeis.length === 0) {
                                                            setCart(newCart.filter((_, i) => i !== idx));
                                                        } else {
                                                            newCart[idx] = updatedRow;
                                                            setCart(newCart);
                                                        }
                                                    }}
                                                >
                                                    <X className="h-2 w-2" />
                                                </button>
                                            </Badge>
                                        ))}
                                     </div>
                                  </TableCell>
                                  <TableCell className="text-center font-black text-slate-900">{row.imeis.length}</TableCell>
                                  <TableCell>
                                     <Select 
                                        value={row.warrantyMonths.toString()} 
                                        onValueChange={(v: string | null) => {
                                           const newCart = [...cart];
                                           newCart[idx] = { ...newCart[idx], warrantyMonths: parseInt(v || "0") };
                                           setCart(newCart);
                                        }}
                                     >
                                        <SelectTrigger className="h-8 w-[120px] text-xs font-bold border-slate-200 bg-white shadow-sm">
                                           <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="0">No Warranty</SelectItem>
                                           <SelectItem value="1">1 Month</SelectItem>
                                           <SelectItem value="2">2 Months</SelectItem>
                                           <SelectItem value="3">3 Months</SelectItem>
                                           <SelectItem value="6">6 Months</SelectItem>
                                           <SelectItem value="12">1 Year</SelectItem>
                                           <SelectItem value="24">2 Years</SelectItem>
                                        </SelectContent>
                                     </Select>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                     <div className="flex flex-col items-end">
                                        <Input 
                                           type="number" 
                                           className="h-8 w-24 text-right font-black border-slate-200 bg-white"
                                           value={row.unitPrice}
                                           onChange={e => {
                                              const val = parseFloat(e.target.value) || 0;
                                              const newCart = [...cart];
                                              newCart[idx] = { ...newCart[idx], unitPrice: val };
                                              setCart(newCart);
                                           }}
                                        />
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Cost: ৳{row.costPrice.toLocaleString()}</div>
                                     </div>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                     <div className="font-black text-primary text-md">৳{(row.unitPrice * row.imeis.length).toLocaleString()}</div>
                                  </TableCell>
                                  <TableCell className="text-right pr-6 py-4">
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
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
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t('customers')} Info</h3>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="flex-1">
                      <SearchableSelect
                         options={contacts.map(c => ({ label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`, value: c.id }))}
                         value={customerInfo.id}
                         onChange={(val) => {
                            const contact = contacts.find(c => c.id === val);
                            if (contact) {
                               const isWalkIn = contact.name.toLowerCase().includes("customer");
                               setCustomerInfo({ 
                                  id: contact.id, 
                                  name: isWalkIn ? "Walk-in Customer" : contact.name, 
                                  phone: isWalkIn ? "" : (contact.phone || ""), 
                                  address: contact.address || "" 
                               });
                               setCustomerType(isWalkIn ? "walk-in" : "registered");
                            }
                         }}
                         placeholder={`${t('search')} ${t('contacts')}...`}
                         className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                      />
                   </div>
                   <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0 border-primary/20 text-primary hover:bg-primary/10" onClick={() => setIsQuickAddOpen(true)} title="Quick Add Contact [F9]">
                      <Plus className="h-5 w-5" />
                   </Button>
                </div>

                {customerType === "walk-in" && (
                   <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-4 shadow-inner relative">
                      <p className="text-[10px] font-black text-amber-600 uppercase text-center mb-1 bg-amber-100/50 py-1 rounded-md">Walk-in Customer Details</p>
                      
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('phone')}</Label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                               <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input 
                               placeholder={t('phone_placeholder')} 
                               className="h-10 pl-10 border-slate-200 bg-white focus:ring-1 focus:ring-amber-500/30 transition-all rounded-lg text-sm font-medium"
                               value={customerInfo.phone} 
                               onChange={e => searchCustomerHistory(e.target.value)} 
                            />

                            {phoneSuggestions.length > 0 && (
                               <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  <div className="px-3 py-1.5 bg-slate-50 border-b text-[9px] font-bold text-slate-400 uppercase tracking-wider">Historical Suggestions</div>
                                  {phoneSuggestions.map(s => (
                                     <div key={s.id || s.phone} className="px-4 py-3 hover:bg-primary/5 cursor-pointer flex justify-between items-center border-b last:border-0 border-slate-100 group/item" onClick={() => { setCustomerInfo({ ...customerInfo, phone: s.phone, name: s.name, address: s.address }); setPhoneSuggestions([]); }}>
                                        <div>
                                           <div className="font-bold text-sm text-slate-900 group-hover/item:text-primary transition-colors">{s.name}</div>
                                           <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">{s.phone}</div>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-0 group-hover/item:opacity-100" />
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('name')}</Label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                               <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input 
                               className="h-10 pl-10 border-slate-200 bg-white focus:ring-1 focus:ring-amber-500/30 transition-all rounded-lg text-sm font-medium" 
                               value={customerInfo.name === "Walk-in Customer" ? "" : customerInfo.name} 
                               onChange={e => setCustomerInfo({...customerInfo, name: e.target.value || "Walk-in Customer"})} 
                               placeholder={t('name_placeholder')}
                            />
                         </div>
                      </div>
                      
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('address')}</Label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                               <Tag className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input 
                               className="h-10 pl-10 border-slate-200 bg-white focus:ring-1 focus:ring-amber-500/30 transition-all rounded-lg text-sm font-medium" 
                               value={customerInfo.address ?? ""} 
                               onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                               placeholder={t('address_placeholder')}
                            />
                         </div>
                      </div>
                   </div>
                )}
                {customerType === "registered" && (
                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 shadow-inner">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-bold text-slate-900 text-sm">{customerInfo.name}</span>
                         </div>
                         <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] font-black uppercase">Registered</Badge>
                      </div>
                      {customerInfo.phone && (
                         <div className="flex items-center gap-2 text-slate-500 text-xs mt-2">
                            <Phone className="h-3 w-3" />
                            <span>{customerInfo.phone}</span>
                         </div>
                      )}
                      {customerInfo.address && (
                         <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                            <Tag className="h-3 w-3" />
                            <span>{customerInfo.address}</span>
                         </div>
                      )}
                   </div>
                )}
             </div>
          </div>

          {/* Payment Details */}
          <div className="flex-1 p-6 space-y-6">
             <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Payment Breakdown</h3>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">{t('total')}</span>
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

                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Service</span>
                            <div className="flex items-center gap-1">
                               <span className="text-xs font-mono font-bold text-slate-400">৳</span>
                               <input 
                                  type="number" 
                                  className="w-full bg-transparent border-none font-black text-slate-900 focus:ring-0 p-0 text-sm" 
                                  value={serviceCharge} 
                                  onChange={e => setServiceCharge(parseFloat(e.target.value) || 0)} 
                               />
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">VAT</span>
                            <div className="flex items-center gap-1">
                               <span className="text-xs font-mono font-bold text-slate-400">৳</span>
                               <input 
                                  type="number" 
                                  className="w-full bg-transparent border-none font-black text-slate-900 focus:ring-0 p-0 text-sm" 
                                  value={vat} 
                                  onChange={e => setVat(parseFloat(e.target.value) || 0)} 
                               />
                            </div>
                         </div>
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
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Received [F10]</Label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                         <span className="font-black text-slate-300 group-focus-within:text-primary transition-colors">৳</span>
                      </div>
                      <Input 
                         ref={paymentInputRef}
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
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('invoice_no')} #</Label>
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
                disabled={(cart.reduce((acc, row) => acc + row.imeis.length, 0)) === 0 || loading} 
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
                        {t('confirm')} INVOICE [F8]
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

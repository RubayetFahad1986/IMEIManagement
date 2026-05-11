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
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Trash2, CreditCard, User, UserPlus, Phone, MapPin, SearchCode } from "lucide-react";
import { toast } from "sonner";
import { QuickAddContact } from "@/components/ui/quick-add-contact";

interface InventoryItem {
  id: number;
  mobileDevice: { brand: string; modelName: string; variantName: string; };
  imei1: string;
  currentSalePrice: number;
}

interface CartItem extends InventoryItem {
  warrantyMonths: number;
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Walk-in / Customer Logic
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ id: 1, name: "Walk-in Customer", phone: "", address: "" });
  const [phoneSuggestions, setPhoneSuggestions] = useState<any[]>([]);

  const searchInventory = async (term: string) => {
    if (term.length < 3) { setSearchResults([]); return; }
    try {
      const allInventory: InventoryItem[] = await apiFetch("/erp/inventory");
      const filtered = allInventory.filter(i => !i.isSold && (i.imei1.includes(term) || i.mobileDevice.modelName.toLowerCase().includes(term.toLowerCase())));
      setSearchResults(filtered);
    } catch (error) { console.error(error); }
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
    setIsWalkIn(false);
    setPhoneSuggestions([]);
  };

  const addToCart = (item: InventoryItem) => {
    if (cart.find(c => c.id === item.id)) { toast.error("Item already in cart"); return; }
    setCart([...cart, { ...item, warrantyMonths: 12 }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.currentSalePrice, 0);
  const netTotal = subtotal - discount;

  const handleSale = async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    setLoading(true);
    try {
      await apiFetch("/erp/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: customerInfo.id,
          discount,
          paidAmount: paidAmount || netTotal,
          items: cart.map(c => ({ inventoryItemId: c.id, warrantyMonths: c.warrantyMonths })),
        }),
      });
      toast.success("Sale completed!");
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
      setCustomerInfo({ id: 1, name: "Walk-in Customer", phone: "", address: "" });
      setIsWalkIn(true);
    } catch (error: any) {
      toast.error("Sale failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Item Search</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Scan IMEI or Search Model..." className="pl-8" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); searchInventory(e.target.value); }} />
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y max-h-60 overflow-auto bg-white shadow-lg">
                {searchResults.map(item => (
                  <div key={item.id} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => addToCart(item)}>
                    <div>
                      <div className="font-medium">{item.mobileDevice.brand} {item.mobileDevice.modelName}</div>
                      <div className="text-xs text-muted-foreground">IMEI: {item.imei1}</div>
                    </div>
                    <div className="font-bold text-blue-600">${item.currentSalePrice.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Cart is empty.</TableCell></TableRow>
                ) : (
                  cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.mobileDevice.modelName}</div>
                        <div className="text-xs text-muted-foreground">{item.imei1}</div>
                      </TableCell>
                      <TableCell>
                        <select className="bg-transparent text-sm border-none focus:ring-0" value={item.warrantyMonths} onChange={e => {
                          const newCart = [...cart];
                          const idx = newCart.findIndex(c => c.id === item.id);
                          newCart[idx].warrantyMonths = parseInt(e.target.value);
                          setCart(newCart);
                        }}>
                          <option value={0}>No Warranty</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>12 Months</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right font-medium">${item.currentSalePrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setCart(cart.filter(c => c.id !== item.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-t-4 border-t-blue-600">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm flex items-center"><User className="mr-2 h-4 w-4 text-blue-600" /> Customer</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-blue-600" onClick={() => setIsQuickAddOpen(true)}><UserPlus className="h-3 w-3 mr-1" /> New</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-2 top-3 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search Phone No..." className="pl-7 h-9 text-sm" value={customerInfo.phone} onChange={e => searchCustomerByPhone(e.target.value)} />
              
              {phoneSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-xl overflow-hidden">
                  {phoneSuggestions.map(s => (
                    <div key={s.id} className="p-2 hover:bg-slate-100 cursor-pointer text-sm flex justify-between" onClick={() => selectCustomer(s)}>
                       <span>{s.name}</span>
                       <span className="text-xs text-slate-500 font-mono">{s.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="space-y-1">
                 <Label className="text-[10px] uppercase font-bold text-slate-500">Full Name</Label>
                 <Input className="h-8 bg-white" value={customerInfo.name} onChange={e => {setCustomerInfo({...customerInfo, name: e.target.value}); setIsWalkIn(false);}} />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] uppercase font-bold text-slate-500">Address</Label>
                 <Input className="h-8 bg-white" value={customerInfo.address} onChange={e => {setCustomerInfo({...customerInfo, address: e.target.value}); setIsWalkIn(false);}} />
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-600 text-white shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10"><CreditCard className="h-24 w-24" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-blue-100">Checkout</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm opacity-90"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between items-center text-sm">
              <span>Discount</span>
              <input type="number" className="w-20 text-right bg-blue-700 border-none rounded px-2 h-7 focus:ring-1 focus:ring-blue-300" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="pt-4 border-t border-blue-500 flex justify-between font-bold text-2xl">
              <span>Total</span><span>${netTotal.toLocaleString()}</span>
            </div>
            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold uppercase opacity-80">Payment Received</label>
              <Input type="number" className="text-right text-xl font-bold h-12 bg-white text-blue-900 border-none shadow-inner" placeholder={netTotal.toString()} value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg bg-white text-blue-600 hover:bg-blue-50 font-bold border-none" disabled={cart.length === 0 || loading} onClick={handleSale}>
              {loading ? "Processing..." : "Complete Sale"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <QuickAddContact isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSuccess={selectCustomer} />
    </div>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Trash2, CreditCard, User } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: number;
  mobileDevice: {
    brand: string;
    modelName: string;
    variantName: string;
  };
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

  const searchInventory = async (term: string) => {
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const allInventory: InventoryItem[] = await apiFetch("/erp/inventory");
      const filtered = allInventory.filter(
        (i: any) =>
          !i.isSold &&
          (i.imei1.includes(term) ||
            i.mobileDevice.modelName.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = (item: InventoryItem) => {
    if (cart.find((c) => c.id === item.id)) {
      toast.error("Item already in cart");
      return;
    }
    setCart([...cart, { ...item, warrantyMonths: 12 }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.currentSalePrice, 0);
  const netTotal = subtotal - discount;

  const handleSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/erp/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: 1, // Default walk-in
          discount: discount,
          paidAmount: paidAmount || netTotal,
          items: cart.map((c) => ({
            inventoryItemId: c.id,
            warrantyMonths: c.warrantyMonths,
          })),
        }),
      });
      toast.success("Sale completed successfully!");
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
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
          <CardHeader>
            <CardTitle>Item Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan IMEI or Search Model..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchInventory(e.target.value);
                }}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y max-h-60 overflow-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                    onClick={() => addToCart(item)}
                  >
                    <div>
                      <div className="font-medium">
                        {item.mobileDevice.brand} {item.mobileDevice.modelName}
                      </div>
                      <div className="text-xs text-muted-foreground">IMEI: {item.imei1}</div>
                    </div>
                    <div className="font-bold">${item.currentSalePrice.toLocaleString()}</div>
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
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Cart is empty. Scan an IMEI to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.mobileDevice.modelName}</div>
                        <div className="text-xs text-muted-foreground">{item.imei1}</div>
                      </TableCell>
                      <TableCell>
                        <select 
                          className="bg-transparent text-sm border-none focus:ring-0"
                          value={item.warrantyMonths}
                          onChange={(e) => {
                            const newCart = [...cart];
                            const idx = newCart.findIndex(c => c.id === item.id);
                            newCart[idx].warrantyMonths = parseInt(e.target.value);
                            setCart(newCart);
                          }}
                        >
                          <option value={0}>No Warranty</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>12 Months</option>
                          <option value={24}>24 Months</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.currentSalePrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" /> Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Discount</span>
              <Input
                type="number"
                className="w-24 text-right h-8"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="pt-4 border-t flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${netTotal.toLocaleString()}</span>
            </div>
            <div className="space-y-2 pt-4">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Payment Received</label>
              <Input
                type="number"
                placeholder="Enter amount paid"
                className="text-right text-xl font-bold h-12"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg" disabled={cart.length === 0 || loading} onClick={handleSale}>
              {loading ? "Processing..." : "Complete Sale"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <User className="mr-2 h-4 w-4" /> Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground">Walk-in Customer (Default)</p>
             <Button variant="outline" size="sm" className="w-full mt-2" disabled>Change Customer</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
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
import { Truck, Plus, Trash2, Save, UserPlus, Smartphone, Copy, ArrowLeft, X, History, ShieldCheck, Printer, Package, LayoutGrid } from "lucide-react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { QuickAddContact } from "@/components/ui/quick-add-contact";
import { QuickAddMobileDevice } from "@/components/ui/quick-add-mobile-device";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LabelPrintingModal } from "@/components/ui/label-printing-modal";
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
  color?: string;
  ram?: string;
  storage?: string;
  defaultCostPrice: number;
  defaultSalesPrice: number;
}

interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  unit?: string;
}

interface ProductCategory {
  id: number;
  name: string;
}

interface MasterData {
  id: number;
  name: string;
}

interface PurchaseEntryFormProps {
  id?: string;
}

export default function PurchaseEntryForm({ id }: PurchaseEntryFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  
  // New Master Data State
  const [warrantyTypes, setWarrantyTypes] = useState<MasterData[]>([]);
  const [warrantyDurations, setWarrantyDurations] = useState<MasterData[]>([]);
  const [warrantyCoverages, setWarrantyCoverages] = useState<MasterData[]>([]);
  const [productConditions, setProductConditions] = useState<MasterData[]>([]);
  const [marketTypes, setMarketTypes] = useState<MasterData[]>([]);

  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDeviceQuickAddOpen, setIsDeviceQuickAddOpen] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddDeviceName, setQuickAddDeviceName] = useState("");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Label Printing State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printItems, setPrintItems] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    supplierId: "" as string | number,
    invoiceNo: "",
    paidAmount: 0,
    items: [] as any[]
  });

  useEffect(() => {
    fetchBaseData();
  }, [id]);

  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const calls: Promise<any>[] = [
        apiFetch("/setup/suppliers"),
        apiFetch("/setup/mobile-devices?pageSize=1000"),
        apiFetch("/setup/products?pageSize=1000"),
        apiFetch("/setup/categories"),
        apiFetch("/setup/warranty-types"),
        apiFetch("/setup/warranty-durations"),
        apiFetch("/setup/warranty-coverages"),
        apiFetch("/setup/product-conditions"),
        apiFetch("/setup/market-types"),
      ];

      if (isEdit) {
        calls.push(apiFetch(`/erp/purchases/${id}`));
      }

      const results = await Promise.all(calls);
      const [sData, dData, pCatalog, cData, wtData, wdData, wcData, pcData, mtData, pData] = results;

      setSuppliers(sData.items || sData);
      setDevices(dData.items || dData);
      setProducts(pCatalog.items || pCatalog);
      setCategories(cData);
      setWarrantyTypes(wtData);
      setWarrantyDurations(wdData);
      setWarrantyCoverages(wcData);
      setProductConditions(pcData);
      setMarketTypes(mtData);

      if (isEdit && pData) {
        console.log("Debug: pData received:", pData);
        const purchase = pData.purchase || pData.Purchase;
        if (!purchase) {
          toast.error("Purchase not found");
          router.push("/purchases");
          return;
        }

        const items = (purchase.details || purchase.Details || []).map((d: any) => {
          console.log("Debug: Processing detail:", d);
          const rawImeiItems = d.imeiItems || d.ImeiItems || [];
          const imeis = rawImeiItems.map((im: any) => ({
            id: im.id || im.Id,
            imei1: im.imei1 || im.imeI1 || im.IMEI1 || im.imei || "",
            status: im.status || im.Status || "Available",
            isUsed: im.isUsed !== undefined ? im.isUsed : (im.IsUsed !== undefined ? im.IsUsed : false)
          }));

          const imeiListString = imeis.map((im: any) => im.imei1).filter(Boolean).join("\n");
          console.log("Debug: Derived imeiList:", imeiListString);

          return {
            id: d.id || d.Id,
            mobileDeviceId: d.mobileDeviceId || d.MobileDeviceId,
            productId: d.productId || d.ProductId,
            rowType: d.productId ? "Product" : "Mobile",
            quantity: d.quantity || d.Quantity || (imeis.length > 0 ? imeis.length : 1),
            imeis: imeis,
            imeiList: imeiListString,
            costPrice: d.costPrice || d.CostPrice,
            salePrice: d.salePrice || d.SalePrice,
            conditionId: d.conditionId || d.ConditionId,
            warrantyTypeId: d.warrantyTypeId || d.WarrantyTypeId,
            warrantyDurationId: d.warrantyDurationId || d.WarrantyDurationId,
            warrantyCoverageId: d.warrantyCoverageId || d.WarrantyCoverageId,
            marketTypeId: d.marketTypeId || d.MarketTypeId,
            warrantyRemarks: d.warrantyRemarks || d.WarrantyRemarks,
            commissionAmount: 0 
          };
        });

        setFormData({
          supplierId: purchase.supplierId || purchase.SupplierId,
          invoiceNo: purchase.invoiceNo || purchase.InvoiceNo,
          paidAmount: purchase.paidAmount || purchase.PaidAmount,
          items: items
        });
      }
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
      if (isEdit) router.push("/purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = (name: string) => {
    setQuickAddName(name);
    setIsQuickAddOpen(true);
  };

  const handleCreateDevice = (name: string, index: number) => {
    setQuickAddDeviceName(name);
    setActiveItemIndex(index);
    setIsDeviceQuickAddOpen(true);
  };

  const addItem = (type: "Mobile" | "Product" = "Mobile") => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: null,
        mobileDeviceId: "", 
        productId: "",
        rowType: type,
        quantity: 1,
        imeiList: "", 
        imeis: [],
        costPrice: 0, 
        salePrice: 0, 
        conditionId: productConditions[0]?.id || "",
        warrantyTypeId: warrantyTypes[1]?.id || "", // Default to Official
        warrantyDurationId: warrantyDurations[7]?.id || "", // Default to 1 Year
        warrantyCoverageId: warrantyCoverages[7]?.id || "", // Default to Full
        marketTypeId: marketTypes[0]?.id || "", // Default to Official
        warrantyRemarks: "",
        commissionAmount: 0 
      }]
    }));
  };

  const duplicateItem = (item: any) => {
    setFormData(prev => ({ 
        ...prev, 
        items: [...prev.items, { ...item, id: null, imeiList: "", imeis: [] }] 
    }));
    toast.info("Model details copied.");
  };

  const removeItem = (idx: number) => {
    const item = formData.items[idx];
    const hasUsedImeis = item.imeis?.some((im: any) => im.isUsed);
    if (hasUsedImeis) {
      toast.error("Cannot remove this row because some items have already been sold.");
      return;
    }
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
        
        if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product) {
                // Products might not have default prices in schema yet, but we can add them later
                updatedItem.costPrice = 0;
                updatedItem.salePrice = 0;
            }
        }

        if (field === "imeiList") {
            const currentImeis = (updatedItem.imeis || []) as any[];
            const newImeiStrings = value.split(/[\n,\s]+/).filter(Boolean);
            
            // 1. Validation: Ensure all sold/used IMEIs are still present and UNCHANGED in the list
            const soldImeis = currentImeis.filter((im: any) => im.isUsed);
            const missingSoldImeis = soldImeis.filter((im: any) => !newImeiStrings.includes(im.imei1));
            
            if (missingSoldImeis.length > 0) {
                toast.error(`Strong Validation: Cannot remove or edit sold IMEIs: ${missingSoldImeis.map((im: any) => im.imei1).join(", ")}`);
                return prev; // Reject the update entirely
            }

            // 2. Sync objects: Keep existing objects (matching by imei1 string) and add new ones
            updatedItem.imeis = newImeiStrings.map((s: string) => {
                const existing = currentImeis.find((im: any) => im.imei1 === s);
                return existing || { imei1: s, status: "Available", isUsed: false };
            });
            updatedItem.quantity = updatedItem.imeis.length;
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
      const endpoint = isEdit ? `/erp/purchases/${id}` : "/erp/purchase";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        supplierId: typeof formData.supplierId === "string" ? parseInt(formData.supplierId) : formData.supplierId,
        items: formData.items.map(i => {
          const parsedImeis = i.imeiList.split(/[\n,\s]+/).filter(Boolean).map((imeiStr: string) => {
              const existing = i.imeis?.find((im: any) => im.imei1 === imeiStr);
              return {
                  id: existing?.id || null,
                  IMEI1: imeiStr,
                  IMEI2: existing?.imei2 || "",
                  SerialNumber: existing?.serialNumber || ""
              };
          });

          return {
            id: i.id,
            mobileDeviceId: i.mobileDeviceId ? parseInt(i.mobileDeviceId.toString()) : null,
            productId: i.productId ? parseInt(i.productId.toString()) : null,
            quantity: parseFloat((i.quantity || 0).toString()),
            ImeiItems: parsedImeis,
            costPrice: parseFloat((i.costPrice || 0).toString()),
            salePrice: parseFloat((i.salePrice || 0).toString()),
            conditionId: i.conditionId ? parseInt(i.conditionId.toString()) : null,
            warrantyTypeId: i.warrantyTypeId ? parseInt(i.warrantyTypeId.toString()) : null,
            warrantyDurationId: i.warrantyDurationId ? parseInt(i.warrantyDurationId.toString()) : null,
            warrantyCoverageId: i.warrantyCoverageId ? parseInt(i.warrantyCoverageId.toString()) : null,
            marketTypeId: i.marketTypeId ? parseInt(i.marketTypeId.toString()) : null,
            warrantyRemarks: i.warrantyRemarks || "",
            commissionAmount: parseFloat((i.commissionAmount || 0).toString())
          };
        })
      };

      // Basic validation
      if (payload.items.some(i => !i.mobileDeviceId && !i.productId)) {
        toast.error("One or more rows have no item selected.");
        setIsSaving(false);
        return;
      }

      await apiFetch(endpoint, {
        method: method,
        body: JSON.stringify(payload),
      });

      // Prepare label printing data
      const printLabels = formData.items.flatMap(i => {
          if (i.rowType === "Mobile") {
              const device = devices.find(d => d.id === i.mobileDeviceId);
              return i.imeis.map((im: any) => ({
                  name: device?.modelName || "N/A",
                  brand: device?.brand || "N/A",
                  price: i.salePrice,
                  identifier: im.imei1,
                  type: "Mobile",
                  quantity: 1
              }));
          } else {
              const product = products.find(p => p.id === i.productId);
              return [{
                  name: product?.name || "N/A",
                  brand: "General",
                  price: i.salePrice,
                  identifier: product?.barcode || product?.sku || "N/A",
                  type: "General",
                  quantity: i.quantity
              }];
          }
      });

      setPrintItems(printLabels);
      toast.success(isEdit ? "Purchase updated!" : "Purchase recorded!");
      
      // Auto-open print modal if there are items
      if (printLabels.length > 0) {
          setIsPrintModalOpen(true);
      } else {
          router.push("/purchases");
      }
    } catch (error: any) {
      toast.error("Failed to save purchase: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Initializing Multi-Business Purchase Module...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/purchases">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">{isEdit ? "Edit Purchase" : "Stock Inbound <Wizard>"}</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{isEdit ? `Modifying Invoice: ${formData.invoiceNo}` : "Handle IMEIs, Groceries, and Barcodes in one flow."}</p>
          </div>
        </div>
        <div className="flex gap-2">
            {!isEdit && (
                <Button variant="outline" className="font-bold uppercase text-xs rounded-xl" onClick={() => router.push("/purchases")}><History className="mr-2 h-4 w-4" /> History</Button>
            )}
            <Button variant="secondary" className="font-bold uppercase text-xs rounded-xl" onClick={() => setIsPrintModalOpen(true)} disabled={formData.items.length === 0}>
                <Printer className="mr-2 h-4 w-4" /> Print Labels
            </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Supplier & Invoice</CardTitle>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Transaction Header Details</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="text-primary font-black uppercase text-xs hover:bg-white/10 rounded-xl" onClick={() => { setQuickAddName(""); setIsQuickAddOpen(true); }}>
                <UserPlus className="h-4 w-4 mr-1" /> New Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Supplier Name</Label>
              <SearchableSelect 
                options={suppliers.map(s => ({ label: s.name, value: s.id }))} 
                value={formData.supplierId} 
                onChange={(val: string | number) => setFormData(prev => ({...prev, supplierId: val}))} 
                placeholder="Search Supplier..." 
                onCreate={handleCreateSupplier}
                className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Invoice No.</Label>
              <Input className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" placeholder={isEdit ? "Invoice Number" : "Auto-Generated"} value={formData.invoiceNo} onChange={e => setFormData(prev => ({...prev, invoiceNo: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-green-600 tracking-widest">Initial Payment</Label>
              <Input type="number" className="h-12 rounded-xl border-green-50 bg-green-50/30 font-bold text-green-700" value={formData.paidAmount} onChange={e => setFormData(prev => ({...prev, paidAmount: parseFloat(e.target.value) || 0}))} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b p-8">
            <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><LayoutGrid className="h-6 w-6 text-primary" /> Product Inventory</CardTitle>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Add Mobile Devices or General Products</p>
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addItem("Product")} className="rounded-xl font-bold uppercase text-[10px] border-2">
                    <Package className="mr-1 h-3 w-3" /> Add Grocery/Product
                </Button>
                <Button type="button" variant="default" size="sm" onClick={() => addItem("Mobile")} className="rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-primary/20">
                    <Plus className="mr-1 h-3 w-3" /> Add Mobile Row
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-none">
                  <TableHead className="w-[350px] pl-8 text-[10px] font-black uppercase tracking-widest">Item Description</TableHead>
                  <TableHead className="w-[280px] text-[10px] font-black uppercase tracking-widest">Details & Warranty</TableHead>
                  <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-widest">Identifiers / Qty</TableHead>
                  <TableHead className="w-[120px] text-right text-[10px] font-black uppercase tracking-widest">Pricing (৳)</TableHead>
                  <TableHead className="w-[80px] text-right pr-8 text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-bold">No products added. Use buttons above to start.</TableCell></TableRow>
                ) : (
                  formData.items.map((item, idx) => (
                    <TableRow key={idx} className={cn(
                        "group transition-colors border-slate-50",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}>
                      <TableCell className="pl-8 align-top pt-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant={item.rowType === "Mobile" ? "default" : "secondary"} className="text-[8px] font-black uppercase rounded-lg px-2 py-0">
                                    {item.rowType === "Mobile" ? <Smartphone className="h-2 w-2 mr-1" /> : <Package className="h-2 w-2 mr-1" />}
                                    {item.rowType}
                                </Badge>
                                <button type="button" onClick={() => updateItem(idx, "rowType", item.rowType === "Mobile" ? "Product" : "Mobile")} className="text-[8px] font-black uppercase text-primary underline underline-offset-2">Switch Type</button>
                            </div>

                            {item.rowType === "Mobile" ? (
                                <SearchableSelect 
                                    options={devices.map(d => ({ 
                                        label: `${d.brand} ${d.modelName}${d.ram || d.storage ? ` (${d.ram || ""}${d.ram && d.storage ? "/" : ""}${d.storage || ""})` : ""} ${d.color || ""}`.trim(), 
                                        value: d.id 
                                    }))} 
                                    value={item.mobileDeviceId} 
                                    onChange={val => updateItem(idx, "mobileDeviceId", val)} 
                                    placeholder="Select Mobile..." 
                                    onCreate={(name) => handleCreateDevice(name, idx)}
                                    className="font-bold border-slate-100 bg-slate-50 rounded-xl h-10"
                                />
                            ) : (
                                <SearchableSelect 
                                    options={products.map(p => ({ label: p.name + (p.sku ? ` [${p.sku}]` : ""), value: p.id }))} 
                                    value={item.productId} 
                                    onChange={val => updateItem(idx, "productId", val)} 
                                    placeholder="Select Product..." 
                                    className="font-bold border-slate-100 bg-slate-50 rounded-xl h-10"
                                />
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                           <div className="space-y-1">
                              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Condition</Label>
                              <SearchableSelect 
                                options={productConditions.map(c => ({ label: c.name, value: c.id }))} 
                                value={item.conditionId} 
                                onChange={v => updateItem(idx, "conditionId", v)} 
                                placeholder="Condition"
                                className="h-8 text-[10px] rounded-lg"
                              />
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Market</Label>
                              <SearchableSelect 
                                options={marketTypes.map(c => ({ label: c.name, value: c.id }))} 
                                value={item.marketTypeId} 
                                onChange={v => updateItem(idx, "marketTypeId", v)} 
                                placeholder="Market"
                                className="h-8 text-[10px] rounded-lg"
                              />
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-6 space-y-4">
                         <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Warranty</Label>
                                <SearchableSelect 
                                    options={warrantyTypes.map(c => ({ label: c.name, value: c.id }))} 
                                    value={item.warrantyTypeId} 
                                    onChange={v => updateItem(idx, "warrantyTypeId", v)} 
                                    className="h-8 text-[10px] rounded-lg"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Period</Label>
                                <SearchableSelect 
                                    options={warrantyDurations.map(c => ({ label: c.name, value: c.id }))} 
                                    value={item.warrantyDurationId} 
                                    onChange={v => updateItem(idx, "warrantyDurationId", v)} 
                                    className="h-8 text-[10px] rounded-lg"
                                />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Coverage</Label>
                            <SearchableSelect 
                                options={warrantyCoverages.map(c => ({ label: c.name, value: c.id }))} 
                                value={item.warrantyCoverageId} 
                                onChange={v => updateItem(idx, "warrantyCoverageId", v)} 
                                className="h-8 text-[10px] rounded-lg"
                            />
                         </div>
                         <Input className="h-8 text-[10px] rounded-lg bg-slate-50 border-none italic font-bold" placeholder="Private Notes..." value={item.warrantyRemarks || ""} onChange={e => updateItem(idx, "warrantyRemarks", e.target.value)} />
                      </TableCell>
                      <TableCell className="align-top pt-6">
                        {item.rowType === "Mobile" ? (
                            <div className="flex flex-col border-2 rounded-2xl bg-white focus-within:border-primary overflow-hidden transition-all shadow-inner">
                                <textarea 
                                    placeholder="Scan IMEIs (One per line)..." 
                                    className="w-full min-h-[140px] p-4 border-none font-mono text-lg font-black bg-transparent resize-none focus:outline-none focus:ring-0" 
                                    value={item.imeiList} 
                                    onChange={e => updateItem(idx, "imeiList", e.target.value)} 
                                />
                                {item.imeis && item.imeis.length > 0 && (
                                    <div className="bg-slate-50 p-3 flex flex-wrap gap-1.5 border-t">
                                        {item.imeis.map((im: any, iIdx: number) => (
                                            <Badge key={iIdx} variant="secondary" className="text-[9px] font-black uppercase px-2 py-0.5 bg-white border-slate-200">
                                                {im.imei1}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Stock Quantity</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            className="h-14 rounded-2xl border-2 text-center text-2xl font-black bg-slate-50 focus:border-primary" 
                                            value={item.quantity} 
                                            onChange={e => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)} 
                                        />
                                        <span className="font-black text-slate-400 italic">Units</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                                        Note: This product will be added to stock as a bulk quantity without individual serial tracking.
                                    </p>
                                </div>
                            </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-6 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Cost Price</Label>
                            <Input type="number" className="h-10 text-right font-black text-lg bg-slate-50 border-none rounded-xl" value={item.costPrice} onChange={e => updateItem(idx, "costPrice", parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-black text-green-600 tracking-tighter">Retail Price</Label>
                            <Input type="number" className="h-10 text-right font-black text-lg bg-green-50 border-none rounded-xl text-green-700" value={item.salePrice} onChange={e => updateItem(idx, "salePrice", parseFloat(e.target.value) || 0)} />
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 align-top pt-6">
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-xl text-blue-600 border-2" onClick={() => duplicateItem(item)}><Copy className="h-4 w-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-xl text-destructive border-2 border-destructive/20" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-900 text-white p-8 justify-between">
             <div className="flex gap-12 items-center">
                <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Rows</span>
                    <span className="text-2xl font-black italic">{formData.items.length}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Units</span>
                    <span className="text-2xl font-black italic">
                        {formData.items.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0)}
                    </span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-12">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Grand Total Cost</span>
                    <span className="text-2xl font-black italic text-primary">৳{formData.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0).toLocaleString()}</span>
                </div>
             </div>
             <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 px-16 h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl shadow-primary/40 transition-all active:scale-95" disabled={isSaving}>
               {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-3 h-6 w-6" /> Confirm Transaction</>}
             </Button>
          </CardFooter>
        </Card>
      </form>

      <QuickAddContact 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onSuccess={(c) => { setSuppliers(prev => [...prev, c]); setFormData(prev => ({...prev, supplierId: c.id})); }} 
        defaultRole="Supplier" 
        initialName={quickAddName}
      />

      <QuickAddMobileDevice
        isOpen={isDeviceQuickAddOpen}
        onClose={() => { setIsDeviceQuickAddOpen(false); setActiveItemIndex(null); }}
        onSuccess={(d) => {
          setDevices(prev => [...prev, d]);
          if (activeItemIndex !== null) {
            updateItem(activeItemIndex, "mobileDeviceId", d.id);
          }
        }}
        initialName={quickAddDeviceName}
      />

      <LabelPrintingModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        items={printItems} 
        invoiceNo={formData.invoiceNo || "NEW"} 
      />
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

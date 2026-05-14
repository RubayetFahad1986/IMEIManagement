"use client";

import { use, useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, Share2, ArrowLeft, Smartphone, FileText, Layout, CreditCard, Receipt, FileSpreadsheet, FileJson, FileType, ChevronUp, ChevronDown, Maximize2, Minus, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceProps {
  params: Promise<{ type: string; id: string }>;
}

export default function InvoiceReportPage({ params }: InvoiceProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { type, id } = resolvedParams;
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState<"professional" | "modern" | "compact">("professional");
  const [paperSize, setPaperSize] = useState<"A4" | "A5" | "80mm">("A4");
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const savedStyle = sessionStorage.getItem("invoice-style");
    const savedSize = sessionStorage.getItem("invoice-paper-size");
    const savedControls = sessionStorage.getItem("invoice-controls-visible");
    const savedZoom = sessionStorage.getItem("invoice-zoom");
    
    if (savedStyle) setStyle(savedStyle as any);
    if (savedSize) setPaperSize(savedSize as any);
    if (savedControls !== null) setIsControlsVisible(savedControls === "true");
    if (savedZoom) setZoom(parseFloat(savedZoom));
    
    fetchInvoice();
  }, [type, id]);

  useEffect(() => {
    sessionStorage.setItem("invoice-style", style);
    sessionStorage.setItem("invoice-paper-size", paperSize);
    sessionStorage.setItem("invoice-controls-visible", isControlsVisible.toString());
    sessionStorage.setItem("invoice-zoom", zoom.toString());
  }, [style, paperSize, isControlsVisible, zoom]);

  const fitToHeight = () => {
    if (!printRef.current) return;
    const availableHeight = window.innerHeight - (isControlsVisible ? 250 : 100);
    const invoiceHeight = printRef.current.offsetHeight || 800;
    const newZoom = Math.min(Math.max(availableHeight / invoiceHeight, 0.3), 1);
    setZoom(newZoom);
    toast.info(`Scaled to ${Math.round(newZoom * 100)}% to fit screen`);
  };

  const fetchInvoice = async () => {
    try {
      const [invData, compData] = await Promise.all([
        apiFetch(`/erp/${type}s/${id}`),
        apiFetch("/company/1")
      ]);
      setData(invData);
      setCompany(compData);
    } catch (error: any) {
      toast.error("Failed to load invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inv = type === "purchase" ? (data?.purchase || data?.Purchase) : (data?.sale || data?.Sale);
  const partner = type === "purchase" ? (data?.supplier || data?.Supplier) : (data?.customer || data?.Customer);

  const getDeviceDesc = (item: any) => {
    const device = type === "purchase" ? (item.mobileDevice || item.MobileDevice) : (item.inventoryItem?.mobileDevice || item.inventoryItem?.MobileDevice);
    if (!device) return (item.inventoryItem?.product?.name || item.product?.name || "Unknown Item");
    
    let desc = `${device.brand || device.Brand} ${device.modelName || device.ModelName}`;
    const specs = [];
    if (device.ram || device.RAM) specs.push(device.ram || device.RAM);
    if (device.storage || device.Storage) specs.push(device.storage || device.Storage);
    if (device.color || device.Color) specs.push(device.color || device.Color);
    
    if (specs.length > 0) {
      desc += ` (${specs.join("/")})`;
    }
    return desc;
  };

  const getGroupedDetails = () => {
    if (!inv || !inv.details) return [];
    const grouped: any[] = [];
    inv.details.forEach((item: any) => {
      const productName = getDeviceDesc(item);
      const invItem = type === "purchase" ? item : item.inventoryItem;
      const price = item.unitPrice || item.UnitPrice || item.costPrice || item.CostPrice || 0;
      const warranty = item.warrantyMonths || item.WarrantyMonths || 0;
      const condition = invItem?.condition || invItem?.Condition || "New";
      const isOfficial = invItem?.isOfficial ?? invItem?.IsOfficial ?? true;
      
      const key = `${productName}-${price}-${warranty}-${condition}-${isOfficial}`;
      
      let existing = grouped.find(g => g.key === key);
      if (!existing) {
        existing = {
          key,
          description: productName,
          unitPrice: price,
          warrantyMonths: warranty,
          condition: condition,
          isOfficial: isOfficial,
          imeis: [],
          quantity: 0
        };
        grouped.push(existing);
      }
      
      const imeiItems = item.imeiItems || item.ImeiItems;
      if (type === "purchase" && imeiItems && Array.isArray(imeiItems)) {
        imeiItems.forEach((im: any) => {
          let text = im.imeI1 || im.IMEI1;
          const imei2 = im.imeI2 || im.IMEI2;
          if (imei2) text += ` / ${imei2}`;
          
          if (im.serialNumber || im.SerialNumber) {
            text += ` (S/N: ${im.serialNumber || im.SerialNumber})`;
          }
          existing.imeis.push(text);
          existing.quantity += 1;
        });
      } else {
        const imei1 = item.imeI1 || item.IMEI1 || item.inventoryItem?.imeI1 || item.inventoryItem?.IMEI1;
        const imei2 = item.imeI2 || item.IMEI2 || item.inventoryItem?.imeI2 || item.inventoryItem?.IMEI2;
        if (imei1) {
          let text = imei1;
          if (imei2) text += ` / ${imei2}`;
          existing.imeis.push(text);
        } else if (item.serialNumber || item.SerialNumber || item.inventoryItem?.serialNumber || item.inventoryItem?.SerialNumber) {
          existing.imeis.push(item.serialNumber || item.SerialNumber || item.inventoryItem?.serialNumber || item.inventoryItem?.SerialNumber);
        }
        existing.quantity += 1;
      }
    });
    return grouped;
  };

  if (loading) return <div className="p-10 text-center">Generating Report...</div>;
  if (!data || !inv) return <div className="p-10 text-center text-destructive">Invoice not found.</div>;

  const groupedItems = getGroupedDetails();
  const invDate = inv.salesDate || inv.purchaseDate || inv.createDate || inv.CreateDate || new Date();
  const printClass = paperSize === "A4" ? "print-a4" : paperSize === "A5" ? "print-a5" : "print-80mm";

  const handlePrint = () => window.print();

  const styles = {
    professional: (
      <div className={`bg-white p-8 shadow-lg min-h-[800px] flex flex-col border border-slate-200 ${printClass} print:shadow-none print:border-none print:p-0`}>
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-8">
           <div>
             {company.logoPath && <img src={company.logoPath} alt="Logo" className="h-16 mb-4 object-contain" />}
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{company.name}</h1>
             <p className="text-xs text-slate-500 max-w-xs font-medium uppercase tracking-widest mt-1">{company.address}</p>
             <p className="text-xs text-slate-500 font-bold mt-1">CONTACT: {company.phone}</p>
           </div>
           <div className="text-right">
             <h2 className="text-5xl font-black text-slate-100 uppercase mb-4 leading-none">{type} INVOICE</h2>
             <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Invoice Number</p>
                <p className="text-lg font-black">{inv.invoiceNo}</p>
             </div>
             <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-widest">Date: {format(new Date(invDate), "dd MMM yyyy")}</p>
           </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-10 mb-10">
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-[0.2em]">Customer / Partner Details</h3>
              <div className="font-black text-xl text-slate-900 uppercase tracking-tight">{partner?.name || "Walk-in Customer"}</div>
              <p className="text-sm text-slate-500 mt-2 font-medium">{partner?.address || "No address provided"}</p>
              <p className="text-sm text-slate-900 font-bold mt-2">PHONE: {partner?.phone || "N/A"}</p>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">#</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Description of Goods</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Unit Price</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b">
              {groupedItems.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight">{item.description}</div>
                    <div className="flex items-center gap-2 mt-1 mb-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-2 border-blue-200 text-blue-600">Warranty: {item.warrantyMonths || 0} Mo</Badge>
                        <Badge variant="secondary" className="text-[9px] font-black uppercase py-0 px-2 bg-slate-100">{item.isOfficial ? "Official" : "Unofficial"}</Badge>
                        <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-2 border-slate-200">{item.condition}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.imeis.map((imei: string, iIdx: number) => (
                            <Badge key={iIdx} variant="secondary" className="bg-slate-100 text-slate-900 border-slate-300 font-mono text-[17px] font-black px-3 py-1 shadow-sm">
                                {imei}
                            </Badge>
                        ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-black text-slate-900 text-right italic">৳{item.unitPrice.toLocaleString()}</td>
                  <td className="p-4 text-sm font-black text-slate-900 text-center">{item.quantity}</td>
                  <td className="p-4 text-sm text-right font-black text-slate-900 italic">
                    ৳{(item.unitPrice * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-12">
           <div className="w-80 space-y-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest"><span>Subtotal</span><span>৳{(inv.subTotal || inv.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest"><span>Discount</span><span>-৳{(inv.discount || 0).toLocaleString()}</span></div>
              {(inv.serviceCharge > 0 || inv.ServiceCharge > 0) && (
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest"><span>Service Charge</span><span>+৳{(inv.serviceCharge || inv.ServiceCharge || 0).toLocaleString()}</span></div>
              )}
              {(inv.vat > 0 || inv.VAT > 0) && (
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest"><span>VAT</span><span>+৳{(inv.vat || inv.VAT || 0).toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-black text-2xl border-t-2 border-white pt-4 text-slate-900 tracking-tighter italic"><span>TOTAL</span><span>৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-black bg-blue-600 text-white p-3 rounded-xl mt-4 shadow-lg shadow-blue-100 uppercase tracking-widest"><span>PAID AMOUNT</span><span>৳{(inv.paidAmount || 0).toLocaleString()}</span></div>
           </div>
        </div>

        {/* T&C */}
        <div className="mt-auto pt-10 border-t-2 border-dashed border-slate-100">
           <h4 className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-[0.3em]">Terms & Conditions of Service</h4>
           <div className="text-[10px] text-slate-400 font-medium whitespace-pre-wrap leading-relaxed max-h-40 overflow-hidden italic">{company.termsAndConditions || "No specific terms provided."}</div>
           <div className="mt-12 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                <div>Printed on: {format(new Date(), "dd-MMM-yyyy HH:mm")}</div>
                <div>Dominate ERP Solution v2.0</div>
           </div>
        </div>
      </div>
    ),
    modern: (
      <div className={`bg-white p-0 shadow-2xl min-h-[800px] flex flex-col border border-slate-200 ${printClass} print:shadow-none print:border-none rounded-[2rem] overflow-hidden`}>
        <div className="h-40 bg-blue-600 overflow-hidden relative flex items-center px-12">
           {company.headerImagePath && <img src={company.headerImagePath} alt="Header" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-200" />}
           <div className="relative z-10 flex w-full justify-between items-center text-white">
              <div className="flex items-center gap-6">
                 {company.logoPath && <div className="h-16 w-16 rounded-3xl bg-white p-2 shadow-2xl border-2 border-blue-400"><img src={company.logoPath} alt="Logo" className="w-full h-full object-contain" /></div>}
                 <div><h1 className="text-3xl font-black italic tracking-tighter uppercase">{company.name}</h1><p className="text-[10px] opacity-70 uppercase tracking-[0.4em] font-black mt-1">{type} TRANSACTION RECORD</p></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Electronic ID</div>
                <div className="font-black text-3xl tracking-tighter italic">#{inv.invoiceNo}</div>
              </div>
           </div>
        </div>
        <div className="p-12 flex-1 flex flex-col print:p-8">
           <div className="grid grid-cols-2 gap-12 mb-12 border-b-2 border-slate-50 pb-12">
              <div className="space-y-2">
                 <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Bill Recipient</h3>
                 <div className="font-black text-2xl text-slate-900 tracking-tighter uppercase">{partner?.name || "Walk-in Partner"}</div>
                 <div className="text-sm font-bold text-slate-400 uppercase tracking-tight">{partner?.phone || "Private Contact"}</div>
                 <div className="text-xs font-medium text-slate-500 max-w-xs">{partner?.address}</div>
              </div>
              <div className="space-y-4 text-right">
                 <div>
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Execution Date</h3>
                    <div className="text-lg font-black text-slate-900 italic uppercase">{format(new Date(invDate), "dd MMMM yyyy")}</div>
                 </div>
                 <Badge className={`px-6 py-1.5 font-black text-sm rounded-full ${inv.paidAmount >= (inv.netTotal || inv.totalAmount) ? "bg-emerald-500" : "bg-rose-500"}`}>
                    {inv.paidAmount >= (inv.netTotal || inv.totalAmount) ? "ACCOUNT SETTLED" : "BALANCE DUE"}
                 </Badge>
              </div>
           </div>

           <div className="flex-1 overflow-hidden">
             <table className="w-full">
                <thead>
                   <tr className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-50">
                      <th className="py-4 text-left tracking-[0.2em]">Item / Specs</th>
                      <th className="py-4 text-right tracking-[0.2em]">Rate</th>
                      <th className="py-4 text-center tracking-[0.2em]">Qty</th>
                      <th className="py-4 text-right tracking-[0.2em]">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                   {groupedItems.map((item: any, idx: number) => (
                      <tr key={idx} className="group">
                         <td className="py-6">
                            <div className="font-black text-slate-900 text-[16px] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{item.description}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Hardware Warranty: {item.warrantyMonths || 0} Months | {item.condition} | {item.isOfficial ? "Official" : "Int"}</div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.imeis.map((imei: string, iIdx: number) => (
                                    <Badge key={iIdx} variant="secondary" className="bg-slate-50 text-slate-900 border-slate-300 font-mono text-[15px] font-black px-3 py-1 rounded shadow-sm uppercase">
                                        ID: {imei}
                                    </Badge>
                                ))}
                            </div>
                         </td>
                         <td className="py-6 text-right font-black text-slate-900 italic">৳{item.unitPrice.toLocaleString()}</td>
                         <td className="py-6 text-center font-black text-slate-900">{item.quantity}</td>
                         <td className="py-6 text-right">
                            <div className="font-black text-slate-900 text-xl italic tracking-tighter">৳{(item.unitPrice * item.quantity).toLocaleString()}</div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

           <div className="mt-8 space-y-2 border-t pt-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-4"><span>Gross Subtotal</span><span className="text-slate-900 font-black">৳{(inv.subTotal || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest px-4"><span>Loyalty Discount</span><span>-৳{(inv.discount || 0).toLocaleString()}</span></div>
              {(inv.serviceCharge > 0 || inv.ServiceCharge > 0) && (
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-4"><span>Processing Fee</span><span className="text-slate-900 font-black">৳{(inv.serviceCharge || inv.ServiceCharge || 0).toLocaleString()}</span></div>
              )}
              {(inv.vat > 0 || inv.VAT > 0) && (
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-4"><span>Government VAT</span><span className="text-slate-900 font-black">৳{(inv.vat || inv.VAT || 0).toLocaleString()}</span></div>
              )}
           </div>

           <div className="mt-6 bg-blue-600 p-10 rounded-[2.5rem] flex justify-between items-center print:mt-6 shadow-2xl shadow-blue-200">
              <div className="text-white">
                 <h4 className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-2 italic">Official Authorization</h4>
                 <div className="text-xs font-bold opacity-80 max-w-sm">This is a digitally generated invoice. No physical signature is required. Warranty claims must include this record.</div>
              </div>
              <div className="text-right text-white">
                 <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-1 italic">Total Transaction Value</div>
                 <div className="text-5xl font-black tracking-tighter italic">৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString()}</div>
              </div>
           </div>
        </div>
      </div>
    ),
    compact: (
      <div className={`bg-white w-[300px] mx-auto p-6 shadow-xl border-2 border-slate-100 border-dashed text-[11px] font-bold tracking-tight leading-none ${printClass} print:shadow-none print:border-none print:w-full print:p-0`}>
         <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-4">
            <h2 className="font-black text-[18px] uppercase italic tracking-tighter leading-none">{company.name}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{company.address}</p>
            <p className="text-[9px] font-black mt-1">CONTACT: {company.phone}</p>
         </div>
         <div className="mb-4 space-y-1">
            <div className="flex justify-between uppercase"><span>REF:</span><span className="font-black">#{inv.invoiceNo}</span></div>
            <div className="flex justify-between uppercase"><span>DATE:</span><span>{format(new Date(invDate), "dd/MM/yy HH:mm")}</span></div>
            <div className="flex justify-between uppercase"><span>CLIENT:</span><span className="font-black">{partner?.name || "CASH SALE"}</span></div>
         </div>
         <div className="border-b-2 border-dashed border-slate-200 mb-4 pb-2">
            <table className="w-full">
                <tbody className="divide-y-2 divide-dashed divide-slate-100">
                {groupedItems.map((item: any, idx: number) => (
                    <tr key={idx}>
                        <td className="py-3 uppercase">
                            <div className="font-black">{item.description} (x{item.quantity})</div>
                            <div className="text-[9px] text-slate-400 mt-1">Warranty: {item.warrantyMonths} Mo</div>
                            <div className="text-[12px] text-slate-800 font-black mt-1">
                                {item.imeis.join(", ")}
                            </div>
                        </td>
                        <td className="py-3 text-right font-black italic text-[14px]">৳{item.unitPrice.toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
         </div>
         <div className="space-y-2 text-right mb-6">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Summary</div>
            <div className="flex justify-between uppercase text-[12px] font-black"><span>NET PAYABLE:</span><span className="italic tracking-tighter font-black text-[18px]">৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString()}</span></div>
            <div className="flex justify-between uppercase opacity-60"><span>CASH PAID:</span><span>৳{(inv.paidAmount || 0).toLocaleString()}</span></div>
         </div>
         <div className="text-center pt-4 border-t-2 border-dashed border-slate-200">
            <p className="font-black mb-1 italic text-[10px] uppercase tracking-widest">Thank you for choosing us!</p>
            <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.4em] mt-2">DOMINATE ERP ENGINE</p>
         </div>
      </div>
    )
  };

  const handleSavePDF = async () => {
    if (!printRef.current) return;
    const toastId = toast.loading("Synthesizing PDF Document...");
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: paperSize === "80mm" ? "portrait" : "portrait",
        unit: "mm",
        format: paperSize === "80mm" ? [80, canvas.height * 80 / canvas.width] : paperSize.toLowerCase(),
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${type}-${inv.invoiceNo}.pdf`);
      toast.success("PDF provisioning complete!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Cloud PDF generation failed", { id: toastId });
    }
  };

  const handleExportExcel = () => {
    const items = groupedItems.map((item: any, idx: number) => ({
      "#": idx + 1,
      "Device": item.description,
      "Quantity": item.quantity,
      "IMEIs": item.imeis.join(", "),
      "Unit Price (BDT)": item.unitPrice,
      "Total Price (BDT)": item.unitPrice * item.quantity,
      "Warranty (Months)": item.warrantyMonths
    }));

    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Records");
    XLSX.writeFile(wb, `${type}-report-${inv.invoiceNo}.xlsx`);
    toast.success("Data export successful!");
  };

  const handleExportWord = () => {
    const content = printRef.current?.innerHTML || "";
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Invoice</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; text-align: left; } .bg-slate-900 { background-color: #0f172a; color: white; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${type}-doc-${inv.invoiceNo}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast.success("Document export successful!");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 overflow-hidden print:h-auto print:bg-white print:overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide EVERYTHING by default */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the print area and its children */
          .print-area, .print-area * {
            visibility: visible !important;
          }
          /* Position the print area at the top left */
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Remove background colors/images from layout but keep for invoice if needed */
          body {
            background: white !important;
          }
          /* Hide common layout elements by selector just in case */
          header, nav, aside, footer, .no-print, [role="complementary"] {
            display: none !important;
          }
          @page {
            margin: 10mm;
            size: auto;
          }
        }
      `}} />

      {/* Optimized Header & Controls */}
      <div className="print:hidden no-print p-4 pb-2 space-y-3 bg-white border-b shadow-sm z-20">
        {/* Unified Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-xl h-10 w-10 bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200" 
              onClick={() => router.push(`/${type === 'purchase' ? 'purchases' : 'sales'}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center italic uppercase leading-none">Invoice Terminal</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Report Engine v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 mr-2">
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-primary" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.3))}>
                  <Minus className="h-4 w-4" />
               </Button>
               <span className="text-[10px] font-black w-12 text-center text-slate-600">{Math.round(zoom * 100)}%</span>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-primary" onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}>
                  <Plus className="h-4 w-4" />
               </Button>
               <Separator orientation="vertical" className="h-4 bg-slate-300 mx-1" />
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-primary" onClick={fitToHeight} title="Fit to Screen">
                  <Maximize2 className="h-4 w-4" />
               </Button>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="h-10 rounded-xl font-black px-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-50" 
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4 text-slate-400" /> <span className="hidden xs:inline">Print</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-10 rounded-xl bg-primary hover:bg-primary/90 font-black px-4 shadow-lg border-none transition-all">
                  <Download className="mr-2 h-4 w-4" /> <span className="hidden xs:inline">Export</span> <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-2xl border-slate-100">
                <DropdownMenuItem className="rounded-lg h-10 font-bold text-xs" onClick={handleSavePDF}>
                  <FileType className="mr-2 h-4 w-4 opacity-60 text-rose-500" /> Save as PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-10 font-bold text-xs" onClick={handleExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 opacity-60 text-emerald-500" /> Excel Sheet
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-10 font-bold text-xs" onClick={handleExportWord}>
                  <FileText className="mr-2 h-4 w-4 opacity-60 text-blue-500" /> Word Doc
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 bg-slate-200 mx-1" />

            <Button 
              variant="ghost" 
              size="sm"
              className={`h-10 w-10 rounded-xl transition-all ${isControlsVisible ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
              onClick={() => setIsControlsVisible(!isControlsVisible)}
            >
              {isControlsVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Configuration Console */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isControlsVisible ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-3">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center">
                <Layout className="mr-2 h-3 w-3" /> Visual Style
              </h3>
              <div className="flex gap-2">
                {(["professional", "modern", "compact"] as const).map(s => (
                  <Button 
                    key={s} 
                    variant={style === s ? "default" : "outline"} 
                    size="sm"
                    className={`flex-1 h-9 rounded-lg font-black uppercase text-[9px] tracking-widest border transition-all ${style === s ? 'bg-primary border-primary shadow-md shadow-primary/20' : 'bg-white border-slate-200 text-slate-500'}`} 
                    onClick={() => setStyle(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center">
                <Smartphone className="mr-2 h-3 w-3" /> Paper Format
              </h3>
              <div className="flex gap-2">
                {(["A4", "A5", "80mm"] as const).map(sz => (
                  <Button 
                    key={sz} 
                    variant={paperSize === sz ? "default" : "outline"} 
                    size="sm"
                    className={`flex-1 h-9 rounded-lg font-black text-[10px] border transition-all ${paperSize === sz ? 'bg-primary border-primary shadow-md shadow-primary/20' : 'bg-white border-slate-200 text-slate-500'}`} 
                    onClick={() => setPaperSize(sz)}
                  >
                    {sz}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Invoice Viewing Area - Constrained & Zoomable */}
      <div className="flex-1 overflow-auto bg-slate-200/30 p-4 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:block">
        <div 
            ref={printRef} 
            className="print-area shadow-2xl transition-all duration-300 origin-top print:shadow-none print:transform-none"
            style={{ transform: `scale(${zoom})` }}
        >
          {styles[style]}
        </div>
      </div>
    </div>
  );
}

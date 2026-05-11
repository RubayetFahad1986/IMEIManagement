"use client";

import { use, useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Share2, ArrowLeft, Smartphone, FileText, Layout, CreditCard, Receipt, FileSpreadsheet, FileJson, FileType } from "lucide-react";
import { toast } from "sonner";
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

  useEffect(() => {
    const savedStyle = sessionStorage.getItem("invoice-style");
    const savedSize = sessionStorage.getItem("invoice-paper-size");
    if (savedStyle) setStyle(savedStyle as any);
    if (savedSize) setPaperSize(savedSize as any);
    fetchInvoice();
  }, [type, id]);

  useEffect(() => {
    sessionStorage.setItem("invoice-style", style);
    sessionStorage.setItem("invoice-paper-size", paperSize);
  }, [style, paperSize]);

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

  if (loading) return <div className="p-10 text-center">Generating Report...</div>;
  if (!data || !inv) return <div className="p-10 text-center text-destructive">Invoice not found.</div>;

  const invDate = inv.salesDate || inv.purchaseDate || inv.createDate || inv.CreateDate || new Date();
  const printClass = paperSize === "A4" ? "print-a4" : paperSize === "A5" ? "print-a5" : "print-80mm";

  const getDeviceDesc = (item: any) => {
    const device = type === "purchase" ? item.mobileDevice : item.inventoryItem?.mobileDevice;
    return device ? `${device.brand} ${device.modelName}` : "Unknown Device";
  };

  const handlePrint = () => window.print();

  const handleSavePDF = async () => {
    if (!printRef.current) return;
    const toastId = toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
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
      pdf.save(`${type}-invoice-${inv.invoiceNo}.pdf`);
      toast.success("PDF saved successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const handleExportExcel = () => {
    const items = inv.details.map((item: any, idx: number) => ({
      "#": idx + 1,
      "Device": getDeviceDesc(item),
      "IMEI 1": item.imeI1 || item.inventoryItem?.imeI1,
      "IMEI 2": item.imeI2 || item.inventoryItem?.imeI2 || "",
      "Price": item.unitPrice || item.costPrice,
      "Warranty": item.warrantyMonths || 0
    }));

    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Details");
    
    // Add summary info
    XLSX.utils.sheet_add_aoa(ws, [
      [],
      ["Invoice No", inv.invoiceNo],
      ["Date", format(new Date(invDate), "dd MMM yyyy")],
      ["Partner", partner?.name || "Walk-in"],
      ["Total", inv.netTotal || inv.totalAmount],
      ["Paid", inv.paidAmount]
    ], { origin: -1 });

    XLSX.writeFile(wb, `${type}-invoice-${inv.invoiceNo}.xlsx`);
    toast.success("Excel exported successfully!");
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
    fileDownload.download = `${type}-invoice-${inv.invoiceNo}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast.success("Word document exported successfully!");
  };

  const styles = {
    professional: (
      <div className={`bg-white p-8 shadow-lg min-h-[800px] flex flex-col border border-slate-200 ${printClass} print:shadow-none print:border-none print:p-0`}>
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
           <div>
             {company.logoPath && <img src={company.logoPath} alt="Logo" className="h-16 mb-4 object-contain" />}
             <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
             <p className="text-sm text-slate-500 max-w-xs">{company.address}</p>
             <p className="text-sm text-slate-500">Phone: {company.phone}</p>
           </div>
           <div className="text-right">
             <h2 className="text-4xl font-extrabold text-slate-200 uppercase mb-4">{type} INVOICE</h2>
             <p className="text-sm font-bold text-slate-900">Invoice No: {inv.invoiceNo}</p>
             <p className="text-sm text-slate-500 italic">Date: {format(new Date(invDate), "dd MMM yyyy HH:mm")}</p>
           </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-10 mb-10">
           <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Bill To:</h3>
              <div className="font-bold text-lg">{partner?.name || "Walk-in Customer"}</div>
              <p className="text-sm text-slate-600">{partner?.address || "N/A"}</p>
              <p className="text-sm text-slate-600">Contact: {partner?.phone || "N/A"}</p>
           </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-sm font-medium">#</th>
                <th className="p-3 text-sm font-medium">Device Description</th>
                <th className="p-3 text-sm font-medium">IMEI / Serial</th>
                <th className="p-3 text-sm font-medium text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b">
              {inv.details.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-sm">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-sm">{getDeviceDesc(item)}</div>
                    <div className="text-[10px] text-slate-500">Warranty: {item.warrantyMonths || 0} Months</div>
                  </td>
                  <td className="p-3 text-sm font-mono">{item.imeI1 || item.inventoryItem?.imeI1} {(item.imeI2 || item.inventoryItem?.imeI2) && ` / ${item.imeI2 || item.inventoryItem?.imeI2}`}</td>
                  <td className="p-3 text-sm text-right">৳{(item.unitPrice || item.costPrice).toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-10">
           <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal:</span><span>৳{(inv.subTotal || inv.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span>Discount:</span><span>-৳{(inv.discount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-600"><span>Grand Total:</span><span>৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm border-t pt-2 text-green-600 font-bold"><span>Paid:</span><span>৳{(inv.paidAmount || 0).toLocaleString()}</span></div>
           </div>
        </div>

        {/* T&C */}
        <div className="mt-auto pt-10 border-t print:pt-4">
           <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Terms & Conditions:</h4>
           <p className="text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">{company.termsAndConditions || "No specific terms provided."}</p>
           <div className="mt-8 text-center text-[10px] text-slate-300">Generated by Dominate Mobile ERP Solution</div>
        </div>
      </div>
    ),
    modern: (
      <div className={`bg-white p-0 shadow-lg min-h-[800px] flex flex-col border border-slate-200 ${printClass} print:shadow-none print:border-none`}>
        <div className="h-32 bg-slate-900 overflow-hidden relative flex items-center px-10">
           {company.headerImagePath && <img src={company.headerImagePath} alt="Header" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
           <div className="relative z-10 flex w-full justify-between items-center text-white">
              <div className="flex items-center gap-4">
                 {company.logoPath && <img src={company.logoPath} alt="Logo" className="h-12 w-12 rounded-full border-2 border-white" />}
                 <div><h1 className="text-xl font-bold">{company.name}</h1><p className="text-[10px] opacity-70 uppercase tracking-widest">{type} Invoice</p></div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Invoice ID</div>
                <div className="font-bold text-lg">{inv.invoiceNo}</div>
              </div>
           </div>
        </div>
        <div className="p-10 flex-1 flex flex-col print:p-6">
           <div className="grid grid-cols-2 gap-10 mb-10 border-b pb-10">
              <div className="space-y-1">
                 <h3 className="text-xs font-bold text-blue-600 uppercase">Partner Information</h3>
                 <div className="font-bold text-slate-900">{partner?.name || "Walk-in"}</div>
                 <div className="text-sm text-slate-500">{partner?.phone}</div>
                 <div className="text-sm text-slate-500">{partner?.address}</div>
              </div>
              <div className="space-y-1 text-right">
                 <h3 className="text-xs font-bold text-blue-600 uppercase">Order Summary</h3>
                 <div className="text-sm text-slate-900">Issued: {format(new Date(invDate), "dd MMM yyyy")}</div>
                 <div className="text-sm text-slate-900">Total Items: {inv.details.length}</div>
                 <Badge className="mt-2">{inv.paidAmount >= (inv.netTotal || inv.totalAmount) ? "PAID" : "DUE"}</Badge>
              </div>
           </div>

           <div className="flex-1 overflow-hidden">
             <table className="w-full">
                <thead>
                   <tr className="text-xs uppercase text-slate-400 border-b">
                      <th className="py-3 text-left">Product</th>
                      <th className="py-3 text-left">IMEI / S/N</th>
                      <th className="py-3 text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {inv.details.map((item: any, idx: number) => (
                      <tr key={idx}>
                         <td className="py-4 font-bold text-slate-700">{getDeviceDesc(item)}</td>
                         <td className="py-4 text-sm font-mono text-slate-500">{item.imeI1 || item.inventoryItem?.imeI1}</td>
                         <td className="py-4 text-right font-bold text-slate-900">৳{(item.unitPrice || item.costPrice).toLocaleString("en-US")}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

           <div className="mt-10 bg-slate-50 p-6 rounded-xl flex justify-between items-center print:mt-4">
              <div>
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Company T&C</h4>
                 <div className="text-[9px] text-slate-400 max-w-sm overflow-hidden text-ellipsis line-clamp-3">{company.termsAndConditions}</div>
              </div>
              <div className="text-right">
                 <div className="text-sm text-slate-500">Net Payable</div>
                 <div className="text-3xl font-black text-slate-900">৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString("en-US")}</div>
              </div>
           </div>
        </div>
      </div>
    ),
    compact: (
      <div className={`bg-white w-[300px] mx-auto p-4 shadow-lg border border-dashed text-[10px] font-mono leading-tight ${printClass} print:shadow-none print:border-none print:w-full print:p-0`}>
         <div className="text-center border-b border-dashed pb-2 mb-2">
            <h2 className="font-bold text-sm uppercase">{company.name}</h2>
            <p>{company.address}</p>
            <p>Tel: {company.phone}</p>
         </div>
         <div className="mb-2">
            <div>NO: {inv.invoiceNo}</div>
            <div>DATE: {format(new Date(invDate), "dd/MM/yy HH:mm")}</div>
            <div>PARTNER: {partner?.name || "CASH"}</div>
         </div>
         <table className="w-full border-b border-dashed mb-2">
            <tbody className="divide-y divide-dashed">
               {inv.details.map((item: any, idx: number) => (
                  <tr key={idx}>
                     <td className="py-1">{getDeviceDesc(item)}<br/><span className="text-[8px] opacity-60">IMEI: {(item.imeI1 || item.inventoryItem?.imeI1 || "").slice(-6)}</span></td>
                     <td className="py-1 text-right">৳{(item.unitPrice || item.costPrice).toLocaleString("en-US")}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="space-y-1 text-right mb-4">
            <div>SUBTOTAL: ৳{(inv.subTotal || inv.totalAmount || 0).toLocaleString("en-US")}</div>
            <div className="font-bold">TOTAL: ৳{(inv.netTotal || inv.totalAmount || 0).toLocaleString("en-US")}</div>
            <div>CASH: ৳{(inv.paidAmount || 0).toLocaleString("en-US")}</div>
         </div>
         <div className="text-center pt-2 border-t border-dashed">
            <p className="font-bold mb-1 italic text-[8px]">Thank you for shopping!</p>
            <p className="text-[7px] text-slate-400 uppercase">Power by Dominate ERP</p>
         </div>
      </div>
    )
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 print:p-0 print:max-w-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 0; }
          .print-a4 { width: 210mm; height: 297mm; padding: 10mm; margin: auto; }
          .print-a5 { width: 148mm; height: 210mm; padding: 8mm; margin: auto; }
          .print-80mm { width: 80mm; padding: 2mm; margin: 0; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center"><FileText className="mr-2 h-6 w-6 text-blue-600" /> Invoice Report</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Document</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" /> Export As <Share2 className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSavePDF}>
                <FileType className="mr-2 h-4 w-4 text-red-500" /> Save as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>
                <FileText className="mr-2 h-4 w-4 text-blue-600" /> Export to Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center"><Layout className="mr-2 h-4 w-4 text-blue-600" /> Choose Style</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["professional", "modern", "compact"] as const).map(s => (
              <Button key={s} variant={style === s ? "default" : "outline"} size="sm" onClick={() => setStyle(s)} className="capitalize">{s}</Button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center"><Smartphone className="mr-2 h-4 w-4 text-blue-600" /> Paper Size</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["A4", "A5", "80mm"] as const).map(sz => (
              <Button key={sz} variant={paperSize === sz ? "default" : "outline"} size="sm" onClick={() => setPaperSize(sz)}>{sz}</Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-center bg-slate-50 p-10 rounded-2xl print:bg-white print:p-0 print-area">
        <div ref={printRef}>
          {styles[style]}
        </div>
      </div>
    </div>
  );
}

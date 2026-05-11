"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Share2, ArrowLeft, Smartphone, FileText, Layout, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface InvoiceProps {
  params: { type: string; id: string };
}

export default function InvoiceReportPage({ params }: InvoiceProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState<"professional" | "modern" | "compact">("professional");

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const [invData, compData] = await Promise.all([
        apiFetch(`/erp/${params.type}s/${params.id}`),
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

  if (loading) return <div className="p-10 text-center">Generating Report...</div>;
  if (!data) return <div className="p-10 text-center text-destructive">Invoice not found.</div>;

  const inv = params.type === "sale" ? data.sale : data.purchase;
  const partner = params.type === "sale" ? data.customer : data.supplier;

  const handlePrint = () => window.print();

  const styles = {
    professional: (
      <div className="bg-white p-8 shadow-lg min-h-[800px] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
           <div>
             {company.logoPath && <img src={company.logoPath} alt="Logo" className="h-16 mb-4 object-contain" />}
             <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
             <p className="text-sm text-slate-500 max-w-xs">{company.address}</p>
             <p className="text-sm text-slate-500">Phone: {company.phone}</p>
           </div>
           <div className="text-right">
             <h2 className="text-4xl font-extrabold text-slate-200 uppercase mb-4">{params.type} INVOICE</h2>
             <p className="text-sm font-bold text-slate-900">Invoice No: {inv.invoiceNo}</p>
             <p className="text-sm text-slate-500 italic">Date: {format(new Date(inv.createDate), "dd MMM yyyy HH:mm")}</p>
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
        <div className="flex-1">
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
                    <div className="font-bold text-sm">{item.mobileDevice?.brand} {item.mobileDevice?.modelName}</div>
                    <div className="text-[10px] text-slate-500">Warranty: {item.warrantyMonths || 0} Months</div>
                  </td>
                  <td className="p-3 text-sm font-mono">{item.imeI1} {item.imeI2 && ` / ${item.imeI2}`}</td>
                  <td className="p-3 text-sm text-right">৳{(item.unitPrice || item.costPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-10">
           <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal:</span><span>৳{inv.netTotal || inv.totalAmount}</span></div>
              <div className="flex justify-between text-sm"><span>Discount:</span><span>-৳{inv.discount || 0}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-600"><span>Grand Total:</span><span>৳{inv.netTotal || inv.totalAmount}</span></div>
              <div className="flex justify-between text-sm border-t pt-2 text-green-600 font-bold"><span>Paid:</span><span>৳{inv.paidAmount}</span></div>
           </div>
        </div>

        {/* T&C */}
        <div className="mt-auto pt-10 border-t">
           <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Terms & Conditions:</h4>
           <p className="text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">{company.termsAndConditions || "No specific terms provided."}</p>
           <div className="mt-8 text-center text-[10px] text-slate-300">Generated by Dominate Mobile ERP Solution</div>
        </div>
      </div>
    ),
    modern: (
      <div className="bg-white p-0 shadow-lg min-h-[800px] flex flex-col border border-slate-200">
        <div className="h-32 bg-slate-900 overflow-hidden relative flex items-center px-10">
           {company.headerImagePath && <img src={company.headerImagePath} alt="Header" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
           <div className="relative z-10 flex w-full justify-between items-center text-white">
              <div className="flex items-center gap-4">
                 {company.logoPath && <img src={company.logoPath} alt="Logo" className="h-12 w-12 rounded-full border-2 border-white" />}
                 <div><h1 className="text-xl font-bold">{company.name}</h1><p className="text-[10px] opacity-70 uppercase tracking-widest">{params.type} Invoice</p></div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Invoice ID</div>
                <div className="font-bold text-lg">{inv.invoiceNo}</div>
              </div>
           </div>
        </div>
        <div className="p-10 flex-1 flex flex-col">
           <div className="grid grid-cols-2 gap-10 mb-10 border-b pb-10">
              <div className="space-y-1">
                 <h3 className="text-xs font-bold text-blue-600 uppercase">Customer Information</h3>
                 <div className="font-bold text-slate-900">{partner?.name || "Walk-in"}</div>
                 <div className="text-sm text-slate-500">{partner?.phone}</div>
                 <div className="text-sm text-slate-500">{partner?.address}</div>
              </div>
              <div className="space-y-1 text-right">
                 <h3 className="text-xs font-bold text-blue-600 uppercase">Order Summary</h3>
                 <div className="text-sm text-slate-900">Issued: {format(new Date(inv.createDate), "dd MMM yyyy")}</div>
                 <div className="text-sm text-slate-900">Total Items: {inv.details.length}</div>
                 <Badge className="mt-2">{inv.paidAmount >= (inv.netTotal || inv.totalAmount) ? "PAID" : "DUE"}</Badge>
              </div>
           </div>

           <div className="flex-1">
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
                         <td className="py-4 font-bold text-slate-700">{item.mobileDevice?.brand} {item.mobileDevice?.modelName}</td>
                         <td className="py-4 text-sm font-mono text-slate-500">{item.imeI1}</td>
                         <td className="py-4 text-right font-bold text-slate-900">৳{(item.unitPrice || item.costPrice).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

           <div className="mt-10 bg-slate-50 p-6 rounded-xl flex justify-between items-center">
              <div>
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Company T&C</h4>
                 <div className="text-[9px] text-slate-400 max-w-sm overflow-hidden text-ellipsis line-clamp-3">{company.termsAndConditions}</div>
              </div>
              <div className="text-right">
                 <div className="text-sm text-slate-500">Net Payable</div>
                 <div className="text-3xl font-black text-slate-900">৳{(inv.netTotal || inv.totalAmount).toLocaleString()}</div>
              </div>
           </div>
        </div>
      </div>
    ),
    compact: (
      <div className="bg-white w-[300px] mx-auto p-4 shadow-lg border border-dashed text-[10px] font-mono leading-tight">
         <div className="text-center border-b border-dashed pb-2 mb-2">
            <h2 className="font-bold text-sm uppercase">{company.name}</h2>
            <p>{company.address}</p>
            <p>Tel: {company.phone}</p>
         </div>
         <div className="mb-2">
            <div>NO: {inv.invoiceNo}</div>
            <div>DATE: {format(new Date(inv.createDate), "dd/MM/yy HH:mm")}</div>
            <div>CUST: {partner?.name || "CASH"}</div>
         </div>
         <table className="w-full border-b border-dashed mb-2">
            <tbody className="divide-y divide-dashed">
               {inv.details.map((item: any, idx: number) => (
                  <tr key={idx}>
                     <td className="py-1">{item.mobileDevice?.modelName}<br/><span className="text-[8px] opacity-60">IMEI: {item.imeI1.slice(-6)}</span></td>
                     <td className="py-1 text-right">৳{(item.unitPrice || item.costPrice).toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="space-y-1 text-right mb-4">
            <div>SUBTOTAL: ৳{(inv.netTotal || inv.totalAmount).toLocaleString()}</div>
            <div className="font-bold">TOTAL: ৳{(inv.netTotal || inv.totalAmount).toLocaleString()}</div>
            <div>CASH: ৳{inv.paidAmount.toLocaleString()}</div>
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
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center"><FileText className="mr-2 h-6 w-6 text-blue-600" /> Invoice Report</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Document</Button>
          <Button><Download className="mr-2 h-4 w-4" /> Save PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 print:hidden">
        <Card onClick={() => setStyle("professional")} className={style === "professional" ? "border-blue-600 ring-2 ring-blue-50 ring-offset-2 cursor-pointer" : "cursor-pointer hover:bg-slate-50"}>
           <CardHeader className="p-4"><CardTitle className="text-xs flex items-center justify-center"><Layout className="mr-2 h-3 w-3" /> Professional</CardTitle></CardHeader>
        </Card>
        <Card onClick={() => setStyle("modern")} className={style === "modern" ? "border-blue-600 ring-2 ring-blue-50 ring-offset-2 cursor-pointer" : "cursor-pointer hover:bg-slate-50"}>
           <CardHeader className="p-4"><CardTitle className="text-xs flex items-center justify-center"><Smartphone className="mr-2 h-3 w-3" /> Modern</CardTitle></CardHeader>
        </Card>
        <Card onClick={() => setStyle("compact")} className={style === "compact" ? "border-blue-600 ring-2 ring-blue-50 ring-offset-2 cursor-pointer" : "cursor-pointer hover:bg-slate-50"}>
           <CardHeader className="p-4"><CardTitle className="text-xs flex items-center justify-center"><Receipt className="mr-2 h-3 w-3" /> POS / Compact</CardTitle></CardHeader>
        </Card>
      </div>

      <div className="flex justify-center bg-slate-50 p-10 rounded-2xl print:bg-white print:p-0">
        {styles[style]}
      </div>
    </div>
  );
}

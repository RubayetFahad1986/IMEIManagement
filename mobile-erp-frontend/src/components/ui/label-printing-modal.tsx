"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, X, LayoutGrid, Smartphone, Package, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LabelItem {
  name: string;
  brand: string;
  price: number;
  identifier: string; // IMEI or SKU
  type: "Mobile" | "General";
  quantity: number;
}

interface PrintLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LabelItem[];
  invoiceNo: string;
}

const LABEL_SIZES = [
  { id: "38x25", label: "38mm x 25mm (Standard)", width: "38mm", height: "25mm" },
  { id: "25x25", label: "25mm x 25mm (Square Small)", width: "25mm", height: "25mm" },
  { id: "50x30", label: "50mm x 30mm (Large)", width: "50mm", height: "30mm" },
];

export function LabelPrintingModal({ isOpen, onClose, items, invoiceNo }: PrintLabelsModalProps) {
  const [size, setSize] = useState("38x25");
  const [type, setType] = useState<"Barcode" | "QR">("Barcode");
  const [selectedItems, setSelectedItems] = useState<number[]>(items.map((_, i) => i));

  const toggleItem = (index: number) => {
    setSelectedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const selectedLabelSize = LABEL_SIZES.find(s => s.id === size);
    const labelsToPrint = items.filter((_, i) => selectedItems.includes(i));

    let html = `
      <html>
        <head>
          <title>Print Labels - ${invoiceNo}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
          <style>
            @page {
              size: ${selectedLabelSize?.width} ${selectedLabelSize?.height};
              margin: 0;
            }
            body {
              margin: 0;
              font-family: 'Arial', sans-serif;
              -webkit-print-color-adjust: exact;
            }
            .label {
              width: ${selectedLabelSize?.width};
              height: ${selectedLabelSize?.height};
              padding: 1.5mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              page-break-after: always;
              overflow: hidden;
            }
            .brand { font-size: 7pt; font-weight: bold; text-transform: uppercase; line-height: 1; }
            .name { font-size: 6pt; margin: 0.5mm 0; line-height: 1.1; font-weight: 500; height: 7pt; overflow: hidden; }
            .price { font-size: 8pt; font-weight: 900; margin-top: 0.5mm; }
            .identifier-text { font-size: 6pt; font-weight: bold; margin-top: 0.2mm; }
            .barcode-canvas { max-width: 90%; height: 8mm; }
            .qr-canvas { width: 12mm; height: 12mm; margin: 0.5mm 0; }
            
            @media print {
                .label { border: none; }
            }
          </style>
        </head>
        <body>
    `;

    labelsToPrint.forEach((item, idx) => {
      const qty = item.type === "General" ? item.quantity : 1;
      for (let i = 0; i < qty; i++) {
        html += `
          <div class="label">
            <div class="brand">${item.brand}</div>
            <div class="name">${item.name}</div>
            ${type === "Barcode" 
              ? `<svg id="barcode-${idx}-${i}" class="barcode-canvas"></svg>` 
              : `<canvas id="qr-${idx}-${i}" class="qr-canvas"></canvas>`
            }
            <div class="identifier-text">${item.identifier}</div>
            <div class="price">৳${item.price.toLocaleString()}</div>
          </div>
        `;
      }
    });

    html += `
        <script>
          window.onload = () => {
            ${labelsToPrint.flatMap((item, idx) => {
              const qty = item.type === "General" ? item.quantity : 1;
              const scriptLines = [];
              for (let i = 0; i < qty; i++) {
                if (type === "Barcode") {
                  scriptLines.push(`JsBarcode("#barcode-${idx}-${i}", "${item.identifier}", {
                    format: "CODE128",
                    width: 1.5,
                    height: 35,
                    displayValue: false,
                    margin: 0
                  });`);
                } else {
                  scriptLines.push(`QRCode.toCanvas(document.getElementById("qr-${idx}-${i}"), "${item.identifier}", {
                    width: 60,
                    margin: 0,
                    errorCorrectionLevel: 'M'
                  });`);
                }
              }
              return scriptLines;
            }).join("\n")}
            
            setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Printer className="h-6 w-6 text-primary" /> Label Printing <span className="text-primary italic">Studio</span>
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Generate barcodes and price tags for your new stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Label Template</Label>
              <Select value={size} onValueChange={(v) => setSize(v || "38x25")}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {LABEL_SIZES.map(s => (
                    <SelectItem key={s.id} value={s.id} className="rounded-lg font-bold">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Code Style</Label>
              <Select value={type} onValueChange={(v: any) => setType(v || "Barcode")}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="Barcode" className="rounded-lg font-bold">Linear Barcode</SelectItem>
                    <SelectItem value="QR" className="rounded-lg font-bold">QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
                <Badge variant="outline" className="h-10 w-full justify-center rounded-xl border-slate-100 bg-slate-50 text-slate-600 font-bold">
                    INV: {invoiceNo}
                </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Items to Print ({selectedItems.length})</Label>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleItem(idx)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                    selectedItems.includes(idx) 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-slate-50 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow-sm transition-transform group-hover:scale-110 ${
                    selectedItems.includes(idx) ? "bg-primary text-white" : "bg-white text-slate-400"
                  }`}>
                    {item.type === "Mobile" ? <Smartphone className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[11px] font-black uppercase tracking-tight ${selectedItems.includes(idx) ? "text-primary" : "text-slate-600"}`}>
                      {item.brand} {item.name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      {item.identifier} • ৳{item.price.toLocaleString()} • Qty: {item.quantity}
                    </p>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 transition-all ${selectedItems.includes(idx) ? "text-primary opacity-100" : "text-slate-200 opacity-0"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-6 -m-6 mt-2 rounded-b-[2rem] flex flex-row justify-between items-center">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-xs">Cancel</Button>
          <Button 
            onClick={handlePrint} 
            disabled={selectedItems.length === 0}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest shadow-lg shadow-primary/20 px-8"
          >
            <Printer className="mr-2 h-4 w-4" /> Start Print Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

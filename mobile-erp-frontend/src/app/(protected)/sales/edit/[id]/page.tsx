"use client";

import { use, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EditSaleProps {
  params: Promise<{ id: string }>;
}

export default function EditSalePage({ params }: EditSaleProps) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<any>(null);

  useEffect(() => {
    fetchSale();
  }, [id]);

  const fetchSale = async () => {
    try {
      const data = await apiFetch(`/erp/sales/${id}`);
      setSale(data);
    } catch (error: any) {
      toast.error("Failed to load sale: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Sale Details...</div>;
  if (!sale) return <div className="p-10 text-center">Sale not found.</div>;

  const { sale: inv, customer } = sale;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Sale</h1>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="text-lg px-4 py-1">{inv.invoiceNo}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Items Information</CardTitle></CardHeader>
          <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Model</TableHead>
                   <TableHead>IMEI 1</TableHead>
                   <TableHead className="text-right">Price</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {inv.details?.map((item: any) => (
                   <TableRow key={item.id}>
                     <TableCell className="font-medium">{item.inventoryItem?.mobileDevice?.brand} {item.inventoryItem?.mobileDevice?.modelName}</TableCell>
                     <TableCell className="font-mono text-xs">{item.inventoryItem?.imeI1}</TableCell>
                     <TableCell className="text-right">৳{(item.unitPrice ?? 0).toLocaleString()}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
             <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm italic">
               Note: Individual item editing is restricted to maintain inventory integrity. If you made a mistake, please delete this invoice and record a new one.
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer & Totals</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Customer</Label>
                <div className="font-bold text-lg">{customer?.name || "Walk-in"}</div>
                <div className="text-sm text-muted-foreground">{customer?.phone}</div>
              </div>
              <hr />
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Net Total:</span><span className="font-bold">৳{inv.netTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-green-600"><span>Paid Amount:</span><span className="font-bold">৳{inv.paidAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-lg border-t pt-2 text-red-600"><span>Change:</span><span className="font-black">৳{inv.changeAmount.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" disabled>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

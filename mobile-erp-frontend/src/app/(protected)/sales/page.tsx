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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, FileText, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface SalesInvoice {
  id: number;
  invoiceNo: string;
  salesDate: string;
  customerName?: string;
  netTotal: number;
  paidAmount: number;
  changeAmount: number;
}

export default function SalesListPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Assuming endpoint to get all sales
      const data = await apiFetch("/erp/sales"); 
      setInvoices(data);
    } catch (error: any) {
      toast.error("Failed to load sales: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(i => 
    i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
          <p className="text-muted-foreground">Review all sales transactions and invoices.</p>
        </div>
        <Link href="/pos">
          <Button><ShoppingCart className="mr-2 h-4 w-4" /> New Sale</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Invoice No..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-bold text-blue-600">{inv.invoiceNo}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center"><Calendar className="mr-1 h-3 w-3 text-muted-foreground" /> {format(new Date(inv.salesDate), "dd MMM yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm"><User className="mr-1 h-3 w-3 text-muted-foreground" /> {inv.customerName || "Walk-in"}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">${inv.netTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${inv.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={inv.paidAmount >= inv.netTotal ? "default" : "destructive"}>
                        {inv.paidAmount >= inv.netTotal ? "Paid" : "Due"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="View Invoice">
                        <FileText className="h-4 w-4" />
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
  );
}

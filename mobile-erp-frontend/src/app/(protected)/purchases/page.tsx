"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Truck, Search, FileText, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { ServerPagination } from "@/components/ui/server-pagination";

interface PurchaseInvoice {
  id: number;
  invoiceNo: string;
  purchaseDate: string;
  supplierName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export default function PurchasesListPage() {
  const [data, setData] = useState({
    items: [] as PurchaseInvoice[],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/purchases?page=${page}&pageSize=10&search=${search}`);
      setData(result);
    } catch (error: any) {
      toast.error("Failed to load purchases: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchInvoices(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchInvoices]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">Manage your incoming stock with server pagination.</p>
        </div>
        <Link href="/purchases/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Record Purchase</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Records</CardTitle>
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
                <TableHead>Purchase No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchases found.</TableCell></TableRow>
              ) : (
                data.items.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-bold text-orange-600">{inv.invoiceNo}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center"><Calendar className="mr-1 h-3 w-3 text-muted-foreground" /> {format(new Date(inv.purchaseDate), "dd MMM yyyy")}</div>
                    </TableCell>
                    <TableCell>{inv.supplierName || "Direct Purchase"}</TableCell>
                    <TableCell className="text-right font-medium">৳{inv.totalAmount.toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right text-green-600">৳{inv.paidAmount.toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right text-red-600 font-bold">৳{inv.dueAmount.toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <ServerPagination 
            pageNumber={data.pageNumber} 
            totalPages={data.totalPages} 
            totalCount={data.totalCount}
            onPageChange={(p) => fetchInvoices(p, searchTerm)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

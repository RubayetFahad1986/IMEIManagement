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
import { ShoppingCart, Search, FileText, Calendar, User, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import Link from "next/link";
import { ServerPagination } from "@/components/ui/server-pagination";

function SalesRow({ inv, onDelete }: { inv: any, onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && details.length === 0) {
      try {
        const data = await apiFetch(`/erp/sales/${inv.id}`);
        setDetails(data.sale.details || []);
      } catch (e) {
        toast.error("Failed to load details");
      }
    }
    setExpanded(!expanded);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete invoice ${inv.invoiceNo}? This will return all items to stock.`)) return;
    
    setIsDeleting(true);
    try {
        await apiFetch(`/erp/sales/${inv.id}`, { method: "DELETE" });
        toast.success("Sale deleted and items returned to stock.");
        onDelete();
    } catch (error: any) {
        toast.error("Deletion failed: " + error.message);
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-accent/50 cursor-pointer" onClick={toggleExpand}>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
        <TableCell>{format(new Date(inv.salesDate), "dd MMM yyyy")}</TableCell>
        <TableCell>{inv.customerName || "Walk-in"}</TableCell>
        <TableCell className="text-right font-medium">৳{(inv.netTotal || 0).toLocaleString()}</TableCell>
        <TableCell className="text-right">৳{(inv.paidAmount || 0).toLocaleString()}</TableCell>
        <TableCell className="text-right">
          <Badge variant={inv.paidAmount >= inv.netTotal ? "default" : "destructive"}>
            {inv.paidAmount >= inv.netTotal ? "Paid" : "Due"}
          </Badge>
        </TableCell>
        <TableCell className="text-right pr-6">
           <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
              <Link href={`/reports/invoice/sale/${inv.id}`}><Button variant="ghost" size="icon" title="View Invoice"><FileText className="h-4 w-4" /></Button></Link>
              <Link href={`/pos?edit=${inv.id}`}><Button variant="ghost" size="icon" title="Edit Sale"><Pencil className="h-4 w-4" /></Button></Link>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={isDeleting} title="Delete Sale">
                  <Trash2 className="h-4 w-4" />
              </Button>
           </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0 bg-muted/20">
            <div className="p-4">
              <p className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Invoice Items:</p>
              <Table>
                <TableBody>
                   {details.map((d, i) => (
                     <TableRow key={i}>
                       <TableCell>{d.inventoryItem?.mobileDevice?.brand} {d.inventoryItem?.mobileDevice?.modelName}</TableCell>
                       <TableCell className="text-muted-foreground font-mono text-xs">{d.inventoryItem?.imeI1}</TableCell>
                       <TableCell className="text-right">৳{d.unitPrice.toLocaleString()}</TableCell>
                     </TableRow>
                   ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function SalesListPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/sales?page=${page}&pageSize=10&search=${search}`); 
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to load sales: " + error.message);
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
          <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
          <p className="text-muted-foreground">Review all sales transactions with server pagination.</p>
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
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Invoice No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
              ) : (
                data.items.map((inv: any) => <SalesRow key={inv.id} inv={inv} onDelete={() => fetchInvoices(data.pageNumber, searchTerm)} />)
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Search, FileText, Calendar, Plus, ChevronDown, ChevronUp, Trash2, Edit, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { ServerPagination } from "@/components/ui/server-pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function PurchaseRow({ inv, onRefresh }: { inv: any, onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && details.length === 0) {
      try {
        const data = await apiFetch(`/erp/purchases/${inv.id}`);
        setDetails(data.purchase.details || []);
      } catch (e) {
        toast.error("Failed to load details");
      }
    }
    setExpanded(!expanded);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/erp/purchases/${inv.id}`, { method: "DELETE" });
      toast.success("Purchase deleted successfully");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete purchase");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={toggleExpand}>
        <TableCell>
           <Button variant="ghost" size="icon" className="h-6 w-6">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
        <TableCell>{format(new Date(inv.purchaseDate), "dd MMM yyyy")}</TableCell>
        <TableCell>{inv.supplierName || "Direct Purchase"}</TableCell>
        <TableCell className="text-right font-medium">৳{(inv.totalAmount || 0).toLocaleString()}</TableCell>
        <TableCell className="text-right text-green-600">৳{(inv.paidAmount || 0).toLocaleString()}</TableCell>
        <TableCell className="text-right text-destructive font-bold">৳{(inv.dueAmount || 0).toLocaleString()}</TableCell>
        <TableCell className="text-right pr-6 flex justify-end gap-1">
            <Link href={`/reports/invoice/purchase/${inv.id}`} onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><FileText className="h-4 w-4" /></Button>
            </Link>
            <Link href={`/purchases/edit/${inv.id}`} onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600"><Edit className="h-4 w-4" /></Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => e.stopPropagation()} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={e => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the purchase record <b>{inv.invoiceNo}</b>, remove items from inventory, and reverse supplier balances. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Purchase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0 bg-muted/20">
            <div className="p-4">
              <p className="font-semibold mb-2 text-xs uppercase text-muted-foreground">IMEI Inventory Items:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {details.map((d, i) => (
                     <div key={i} className="bg-card border rounded-lg p-3 shadow-sm space-y-1">
                        <p className="font-bold text-sm text-primary">{d.mobileDevice?.brand} {d.mobileDevice?.modelName}</p>
                        {d.imeiItems?.map((im: any, j: number) => (
                           <div key={j} className="flex justify-between items-center text-xs font-mono bg-background p-1.5 rounded">
                              <span>{im.imei1}</span>
                              <Badge variant={d.isSold ? "destructive" : "default"} className="text-[10px]">
                                {d.isSold ? "Sold" : "In Stock"}
                              </Badge>
                           </div>
                        ))}
                     </div>
                   ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function PurchasesListPage() {
  const [data, setData] = useState<any>({ items: [], totalCount: 0, pageNumber: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/purchases?page=${page}&pageSize=10&search=${search}`); 
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
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
          <p className="text-muted-foreground">Track all vendor stock arrivals.</p>
        </div>
        <Link href="/purchases/new">
          <Button className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Record Purchase
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Directory</CardTitle>
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
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No purchases found.</TableCell></TableRow>
              ) : (
                data.items.map((inv: any) => (
                  <PurchaseRow 
                    key={inv.id} 
                    inv={inv} 
                    onRefresh={() => fetchInvoices(data.pageNumber, searchTerm)} 
                  />
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

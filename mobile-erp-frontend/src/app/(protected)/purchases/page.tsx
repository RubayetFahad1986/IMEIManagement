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
import { Truck, Search, FileText, Calendar, Plus, MoreHorizontal, Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { ServerPagination } from "@/components/ui/server-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PurchasesListPage() {
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

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/erp/purchases/${id}`, { method: "DELETE" });
      toast.success("Purchase deleted and stock reversed.");
      fetchInvoices(data.pageNumber, searchTerm);
    } catch (error: any) {
      toast.error("Deletion failed: " + error.message);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchInvoices(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchInvoices]);

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">Manage your incoming stock and track vendor invoices.</p>
        </div>
        <Link href="/purchases/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" /> Record Purchase
          </Button>
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
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Purchase No</TableHead>
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
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchases found.</TableCell></TableRow>
              ) : (
                items.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-orange-600">{inv.invoiceNo}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center"><Calendar className="mr-1 h-3 w-3 text-muted-foreground" /> {format(new Date(inv.purchaseDate), "dd MMM yyyy")}</div>
                    </TableCell>
                    <TableCell>{inv.supplierName || "Direct Purchase"}</TableCell>
                    <TableCell className="text-right font-medium">৳{(inv.totalAmount || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right text-green-600">৳{(inv.paidAmount || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right text-red-600 font-bold">৳{(inv.dueAmount || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/reports/invoice/purchase/${inv.id}`}>
                              <Eye className="mr-2 h-4 w-4 text-blue-600" /> View Invoice
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/purchases/edit/${inv.id}`}>
                              <Edit className="mr-2 h-4 w-4 text-orange-600" /> Edit Record
                            </Link>
                          </DropdownMenuItem>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Purchase
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center text-red-600">
                                  <AlertCircle className="mr-2 h-5 w-5" /> Danger Zone
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Deleting this purchase will reverse all inventory items from stock and revert the accounting entries. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(inv.id)} className="bg-red-600 hover:bg-red-700">
                                  Confirm Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { ServerPagination } from "@/components/ui/server-pagination";
import { Input } from "@/components/ui/input";

interface JournalVoucher {
  id: number;
  voucherNo: string;
  voucherDate: string;
  referenceType: string;
  referenceNo: string;
  entries: {
    accountHead: { name: string };
    debit: number;
    credit: number;
  }[];
}

export default function LedgersPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01")); // First day of current month
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to void this voucher?")) return;
    try {
      await apiFetch(`/accounting/vouchers/${id}`, { method: "DELETE" });
      toast.success("Voucher voided successfully.");
      fetchVouchers(data.pageNumber, searchTerm, startDate, endDate);
    } catch (error: any) {
      toast.error("Failed to delete voucher: " + error.message);
    }
  };


  const fetchVouchers = useCallback(async (page: number, search: string, start: string, end: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/accounting/vouchers?page=${page}&pageSize=10&search=${search}&startDate=${start}&endDate=${end}`);
      
      // Robustly handle both CamelCase and PascalCase
      const items = result.items || result.Items || [];
      const totalCount = result.totalCount ?? result.TotalCount ?? 0;
      const pageNumber = result.pageNumber ?? result.PageNumber ?? 1;
      const totalPages = result.totalPages ?? result.TotalPages ?? 1;

      setData({
        items,
        totalCount,
        pageNumber,
        totalPages
      });
    } catch (error: any) {
      console.error("Fetch vouchers failed:", error);
      toast.error("Failed to fetch vouchers: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchVouchers(1, searchTerm, startDate, endDate);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, startDate, endDate, fetchVouchers]);

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate(format(new Date(), "yyyy-MM-01"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all financial transactions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Journal Entries</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">From:</span>
                <Input 
                  type="date" 
                  className="w-40 h-9" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">To:</span>
                <Input 
                  type="date" 
                  className="w-40 h-9" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Voucher or Ref..."
                  className="pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loading ? (
              <p className="text-center py-10 font-medium animate-pulse">Loading secure transaction log...</p>
            ) : (data.items || []).length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No transactions found for the selected criteria.</p>
            ) : (
              (data.items || []).map((v: any) => (
                <div key={v.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm font-medium">
                      <span className="text-blue-600 font-bold">{v.voucherNo || v.VoucherNo}</span>
                      <span className="text-slate-400">|</span>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" /> 
                        {format(new Date(v.voucherDate || v.VoucherDate), "dd MMM yyyy")}
                      </span>
                      <span className="text-slate-400">|</span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {v.referenceType || v.ReferenceType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Ref: {v.referenceNo || v.ReferenceNo}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-rose-50" onClick={() => handleDelete(v.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Table>
                    <TableBody>
                      {(v.entries || v.Entries || []).map((entry: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-white border-none">
                          <TableCell className="w-1/2 py-2">
                            {(entry.accountHead || entry.AccountHead)?.name || (entry.accountHead || entry.AccountHead)?.Name}
                          </TableCell>
                          <TableCell className="text-right py-2 text-emerald-600 font-mono font-bold">
                            {(entry.debit || entry.Debit) > 0 ? `৳${(entry.debit || entry.Debit).toLocaleString("en-US")}` : ""}
                          </TableCell>
                          <TableCell className="text-right py-2 text-rose-600 font-mono font-bold">
                            {(entry.credit || entry.Credit) > 0 ? `৳${(entry.credit || entry.Credit).toLocaleString("en-US")}` : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <ServerPagination 
              pageNumber={data.pageNumber} 
              totalPages={data.totalPages} 
              totalCount={data.totalCount}
              onPageChange={(p) => fetchVouchers(p, searchTerm, startDate, endDate)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

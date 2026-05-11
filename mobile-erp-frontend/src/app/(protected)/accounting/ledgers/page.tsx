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
import { Search, Calendar } from "lucide-react";
import { toast } from "sonner";
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

  const fetchVouchers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/accounting/vouchers?page=${page}&pageSize=10&search=${search}`);
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to fetch vouchers: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchVouchers(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchVouchers]);

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all financial transactions.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Journal Entries</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Voucher or Ref..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loading ? (
              <p className="text-center py-10">Loading vouchers...</p>
            ) : items.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No transactions found.</p>
            ) : (
              items.map((v: any) => (
                <div key={v.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm font-medium">
                      <span className="text-blue-600 font-bold">{v.voucherNo}</span>
                      <span className="text-slate-400">|</span>
                      <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" /> {format(new Date(v.voucherDate), "dd MMM yyyy")}</span>
                      <span className="text-slate-400">|</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{v.referenceType}</Badge>
                      <span className="text-[10px] text-muted-foreground">Ref: {v.referenceNo}</span>
                    </div>
                  </div>
                  <Table>
                    <TableBody>
                      {v.entries.map((entry: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-white border-none">
                          <TableCell className="w-1/2 py-2">{entry.accountHead?.name}</TableCell>
                          <TableCell className="text-right py-2">{entry.debit > 0 ? `৳${entry.debit.toLocaleString("en-US")}` : ""}</TableCell>
                          <TableCell className="text-right py-2">{entry.credit > 0 ? `৳${entry.credit.toLocaleString("en-US")}` : ""}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>

          <ServerPagination 
            pageNumber={data.pageNumber} 
            totalPages={data.totalPages} 
            totalCount={data.totalCount}
            onPageChange={(p) => fetchVouchers(p, searchTerm)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

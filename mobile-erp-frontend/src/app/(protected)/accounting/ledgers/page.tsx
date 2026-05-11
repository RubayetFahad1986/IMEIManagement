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
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      // Assuming an endpoint to fetch journal vouchers
      const data = await apiFetch("/accounting/vouchers");
      setVouchers(data);
    } catch (error: any) {
      toast.error("Failed to fetch vouchers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vouchers.filter(v => 
    v.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search Voucher or Ref..."
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
            ) : filtered.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No transactions found.</p>
            ) : (
              filtered.map((v) => (
                <div key={v.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm font-medium">
                      <span className="text-blue-600 font-bold">{v.voucherNo}</span>
                      <span className="text-slate-400">|</span>
                      <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" /> {format(new Date(v.voucherDate), "dd MMM yyyy")}</span>
                      <span className="text-slate-400">|</span>
                      <Badge variant="outline">{v.referenceType}</Badge>
                      <span className="text-xs text-muted-foreground">Ref: {v.referenceNo}</span>
                    </div>
                  </div>
                  <Table>
                    <TableBody>
                      {v.entries.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="w-1/2">{entry.accountHead.name}</TableCell>
                          <TableCell className="text-right">{entry.debit > 0 ? `$${entry.debit.toLocaleString("en-US")}` : ""}</TableCell>
                          <TableCell className="text-right">{entry.credit > 0 ? `$${entry.credit.toLocaleString("en-US")}` : ""}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

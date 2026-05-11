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
import { Truck, Plus, Search, Phone, MapPin, Repeat } from "lucide-react";
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  supplierBalance: number;
  customerBalance: number;
  isCustomer: boolean;
}

export default function SuppliersPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuppliers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/setup/contacts?page=${page}&pageSize=10&search=${search}&isSupplier=true`);
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to fetch suppliers: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchSuppliers(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchSuppliers]);

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Unified contact management for purchasing and trade-ins.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{data.totalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or phone..."
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
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Supplier Debt</TableHead>
                <TableHead className="text-right">Customer Credit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No suppliers found.</TableCell></TableRow>
              ) : (
                items.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50">
                    <TableCell>
                       <div className="font-medium">{s.name}</div>
                       <div className="text-[10px] flex items-center text-muted-foreground mt-0.5">
                         <MapPin className="mr-1 h-2 w-2" /> {s.address}
                       </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={s.supplierBalance > 0 ? "destructive" : "secondary"}>
                         ৳{(s.supplierBalance || 0).toLocaleString("en-US")}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {s.isCustomer ? (
                         <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                           ৳{(s.customerBalance || 0).toLocaleString("en-US")}
                         </Badge>
                       ) : (
                         <span className="text-xs text-muted-foreground italic">N/A</span>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         {s.isCustomer && s.supplierBalance > 0 && s.customerBalance > 0 && (
                            <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100">
                              <Repeat className="mr-1 h-3 w-3" /> Net Balance
                            </Button>
                         )}
                         <Button variant="ghost" size="sm" className="h-7">Ledger</Button>
                       </div>
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
            onPageChange={(p) => fetchSuppliers(p, searchTerm)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

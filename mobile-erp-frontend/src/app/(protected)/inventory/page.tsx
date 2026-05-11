"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
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
import { Package, Plus, Search, History, ChevronDown, ChevronRight, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";

export default function InventoryPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchInventory = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/inventory?page=${page}&pageSize=10&search=${search}`);
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to fetch inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventory(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchInventory]);

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Monitor live stock levels and manage device IMEIs.</p>
        </div>
        <Link href="/purchases/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Purchase
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Models</p>
                <p className="text-2xl font-bold text-blue-900">{data.totalCount}</p>
              </div>
              <div className="bg-blue-200 p-2 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Live Stock</p>
                <p className="text-2xl font-bold text-green-900">
                  {items.reduce((acc: number, item: any) => acc + (item.stockQty || 0), 0)}
                </p>
              </div>
              <div className="bg-green-200 p-2 rounded-lg">
                <Package className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Stock Summary</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Brand or Model..."
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
              <TableRow className="bg-slate-50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Brand & Model</TableHead>
                <TableHead className="text-center">Live Qty</TableHead>
                <TableHead className="text-right">Avg. Cost</TableHead>
                <TableHead className="text-right">Current Sale Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading inventory...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No stock available.</TableCell></TableRow>
              ) : (
                items.map((group: any) => {
                  return (
                    <Fragment key={group.mobileDeviceId}>
                      <TableRow 
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleRow(group.mobileDeviceId)}
                      >
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {expandedRows.has(group.mobileDeviceId) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">{group.brand} {group.modelName}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-md font-bold px-3">
                            {group.stockQty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          ৳{Math.round(group.avgCostPrice).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-green-600 italic">৳{group.maxSalePrice.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={group.stockQty > 0 ? "default" : "destructive"}>
                            {group.stockQty > 5 ? "In Stock" : group.stockQty > 0 ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      
                      {expandedRows.has(group.mobileDeviceId) && (
                        <TableRow className="bg-slate-50/50">
                          <TableCell colSpan={6} className="p-0 border-b-2 border-blue-100">
                            <div className="p-6">
                              <h4 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">Device Level Details (IMEIs)</h4>
                              <Table className="bg-white rounded-lg shadow-sm border">
                                <TableHeader>
                                  <TableRow className="bg-slate-100/50">
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>IMEI 1</TableHead>
                                    <TableHead>IMEI 2</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                    <TableHead className="text-right">Sale Price</TableHead>
                                    <TableHead className="text-right">Added On</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.imeis.map((imei: any, idx: number) => (
                                    <TableRow key={imei.id} className="hover:bg-blue-50/30">
                                      <TableCell className="text-slate-400 text-xs">{idx + 1}</TableCell>
                                      <TableCell className="font-mono font-bold text-blue-600">{imei.imeI1}</TableCell>
                                      <TableCell className="font-mono text-slate-400 text-sm">{imei.imeI2 || "N/A"}</TableCell>
                                      <TableCell className="text-right text-xs">৳{imei.costPrice.toLocaleString()}</TableCell>
                                      <TableCell className="text-right font-bold">৳{imei.currentSalePrice.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-slate-400 text-xs">
                                        {new Date(imei.createDate).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Link href={`/inventory/history/${imei.id}`}>
                                          <Button variant="outline" size="sm" className="h-8 text-xs">
                                            <History className="mr-1 h-3 w-3" /> History
                                          </Button>
                                        </Link>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>

          <ServerPagination 
            pageNumber={data.pageNumber} 
            totalPages={data.totalPages} 
            totalCount={data.totalCount}
            onPageChange={(p) => fetchInventory(p, searchTerm)}
          />

        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Package, Plus, Search, History } from "lucide-react";
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";

interface InventoryItem {
  id: number;
  mobileDevice: {
    brand: string;
    modelName: string;
    variantName: string;
  };
  imei1: string;
  imei2: string;
  costPrice: number;
  currentSalePrice: number;
  isSold: boolean;
}

export default function InventoryPage() {
  const [data, setData] = useState({
    items: [] as InventoryItem[],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInventory = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/inventory?page=${page}&pageSize=10&search=${search}`);
      setData(result);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your mobile device stock with server-side search.</p>
        </div>
        <Link href="/purchases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Purchase
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Stock</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IMEI or Model..."
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
                <TableHead>Device</TableHead>
                <TableHead>IMEI 1</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading inventory...</TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No items found.</TableCell></TableRow>
              ) : (
                data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.mobileDevice.brand} {item.mobileDevice.modelName}</div>
                    </TableCell>
                    <TableCell className="font-mono">{item.imei1}</TableCell>
                    <TableCell>৳{item.costPrice.toLocaleString("en-US")}</TableCell>
                    <TableCell>৳{item.currentSalePrice.toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      <Badge variant={item.isSold ? "secondary" : "default"}>
                        {item.isSold ? "Sold" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/inventory/history/${item.id}`}>
                        <Button variant="ghost" size="icon" title="View Journey"><History className="h-4 w-4" /></Button>
                      </Link>
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
            onPageChange={(p) => fetchInventory(p, searchTerm)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Search, Phone, MapPin, Repeat } from "lucide-react";
import { toast } from "sonner";

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await apiFetch("/setup/suppliers");
      setSuppliers(data.items || data);
    } catch (error: any) {
      toast.error("Failed to fetch suppliers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

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
            <CardTitle className="text-sm font-medium text-blue-800">Total Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              ৳{suppliers.reduce((acc, s) => acc + s.supplierBalance, 0).toLocaleString("en-US")}
            </div>
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
            <TableHeader>
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
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No suppliers found.</TableCell></TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                       <div className="font-medium">{s.name}</div>
                       <div className="text-[10px] flex items-center text-muted-foreground mt-0.5">
                         <MapPin className="mr-1 h-2 w-2" /> {s.address}
                       </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={s.supplierBalance > 0 ? "destructive" : "secondary"}>
                         ৳{s.supplierBalance.toLocaleString("en-US")}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {s.isCustomer ? (
                         <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                           ৳{s.customerBalance.toLocaleString("en-US")}
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
        </CardContent>
      </Card>
    </div>
  );
}

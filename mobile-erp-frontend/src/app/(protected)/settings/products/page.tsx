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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";
import { Label } from "@/components/ui/label";

interface MobileDevice {
  id: number;
  brand: string;
  modelName: string;
  color: string;
  ram: string;
  storage: string;
  defaultCostPrice: number;
  defaultSalesPrice: number;
}

export default function ProductsPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<MobileDevice | null>(null);

  const [newDevice, setNewDevice] = useState({
    brand: "",
    modelName: "",
    color: "",
    ram: "",
    storage: "",
    defaultCostPrice: 0,
    defaultSalesPrice: 0,
  });

  const fetchData = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/setup/mobile-devices?page=${page}&pageSize=10&search=${search}`);
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to load products: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchData]);

  const handleCreate = async () => {
    if (!newDevice.brand || !newDevice.modelName) {
      toast.error("Brand and Model Name are required.");
      return;
    }
    try {
      await apiFetch("/setup/mobile-devices", {
        method: "POST",
        body: JSON.stringify({ ...newDevice, comId: 1 }),
      });
      toast.success("Mobile model added!");
      setIsAddOpen(false);
      setNewDevice({ brand: "", modelName: "", color: "", ram: "", storage: "", defaultCostPrice: 0, defaultSalesPrice: 0 });
      fetchData(1, "");
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const handleEdit = (device: MobileDevice) => {
    setEditingDevice(device);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingDevice) return;
    try {
      await apiFetch(`/setup/mobile-devices`, {
        method: "PUT",
        body: JSON.stringify(editingDevice),
      });
      toast.success("Mobile model updated!");
      setIsEditOpen(false);
      setEditingDevice(null);
      fetchData(data.pageNumber, searchTerm);
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this master model?")) return;
    try {
      await apiFetch(`/setup/mobile-devices/${id}`, {
        method: "DELETE",
      });
      toast.success("Mobile model deleted!");
      fetchData(data.pageNumber, searchTerm);
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    }
  };

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Product List</h1>
          <p className="text-muted-foreground">Manage global mobile models with server-side pagination.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Add Master Model</Button>} />
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Insert Mobile to Master List</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" placeholder="e.g. Samsung" value={newDevice.brand} onChange={e => setNewDevice({...newDevice, brand: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name</Label>
                <Input id="modelName" name="modelName" placeholder="e.g. Galaxy S24" value={newDevice.modelName} onChange={e => setNewDevice({...newDevice, modelName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" placeholder="e.g. Black" value={newDevice.color} onChange={e => setNewDevice({...newDevice, color: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <Label className="text-[10px]" htmlFor="ram">RAM</Label>
                    <Input id="ram" name="ram" placeholder="8GB" value={newDevice.ram} onChange={e => setNewDevice({...newDevice, ram: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <Label className="text-[10px]" htmlFor="storage">Storage</Label>
                    <Input id="storage" name="storage" placeholder="256GB" value={newDevice.storage} onChange={e => setNewDevice({...newDevice, storage: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-600 font-bold" htmlFor="cost">Default Cost (BDT)</Label>
                <Input id="cost" name="defaultCostPrice" type="number" value={newDevice.defaultCostPrice} onChange={e => setNewDevice({...newDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label className="text-green-600 font-bold" htmlFor="sale">Default Sale (BDT)</Label>
                <Input id="sale" name="defaultSalesPrice" type="number" value={newDevice.defaultSalesPrice} onChange={e => setNewDevice({...newDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save to Master</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Global Catalog</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search Brand or Model..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Brand & Model</TableHead>
                <TableHead>Variant / Specs</TableHead>
                <TableHead className="text-right">Def. Cost</TableHead>
                <TableHead className="text-right">Def. Sale</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No models found.</TableCell></TableRow>
              ) : (
                items.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-bold text-slate-900">{d.brand}</div>
                      <div className="text-xs text-muted-foreground">{d.modelName}</div>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-1">
                          <Badge variant="outline" className="text-[10px] py-0">{d.color}</Badge>
                          <Badge variant="secondary" className="text-[10px] py-0">{d.ram}/{d.storage}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-500">৳{(d.defaultCostPrice || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-600">৳{(d.defaultSalesPrice || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            onPageChange={(p) => fetchData(p, searchTerm)}
          />

        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Master Model</DialogTitle></DialogHeader>
          {editingDevice && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={editingDevice.brand} onChange={e => setEditingDevice({...editingDevice, brand: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Model Name</Label>
                <Input value={editingDevice.modelName} onChange={e => setEditingDevice({...editingDevice, modelName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input value={editingDevice.color} onChange={e => setEditingDevice({...editingDevice, color: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <Label className="text-[10px]">RAM</Label>
                    <Input value={editingDevice.ram} onChange={e => setEditingDevice({...editingDevice, ram: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <Label className="text-[10px]">Storage</Label>
                    <Input value={editingDevice.storage} onChange={e => setEditingDevice({...editingDevice, storage: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-600 font-bold">Default Cost (BDT)</Label>
                <Input type="number" value={editingDevice.defaultCostPrice} onChange={e => setEditingDevice({...editingDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label className="text-green-600 font-bold">Default Sale (BDT)</Label>
                <Input type="number" value={editingDevice.defaultSalesPrice} onChange={e => setEditingDevice({...editingDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Model</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Warehouse, 
  Info, 
  Globe, 
  Filter, 
  Check, 
  Smartphone, 
  PackageCheck, 
  Zap, 
  X, 
  FilterX,
  RefreshCcw,
  LayoutGrid,
  ListFilter,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { toast } from "@/lib/toast";
import { ServerPagination } from "@/components/ui/server-pagination";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuthStore } from "@/store/useAuthStore";

interface MobileDevice {
  id: number;
  brand: string;
  modelName: string;
  color: string;
  ram: string;
  storage: string;
  defaultCostPrice: number;
  defaultSalesPrice: number;
  totalStock?: number;
  branchStock?: { branchId: number; branchName: string; stock: number }[];
}

export default function ProductsPage() {
  const [data, setData] = useState<any>({ items: [], totalCount: 0, pageNumber: 1, totalPages: 1 });
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<MobileDevice | null>(null);

  // Global Catalog State
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [globalData, setGlobalData] = useState<any>({ items: [], totalCount: 0, pageNumber: 1, totalPages: 1 });
  const [globalPageSize, setGlobalPageSize] = useState(20);
  const [globalLoading, setGlobalLoading] = useState(false);
  
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalBrand, setGlobalBrand] = useState("");
  const [globalBrands, setGlobalBrands] = useState<string[]>([]);
  const [globalModel, setGlobalModel] = useState("");
  const [globalNetwork, setGlobalNetwork] = useState("");
  const [globalMemory, setGlobalMemory] = useState("");
  const [globalDisplay, setGlobalDisplay] = useState("");
  
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);

  const [newDevice, setNewDevice] = useState({ brand: "", modelName: "", color: "", ram: "", storage: "", defaultCostPrice: 0, defaultSalesPrice: 0 });

  const user = useAuthStore(state => state.user);

  const fetchData = useCallback(async (page: number, currentSearch: string, currentSize: number) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/setup/mobile-devices?page=${page}&pageSize=${currentSize}&search=${currentSearch}`);
      setData({ items: result.items || [], totalCount: result.totalCount || 0, pageNumber: result.pageNumber || 1, totalPages: result.totalPages || 1 });
    } catch (error: any) { toast.error(error.message); }
    finally { setLoading(false); }
  }, []);

  const fetchGlobalBrands = useCallback(async () => {
    try {
        const brands = await apiFetch("/setup/global-brands");
        setGlobalBrands(brands || []);
        if (brands && brands.length > 0) {
            // toast.success(`Loaded ${brands.length} brands`);
        } else {
            toast.error("No brands found in archive");
        }
    } catch (e: any) { 
        toast.error("Failed to load brands: " + e.message); 
    }
  }, []);

  const fetchGlobalCatalog = useCallback(async (page: number, search: string, brand: string, model: string, network: string, memory: string, display: string, size: number) => {
    setGlobalLoading(true);
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", size.toString());
        if (search) params.append("search", search);
        if (brand && brand !== "ALL") params.append("brand", brand);
        if (model) params.append("model", model);
        if (network) params.append("network", network);
        if (memory) params.append("memory", memory);
        if (display) params.append("display", display);

        const result = await apiFetch(`/setup/global-catalog?${params.toString()}`);
        setGlobalData(result);
    } catch (e) {
        toast.error("Failed to sync with global archive");
    } finally {
        setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(1, searchTerm, pageSize); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize, fetchData]);

  useEffect(() => {
    if (isGlobalOpen) {
        fetchGlobalBrands();
    }
  }, [isGlobalOpen, fetchGlobalBrands]);

  useEffect(() => {
    if (isGlobalOpen) {
        const delayDebounceFn = setTimeout(() => {
            fetchGlobalCatalog(1, globalSearch, globalBrand, globalModel, globalNetwork, globalMemory, globalDisplay, globalPageSize);
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }
  }, [isGlobalOpen, globalSearch, globalBrand, globalModel, globalNetwork, globalMemory, globalDisplay, globalPageSize, fetchGlobalCatalog]);

  const handleCreate = async () => {
    try {
      await apiFetch("/setup/mobile-devices", { method: "POST", body: JSON.stringify({ ...newDevice, comId: user?.comId || 1 }) });
      toast.success("Success!"); setIsAddOpen(false); setNewDevice({ brand: "", modelName: "", color: "", ram: "", storage: "", defaultCostPrice: 0, defaultSalesPrice: 0 }); fetchData(1, "", pageSize);
    } catch (error: any) { toast.error(error.message); }
  };

  const handleUpdate = async () => {
    if (!editingDevice) return;
    try {
      await apiFetch(`/setup/mobile-devices`, { method: "PUT", body: JSON.stringify(editingDevice) });
      toast.success("Updated!"); setIsEditOpen(false); setEditingDevice(null); fetchData(data.pageNumber, searchTerm, pageSize);
    } catch (error: any) { toast.error(error.message); }
  };

  const handleEdit = (device: MobileDevice) => {
    setEditingDevice(device);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this master model?")) return;
    try {
      await apiFetch(`/setup/mobile-devices/${id}`, { method: "DELETE" });
      toast.success("Deleted!");
      setData((prev: any) => ({
        ...prev,
        items: prev.items.filter((d: any) => d.id !== id),
        totalCount: prev.totalCount - 1
      }));
    } catch (error: any) { toast.error(error.message); }
  };

  const toggleGlobalSelection = (id: number) => {
    setSelectedGlobalIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleImport = async () => {
    if (selectedGlobalIds.length === 0) return;
    setImporting(true);
    try {
        await apiFetch("/setup/import-from-global", { method: "POST", body: JSON.stringify(selectedGlobalIds) });
        toast.success(`Imported ${selectedGlobalIds.length} records!`);
        setIsGlobalOpen(false);
        setSelectedGlobalIds([]);
        fetchData(1, "", pageSize);
    } catch (e: any) { toast.error(e.message); }
    finally { setImporting(false); }
  };

  const clearGlobalFilters = () => {
      setGlobalBrand("");
      setGlobalModel("");
      setGlobalNetwork("");
      setGlobalMemory("");
      setGlobalDisplay("");
      setGlobalSearch("");
  };

  const items = data.items || [];
  const brandOptions = [{ label: "All Brands", value: "" }, ...globalBrands.map(b => ({ label: b, value: b }))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Master</h1>
          <p className="text-muted-foreground">Manage your shop's inventory device models and specifications.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsGlobalOpen(true)}>
                <Globe className="mr-2 h-4 w-4" /> GSM Archive
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Model
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Records</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search local models..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Model</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Sales Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found.</TableCell></TableRow>
              ) : (
                items.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-accent/50 cursor-default group">
                    <TableCell className="pl-6">
                      <div className="font-medium text-primary">{d.brand}</div>
                      <div className="text-xs text-muted-foreground">{d.modelName}</div>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-1">
                            <Badge variant="outline" className="text-[10px] font-normal">{d.color || 'Mixed'}</Badge>
                            <Badge variant="secondary" className="text-[10px] font-normal">{d.ram}/{d.storage}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">৳{(d.defaultCostPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">৳{(d.defaultSalesPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 px-2 gap-2">
                                    <Badge variant={d.totalStock > 0 ? "default" : "destructive"} className="h-5 px-1.5 min-w-[2rem] justify-center text-[10px]">
                                        {d.totalStock || 0}
                                    </Badge>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="center">
                                <div className="bg-muted p-2 flex items-center justify-between border-b">
                                    <h4 className="text-xs font-semibold flex items-center gap-2">
                                        <Warehouse className="h-3 w-3" /> Distribution
                                    </h4>
                                    <Badge variant="outline" className="h-5 text-[10px]">{d.totalStock || 0} PCS</Badge>
                                </div>
                                <div className="p-2 space-y-1">
                                    {d.branchStock && d.branchStock.length > 0 ? d.branchStock.map((bs: any) => (
                                        <div key={bs.branchId} className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-muted/50 transition-colors">
                                            <span className="text-muted-foreground">{bs.branchName}</span>
                                            <span className="font-medium">{bs.stock}</span>
                                        </div>
                                    )) : <p className="text-center py-4 text-xs text-muted-foreground">Out of Stock</p>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t">
            <ServerPagination 
                pageNumber={data.pageNumber} 
                totalPages={data.totalPages} 
                pageSize={pageSize}
                totalCount={data.totalCount}
                onPageChange={(p) => fetchData(p, searchTerm, pageSize)} 
                onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Catalog Dialog */}
      <Dialog open={isGlobalOpen} onOpenChange={setIsGlobalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 overflow-visible">
            <DialogHeader className="p-6 border-b flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold">GSM Archive</DialogTitle>
                        <p className="text-sm text-muted-foreground">Sync models from the global cloud archive.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="px-4 py-1 text-sm font-medium">
                        {selectedGlobalIds.length} Selected
                    </Badge>
                    {selectedGlobalIds.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => setSelectedGlobalIds([])}>
                            Clear
                        </Button>
                    )}
                </div>
            </DialogHeader>

            <div className="flex-1 flex flex-col min-h-0 overflow-visible">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b bg-muted/20">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Brand</Label>
                        <SearchableSelect 
                            options={brandOptions} 
                            value={globalBrand} 
                            onChange={(v: string | number) => setGlobalBrand(v as string)} 
                            placeholder="All Manufacturers"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Keywords</Label>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search models, specs..." 
                                className="pl-9" 
                                value={globalSearch} 
                                onChange={e => setGlobalSearch(e.target.value)} 
                            />
                         </div>
                    </div>
                    <div className="flex items-end">
                        <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearGlobalFilters}>
                            <FilterX className="h-4 w-4 mr-2" /> Reset Filters
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-12 text-center"></TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model Identity</TableHead>
                                <TableHead>Network</TableHead>
                                <TableHead>Memory</TableHead>
                                <TableHead>Display</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {globalLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                                        <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Fetching global data...
                                    </TableCell>
                                </TableRow>
                            ) : globalData.items?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                                        No matches in global archive.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                globalData.items?.map((g: any) => (
                                    <TableRow 
                                        key={g.id} 
                                        className={`cursor-pointer transition-colors ${selectedGlobalIds.includes(g.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}`} 
                                        onClick={() => toggleGlobalSelection(g.id)}
                                    >
                                        <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                                            <Checkbox 
                                                checked={selectedGlobalIds.includes(g.id)} 
                                                onCheckedChange={() => toggleGlobalSelection(g.id)} 
                                            />
                                        </TableCell>
                                        <TableCell className="font-bold text-primary">{g.brand}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{g.model}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">{g.networkTechnology?.split(',')[0]}</div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{g.networkTechnology || 'N/A'}</TableCell>
                                        <TableCell className="text-xs">{g.memoryInternal || 'Standard'}</TableCell>
                                        <TableCell>
                                            <div className="text-xs font-medium">{g.displayType}</div>
                                            <div className="text-[10px] text-muted-foreground">{g.displaySize}</div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t flex items-center justify-between bg-muted/10">
                    <Button 
                        size="lg"
                        className="px-8 font-bold"
                        onClick={handleImport} 
                        disabled={selectedGlobalIds.length === 0 || importing}
                    >
                        {importing ? (
                            <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <PackageCheck className="mr-2 h-5 w-5" /> 
                                Import {selectedGlobalIds.length} Models
                            </>
                        )}
                    </Button>

                    <ServerPagination 
                        pageNumber={globalData.pageNumber} 
                        totalPages={globalData.totalPages} 
                        pageSize={globalPageSize}
                        totalCount={globalData.totalCount} 
                        onPageChange={p => fetchGlobalCatalog(p, globalSearch, globalBrand, globalModel, globalNetwork, globalMemory, globalDisplay, globalPageSize)} 
                        onPageSizeChange={setGlobalPageSize}
                    />
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Add New Model</DialogTitle>
                <p className="text-sm text-muted-foreground">Define a new device model for your shop inventory.</p>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5"><Label>Brand</Label><Input placeholder="e.g. Samsung" value={newDevice.brand} onChange={e => setNewDevice({...newDevice, brand: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Model</Label><Input placeholder="e.g. S24 Ultra" value={newDevice.modelName} onChange={e => setNewDevice({...newDevice, modelName: e.target.value})} /></div>
              <div className="space-y-1.5 col-span-2"><Label>Color</Label><Input placeholder="Mixed / Black / Blue" value={newDevice.color} onChange={e => setNewDevice({...newDevice, color: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>RAM</Label><Input placeholder="12GB" value={newDevice.ram} onChange={e => setNewDevice({...newDevice, ram: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Storage</Label><Input placeholder="512GB" value={newDevice.storage} onChange={e => setNewDevice({...newDevice, storage: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Cost Price (৳)</Label><Input type="number" value={newDevice.defaultCostPrice} onChange={e => setNewDevice({...newDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} /></div>
              <div className="space-y-1.5"><Label>Sales Price (৳)</Label><Input type="number" className="font-bold text-primary" value={newDevice.defaultSalesPrice} onChange={e => setNewDevice({...newDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} /></div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Save Model</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
                <DialogTitle>Edit Model</DialogTitle>
                <p className="text-sm text-muted-foreground">Update the specifications or pricing for this model.</p>
          </DialogHeader>
          {editingDevice && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5"><Label>Brand</Label><Input value={editingDevice.brand} onChange={e => setEditingDevice({...editingDevice, brand: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Model</Label><Input value={editingDevice.modelName} onChange={e => setEditingDevice({...editingDevice, modelName: e.target.value})} /></div>
              <div className="space-y-1.5 col-span-2"><Label>Color</Label><Input value={editingDevice.color} onChange={e => setEditingDevice({...editingDevice, color: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>RAM</Label><Input value={editingDevice.ram} onChange={e => setEditingDevice({...editingDevice, ram: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Storage</Label><Input value={editingDevice.storage} onChange={e => setEditingDevice({...editingDevice, storage: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Cost Price (৳)</Label><Input type="number" value={editingDevice.defaultCostPrice} onChange={e => setEditingDevice({...editingDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} /></div>
              <div className="space-y-1.5"><Label>Sales Price (৳)</Label><Input type="number" className="font-bold text-primary" value={editingDevice.defaultSalesPrice} onChange={e => setEditingDevice({...editingDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} /></div>
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

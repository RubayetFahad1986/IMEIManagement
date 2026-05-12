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
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
    } catch (e) {}
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
      await apiFetch("/setup/mobile-devices", { method: "POST", body: JSON.stringify({ ...newDevice, comId: 1 }) });
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
      toast.success("Deleted!"); fetchData(data.pageNumber, searchTerm, pageSize);
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
    <div className="p-6 space-y-6 bg-[#fcfcfc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
                <Smartphone className="h-7 w-7" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Product Master</h1>
                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Shop Inventory Definitions
                </div>
            </div>
        </div>
        
        <div className="flex gap-3">
            <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-black px-6 shadow-sm transition-all border-2" onClick={() => setIsGlobalOpen(true)}>
                <Globe className="mr-2 h-5 w-5 text-primary" /> GSM ARCHIVE
            </Button>
            <Button className="h-11 rounded-xl font-black bg-slate-900 hover:bg-black text-white px-8 shadow-2xl transition-all hover:scale-105 active:scale-95" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-6 w-6" /> ADD MODEL
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-slate-100">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-5 px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
                <ListFilter className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Records</CardTitle>
            </div>
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-2.5 h-5 w-5 text-slate-300" />
              <Input placeholder="Search local models..." className="h-10 pl-11 bg-white border-slate-200 rounded-xl font-bold text-xs focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Configuration</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Cost (৳)</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Retail (৳)</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Live Stock</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20">
                    <RefreshCcw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Syncing Master Database...</p>
                </TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-300">
                    <LayoutGrid className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">No records found</p>
                </TableCell></TableRow>
              ) : (
                items.map((d: any) => (
                  <TableRow key={d.id} className="odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/30 transition-all group border-b border-slate-50">
                    <TableCell className="pl-8 py-2">
                      <div className="font-black text-slate-900 text-sm tracking-tight leading-none italic">{d.brand}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{d.modelName}</div>
                    </TableCell>
                    <TableCell className="py-2">
                       <div className="flex gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-2 py-0 border-slate-200 font-black uppercase bg-white shadow-sm text-slate-500 rounded-full">{d.color || 'Mixed'}</Badge>
                            <Badge variant="secondary" className="text-[9px] px-2 py-0 bg-slate-100 font-black text-slate-900 rounded-full border border-slate-200/50">{d.ram}/{d.storage}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right py-2 font-black text-slate-500 font-mono text-[11px]">৳{(d.defaultCostPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right py-2 font-black text-primary font-mono text-[14px] italic">৳{(d.defaultSalesPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center py-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-8 px-3 gap-2 hover:bg-white hover:shadow-lg rounded-xl border border-transparent transition-all group/pop">
                                    <Badge variant={d.totalStock > 0 ? "default" : "destructive"} className={`px-2 font-black h-5 rounded-full text-[10px] ${d.totalStock > 0 ? 'bg-primary' : 'bg-rose-500'}`}>
                                        {d.totalStock || 0}
                                    </Badge>
                                    <Info className="h-4 w-4 text-slate-200 group-hover/pop:text-primary transition-colors" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 border border-slate-100 shadow-3xl rounded-[1rem] overflow-hidden bg-white" align="center">
                                <div className="bg-slate-900 p-3 flex items-center justify-between">
                                    <h4 className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Warehouse className="h-3 w-3 text-primary" /> Distribution
                                    </h4>
                                    <Badge className="bg-primary text-white border-none h-5 text-[9px] font-black px-3 rounded-full">{d.totalStock || 0} PCS</Badge>
                                </div>
                                <div className="p-3 space-y-2 bg-white">
                                    {d.branchStock && d.branchStock.length > 0 ? d.branchStock.map((bs: any) => (
                                        <div key={bs.branchId} className="flex justify-between items-center text-[10px] p-2 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                                            <span className="font-black text-slate-600 uppercase tracking-tighter">{bs.branchName}</span>
                                            <Badge variant="secondary" className="font-black h-5 bg-white text-slate-900 px-2 rounded-lg border border-slate-100 shadow-sm">{bs.stock}</Badge>
                                        </div>
                                    )) : <p className="text-center py-6 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Out of Stock</p>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                    <TableCell className="text-right pr-8 py-2">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" onClick={() => handleEdit(d)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-6 bg-slate-50/30 border-t border-slate-100">
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
        <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] flex flex-col p-0 border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] bg-white ring-1 ring-slate-200">
            {/* Modal Header */}
            <div className="bg-white p-6 shrink-0 border-b border-slate-100 z-30 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100 text-blue-600 shadow-xl shadow-blue-50 ring-1 ring-blue-100/50">
                        <Globe className="h-8 w-8" />
                    </div>
                    <div>
                        <DialogTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">GSM Archive</DialogTitle>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            Cloud Global Master Synchronizer
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end pr-6 border-r-2 border-slate-50">
                        <Badge className="bg-blue-600 text-white border-none px-6 py-2 text-md font-black mb-1.5 rounded-full shadow-2xl shadow-blue-200 uppercase tracking-tighter italic">
                            {selectedGlobalIds.length} Models Flagged
                        </Badge>
                        {selectedGlobalIds.length > 0 && (
                            <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-6 text-[10px] font-black uppercase p-0 px-4 rounded-xl transition-all" onClick={() => setSelectedGlobalIds([])}>
                                <FilterX className="h-3 w-3 mr-2" /> WIPE SELECTION
                            </Button>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-[1.25rem] h-12 w-12 bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all hover:rotate-90 border border-slate-200 shadow-inner" onClick={() => setIsGlobalOpen(false)}>
                        <X className="h-7 w-7" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-white">
                {/* Filters */}
                <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 border-b border-slate-100 shrink-0 gap-8">
                    <div className="flex flex-1 items-center gap-8">
                        <div className="w-[350px] shrink-0 group">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block ml-2 italic">Select Manufacturer</Label>
                            <SearchableSelect 
                                options={brandOptions} 
                                value={globalBrand} 
                                onChange={(v) => {
                                    setGlobalBrand(v as string);
                                }} 
                                placeholder="All Global Manufacturers"
                                className="h-12 border-2 border-slate-200 shadow-lg rounded-xl font-black text-sm bg-white px-4 focus:ring-8 focus:ring-blue-50 transition-all"
                            />
                        </div>
                        <div className="flex-1 group">
                             <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block ml-2 italic">Intelligent Keyword Search</Label>
                             <div className="relative">
                                <Search className="absolute left-5 top-3.5 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-all" />
                                <Input 
                                    placeholder="Type anything (e.g. OLED 5G 12GB)..." 
                                    className="h-12 pl-14 bg-white border-2 border-slate-200 rounded-[1.25rem] text-[15px] font-black shadow-lg group-focus-within:ring-8 group-focus-within:ring-blue-50 transition-all placeholder:text-slate-200" 
                                    value={globalSearch} 
                                    onChange={e => setGlobalSearch(e.target.value)} 
                                />
                             </div>
                        </div>
                    </div>
                    <div className="shrink-0 pt-6">
                        <Button variant="outline" size="lg" className="h-12 gap-3 font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-lg px-8 text-slate-400" onClick={clearGlobalFilters}>
                            <FilterX className="h-5 w-5" /> FLUSH FILTERS
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto relative bg-white custom-scrollbar">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white z-20 shadow-xl">
                            <TableRow className="bg-slate-900 border-none hover:bg-slate-900">
                                <TableHead className="w-16 text-center py-4">
                                    <Zap className="h-5 w-5 mx-auto text-primary animate-pulse" />
                                </TableHead>
                                <TableHead className="min-w-[150px] text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">OEM</TableHead>
                                <TableHead className="min-w-[250px] text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Model Identity</TableHead>
                                <TableHead className="min-w-[150px] text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Cloud Tech</TableHead>
                                <TableHead className="min-w-[150px] text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Hardware Stack</TableHead>
                                <TableHead className="min-w-[250px] text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Visual Interface</TableHead>
                            </TableRow>
                            {/* In-Column Filters */}
                            <TableRow className="bg-white border-b-4 border-slate-50 hover:bg-white shadow-inner">
                                <TableCell className="py-2 text-center">
                                    <ArrowUpDown className="h-3.5 w-3.5 mx-auto text-slate-200" />
                                </TableCell>
                                <TableCell className="py-2">
                                     <div className="px-3 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 text-center shadow-inner">
                                        <span className="text-[9px] font-black text-slate-500 truncate block tracking-tighter uppercase">
                                            {globalBrand || "ALL MANUFACTURERS"}
                                        </span>
                                     </div>
                                </TableCell>
                                <TableCell className="py-2 px-2">
                                    <Input 
                                        placeholder="Model name..." 
                                        className="h-9 pl-4 text-[11px] font-black bg-white border-2 border-slate-100 focus:border-blue-400 rounded-[0.75rem] shadow-sm uppercase tracking-tight" 
                                        value={globalModel} 
                                        onChange={e => setGlobalModel(e.target.value)} 
                                    />
                                </TableCell>
                                <TableCell className="py-2 px-2">
                                    <Input 
                                        placeholder="Network..." 
                                        className="h-9 pl-4 text-[11px] font-black bg-white border-2 border-slate-100 focus:border-blue-400 rounded-[0.75rem] shadow-sm uppercase tracking-tight" 
                                        value={globalNetwork} 
                                        onChange={e => setGlobalNetwork(e.target.value)} 
                                    />
                                </TableCell>
                                <TableCell className="py-2 px-2">
                                    <Input 
                                        placeholder="Specs..." 
                                        className="h-9 pl-4 text-[11px] font-black bg-white border-2 border-slate-100 focus:border-blue-400 rounded-[0.75rem] shadow-sm uppercase tracking-tight" 
                                        value={globalMemory} 
                                        onChange={e => setGlobalMemory(e.target.value)} 
                                    />
                                </TableCell>
                                <TableCell className="py-2 px-2">
                                    <Input 
                                        placeholder="Display..." 
                                        className="h-9 pl-4 text-[11px] font-black bg-white border-2 border-slate-100 focus:border-blue-400 rounded-[0.75rem] shadow-sm uppercase tracking-tight" 
                                        value={globalDisplay} 
                                        onChange={e => setGlobalDisplay(e.target.value)} 
                                    />
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {globalLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-40 text-center bg-slate-50/5">
                                        <div className="flex flex-col items-center gap-6">
                                            <RefreshCcw className="h-12 w-12 text-blue-500 animate-spin" />
                                            <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px] italic">Querying GSM Master Archive...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : globalData.items?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-48 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <FilterX className="h-24 w-24 mb-6 text-slate-900" />
                                            <p className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em] italic">Archive Match Zero</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                globalData.items?.map((g: any) => (
                                    <TableRow 
                                        key={g.id} 
                                        className={`cursor-pointer group transition-all duration-200 border-b border-slate-50 
                                            ${selectedGlobalIds.includes(g.id) 
                                                ? "bg-blue-50/50 border-l-[10px] border-l-blue-600 shadow-inner" 
                                                : "odd:bg-white even:bg-slate-50/50 hover:bg-slate-100/50 border-l-[10px] border-l-transparent"
                                            }`} 
                                        onClick={() => toggleGlobalSelection(g.id)}
                                    >
                                        <TableCell className="text-center py-2" onClick={e => e.stopPropagation()}>
                                            <Checkbox 
                                                checked={selectedGlobalIds.includes(g.id)} 
                                                onCheckedChange={() => toggleGlobalSelection(g.id)} 
                                                className="h-6 w-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all scale-100 shadow-sm" 
                                            />
                                        </TableCell>
                                        <TableCell className="py-2"><div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-[16px] italic tracking-tighter uppercase">{g.oem}</div></TableCell>
                                        <TableCell className="py-2">
                                            <div className="font-black text-slate-700 text-[14px] tracking-tight uppercase leading-none">{g.model}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest truncate max-w-[220px] italic">{g.networkTechnology || 'Base Cloud Profile'}</div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white shadow-sm uppercase px-3 py-0.5 rounded-full text-slate-400 tracking-widest italic">
                                                {g.networkTechnology?.split(',')[0] || "Universal"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant="secondary" className="text-[9px] font-black bg-slate-100 text-slate-900 rounded-lg px-3 py-0.5 border-2 border-white shadow-md truncate max-w-[150px] italic">
                                                {g.memoryInternal || "Standard"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="text-[11px] font-black text-slate-700 truncate max-w-[200px] flex items-center gap-2 uppercase tracking-tighter">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(var(--primary),0.5)] shrink-0" /> {g.displayType}
                                            </div>
                                            <div className="text-[9px] font-black text-blue-600 uppercase mt-1.5 tracking-[0.2em] bg-blue-50 inline-block px-3 py-0.5 rounded-md border border-blue-100/30 italic">{g.displaySize}</div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 shrink-0 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-8">
                        <Button 
                            className="h-16 px-12 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50 border-none group relative overflow-hidden" 
                            onClick={handleImport} 
                            disabled={selectedGlobalIds.length === 0 || importing}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {importing ? (
                                <span className="flex items-center gap-4 relative z-10">
                                    <RefreshCcw className="h-7 w-7 animate-spin" />
                                    PROVISIONING CLOUD DATA...
                                </span>
                            ) : (
                                <span className="flex items-center gap-5 relative z-10 uppercase tracking-tighter italic">
                                    <PackageCheck className="h-9 w-9 transition-transform group-hover:scale-125" /> 
                                    IMPORT {selectedGlobalIds.length} LOCAL RECORDS
                                </span>
                            )}
                        </Button>
                        <div className="hidden md:flex flex-col">
                             <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] leading-relaxed italic">Cloud Provisioning Engine</p>
                             <p className="text-[11px] font-bold text-slate-400 max-w-[280px] leading-tight">GSM metadata synchronization engine for local inventory profiles.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-[1.5rem] border-2 border-slate-100 shadow-xl ring-4 ring-white/50">
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
            </div>
        </DialogContent>
      </Dialog>

      {/* Custom Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-xl rounded-[2.5rem] border-none p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white ring-1 ring-slate-100">
            <div className="bg-slate-50 p-10 border-b border-slate-100">
                <DialogHeader>
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white rounded-[1.25rem] text-blue-600 shadow-2xl shadow-blue-50 ring-1 ring-blue-50"><Plus className="h-8 w-8" /></div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">Provision Model</DialogTitle>
                    </div>
                </DialogHeader>
            </div>
            <div className="p-10 grid grid-cols-2 gap-8 bg-white">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Brand</Label><Input placeholder="Samsung..." className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg text-slate-900 focus:ring-8 focus:ring-blue-50 transition-all uppercase italic" value={newDevice.brand} onChange={e => setNewDevice({...newDevice, brand: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Model</Label><Input placeholder="S24 Ultra..." className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg text-slate-900 focus:ring-8 focus:ring-blue-50 transition-all uppercase italic" value={newDevice.modelName} onChange={e => setNewDevice({...newDevice, modelName: e.target.value})} /></div>
              <div className="space-y-2 col-span-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Standard Hardware Color</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg text-slate-900 focus:ring-8 focus:ring-blue-50 transition-all" value={newDevice.color} onChange={e => setNewDevice({...newDevice, color: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">RAM Capacity</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg text-slate-900 focus:ring-8 focus:ring-blue-50 transition-all" placeholder="12GB" value={newDevice.ram} onChange={e => setNewDevice({...newDevice, ram: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Storage</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg text-slate-900 focus:ring-8 focus:ring-blue-50 transition-all" placeholder="512GB" value={newDevice.storage} onChange={e => setNewDevice({...newDevice, storage: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Cost Basis (৳)</Label><Input type="number" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-mono font-black text-xl text-slate-500 focus:ring-8 focus:ring-blue-50 transition-all" value={newDevice.defaultCostPrice} onChange={e => setNewDevice({...newDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] block ml-2 font-black italic">Retail Target (৳)</Label><Input type="number" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-mono font-black text-blue-600 text-2xl focus:ring-8 focus:ring-blue-50 transition-all italic" value={newDevice.defaultSalesPrice} onChange={e => setNewDevice({...newDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} /></div>
            </div>
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-5">
                <Button variant="ghost" className="font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 h-14 px-8 rounded-xl transition-all" onClick={() => setIsAddOpen(false)}>Discard</Button>
                <Button className="px-12 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-200 h-14 uppercase tracking-widest text-md" onClick={handleCreate}>Finalize Record</Button>
            </div>
          </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white ring-1 ring-slate-100">
          <div className="bg-blue-600 p-10 text-white shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/20 rounded-[1.25rem] border border-white/30 shadow-inner"><Edit className="h-8 w-8" /></div>
                        <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Edit Record</DialogTitle>
                    </div>
                </DialogHeader>
          </div>
          {editingDevice && (
            <div className="p-10 grid grid-cols-2 gap-8 bg-white">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Manufacturer</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg italic" value={editingDevice.brand} onChange={e => setEditingDevice({...editingDevice, brand: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Model Identity</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg italic" value={editingDevice.modelName} onChange={e => setEditingDevice({...editingDevice, modelName: e.target.value})} /></div>
              <div className="space-y-2 col-span-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">Hardware Color</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg" value={editingDevice.color} onChange={e => setEditingDevice({...editingDevice, color: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">RAM</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg" value={editingDevice.ram} onChange={e => setEditingDevice({...editingDevice, ram: e.target.value})} /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2">ROM</Label><Input className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-black text-lg" value={editingDevice.storage} onChange={e => setEditingDevice({...editingDevice, storage: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] block ml-2 italic">Unit Cost (৳)</Label><Input type="number" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-mono font-black text-xl text-slate-500" value={editingDevice.defaultCostPrice} onChange={e => setEditingDevice({...editingDevice, defaultCostPrice: parseFloat(e.target.value) || 0})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] block ml-2 font-black italic">Retail Target (৳)</Label><Input type="number" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-mono font-black text-blue-600 text-2xl italic" value={editingDevice.defaultSalesPrice} onChange={e => setEditingDevice({...editingDevice, defaultSalesPrice: parseFloat(e.target.value) || 0})} /></div>
            </div>
          )}
          <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-5">
                <Button variant="ghost" className="font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 h-14 px-8 rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button className="px-12 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-200 h-14 uppercase tracking-widest text-md" onClick={handleUpdate}>Commit Change</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

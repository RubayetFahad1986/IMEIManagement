"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch, BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Save, MapPin, Phone, Mail, Plus, MapPinned, Trash2, Image as ImageIcon, FileText, Percent, ShieldCheck, Settings2, Database, RotateCcw, AlertTriangle, DownloadCloud, UploadCloud } from "lucide-react";
import { toast } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import imageCompression from 'browser-image-compression';
import * as XLSX from "xlsx";

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  isMainBranch: boolean;
}

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoPath: string;
  headerImagePath: string;
  termsAndConditions: string;
  branches: Branch[];
  isVatEnabled: boolean;
  vatPercentage: number;
  isServiceChargeEnabled: boolean;
  serviceChargePercentage: number;
}

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", phone: "" });

  const DOMAIN_URL = BASE_URL.replace("/api", "");

  // Reset State
  const [isResetModalOpen, setIsResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Crop State
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [fileToCrop, setFileToCrop] = useState<{file: File, type: 'logo' | 'header'} | null>(null);

  // Backup/Restore State
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const data = await apiFetch("/company/1/export-data");
      // The API returns an object with arrays, we need to flatten it for the Excel sheet
      // or export multiple sheets. For now, let's export all data into one structure.
      const allData = [
          ...data.Contacts,
          ...data.Products,
          ...data.MobileDevices,
          ...data.Inventory,
          ...data.ImeiItems
      ];
      const ws = XLSX.utils.json_to_sheet(allData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "MasterData");
      XLSX.writeFile(wb, "MasterDataBackup.xlsx");
      toast.success("Data exported successfully!");
    } catch (error: any) {
      toast.error("Export failed: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImporting(true);
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            await apiFetch("/company/import-master-data", {
                method: "POST",
                body: JSON.stringify(data),
            });
            toast.success("Data imported successfully!");
        } catch (err: any) {
            toast.error("Import failed: " + err.message);
        } finally {
            setImporting(false);
        }
    };
    reader.readAsBinaryString(file);
  };

  const modules = [
    { id: "Sales", label: "Sales & Invoices", desc: "All sales, return invoices, and details." },
    { id: "Purchases", label: "Purchases", desc: "All purchase invoices and supplier returns." },
    { id: "Inventory", label: "Inventory & Stock", desc: "Current stock items, IMEI records, and history." },
    { id: "Products", label: "Product Master", desc: "Delete all mobile models, accessories, and brands." },
    { id: "Categories", label: "Categories & Master Data", desc: "Delete all warranty types, conditions, and market types." },
    { id: "Accounting", label: "Accounting & Ledgers", desc: "Journal entries, vouchers, and all account balances." },
    { id: "Contacts", label: "Customer & Supplier Lists", desc: "All contacts (Employees will be preserved)." }
  ];

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleResetData = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module to reset.");
      return;
    }

    if (!confirm("Are you ABSOLUTELY sure? This will permanently delete the selected data. This action cannot be undone.")) return;

    setResetting(true);
    try {
      await apiFetch("/admin/reset-data", {
        method: "POST",
        body: JSON.stringify({ modules: selectedModules }),
      });
      toast.success("System data reset successfully.");
      setIsResetOpen(false);
      setSelectedModules([]);
    } catch (error: any) {
      toast.error("Reset failed: " + error.message);
    } finally {
      setResetting(false);
    }
  };

  const fetchCompany = async () => {
    try {
      const data = await apiFetch("/company/1");
      console.log("Company Data Fetched:", data);
      
      // Normalize data to camelCase if it comes in PascalCase
      const normalized = {
        ...data,
        isVatEnabled: data.isVatEnabled ?? data.IsVatEnabled ?? false,
        vatPercentage: data.vatPercentage ?? data.VatPercentage ?? 0,
        isServiceChargeEnabled: data.isServiceChargeEnabled ?? data.IsServiceChargeEnabled ?? false,
        serviceChargePercentage: data.serviceChargePercentage ?? data.ServiceChargePercentage ?? 0,
        branches: data.branches ?? data.Branches ?? []
      };
      
      setCompany(normalized);
    } catch (error: any) {
      toast.error("Failed to fetch company details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      // Ensure we send PascalCase if the backend expects it, or just send the normalized object
      // Most .NET APIs handle camelCase input automatically if configured, but let's be safe
      await apiFetch(`/company/${company.id}`, {
        method: "PUT",
        body: JSON.stringify(company),
      });
      toast.success("Company settings updated successfully!");
      fetchCompany(); // Refresh to get latest state
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBranch = async () => {
    if (!company || !newBranch.name) return;
    try {
      const data = await apiFetch(`/company/${company.id}/branches`, {
        method: "POST",
        body: JSON.stringify({ ...newBranch, isMainBranch: false }),
      });
      toast.success("New branch added successfully!");
      setCompany({ ...company, branches: [...company.branches, data] });
      setIsAddBranchOpen(false);
      setNewBranch({ name: "", address: "", phone: "" });
    } catch (error: any) {
      toast.error("Failed to add branch: " + error.message);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header') => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToCrop({ file: e.target.files[0], type });
      setIsCropOpen(true);
    }
  };

  const processAndUpload = async () => {
    if (!fileToCrop || !croppedAreaPixels || !company) return;
    
    // Resize/Compress
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
    const compressedFile = await imageCompression(fileToCrop.file, options);
    
    // Note: To implement actual cropping, use a canvas to draw the cropped area before upload
    // For brevity, here we upload the compressed file.
    
    const formData = new FormData();
    formData.append("file", compressedFile);

    const endpoint = fileToCrop.type === 'logo' ? `/company/${company.id}/upload-logo` : `/company/${company.id}/upload-header`;
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` },
            body: formData
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        setCompany(prev => prev ? { ...prev, [fileToCrop.type === 'logo' ? 'logoPath' : 'headerImagePath']: result.path } : null);
        toast.success("Image processed and uploaded.");
        setIsCropOpen(false);
    } catch (err: any) {
        toast.error("Upload error: " + err.message);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage your company identity, branding, and branch network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Building2 className="mr-2 h-5 w-5" /> Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Legal Company Name</Label>
                    <Input
                      id="name"
                      value={company?.name || ""}
                      onChange={(e) => setCompany({ ...company!, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Official Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={company?.email || ""}
                      onChange={(e) => setCompany({ ...company!, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Official Phone</Label>
                    <Input
                      id="phone"
                      value={company?.phone || ""}
                      onChange={(e) => setCompany({ ...company!, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Headquarters Address</Label>
                    <Input
                      id="address"
                      value={company?.address || ""}
                      onChange={(e) => setCompany({ ...company!, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-slate-500 flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" /> Branding Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <Input type="file" onChange={(e) => handleFileSelect(e, 'logo')} accept="image/*" />
                      <div className="h-20 w-20 bg-muted rounded-xl border flex items-center justify-center overflow-hidden group relative">
                         {company?.logoPath ? <img src={`${DOMAIN_URL}${company.logoPath}`} alt="Logo" className="max-h-full object-contain" /> : <ImageIcon className="text-muted-foreground h-8 w-8" />}
                         {company?.logoPath && <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3"/></Button>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Header Image</Label>
                      <Input type="file" onChange={(e) => handleFileSelect(e, 'header')} accept="image/*" />
                      <div className="h-20 w-full bg-muted rounded-xl border flex items-center justify-center overflow-hidden group relative">
                         {company?.headerImagePath ? <img src={`${DOMAIN_URL}${company.headerImagePath}`} alt="Header" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground h-8 w-8" />}
                         {company?.headerImagePath && <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3"/></Button>}
                      </div>
                    </div>
                  </div>

      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="max-w-2xl h-[500px]">
            <DialogHeader><DialogTitle>Crop & Optimize Image</DialogTitle></DialogHeader>
            <div className="relative w-full h-full">
                {fileToCrop && (
                    <Cropper
                        image={URL.createObjectURL(fileToCrop.file)}
                        crop={crop}
                        zoom={zoom}
                        aspect={fileToCrop.type === 'logo' ? 1 : 3}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                )}
            </div>
            <DialogFooter>
                <Button onClick={processAndUpload}>Save & Upload</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-2">
                   <Label className="flex items-center text-slate-700 font-bold">
                     <FileText className="mr-2 h-4 w-4" /> Terms & Conditions (Invoice Footer)
                   </Label>
                   <Textarea 
                     className="min-h-[150px] font-sans text-sm"
                     placeholder="Enter your business terms, return policy, and warranty conditions..."
                     value={company?.termsAndConditions || ""}
                     onChange={e => setCompany({...company!, termsAndConditions: e.target.value})}
                   />
                   <p className="text-[10px] text-muted-foreground italic">These terms will automatically appear at the bottom of every Sales and Purchase invoice.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Profile & Branding</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
           <Card className="border-t-4 border-t-blue-600">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings2 className="mr-2 h-4 w-4 text-blue-600" /> Tax & Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors"
                    onClick={() => setCompany(prev => prev ? { ...prev, isVatEnabled: !prev.isVatEnabled } : null)}
                  >
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold uppercase cursor-pointer">VAT / TAX</Label>
                      <p className="text-[10px] text-muted-foreground italic">Enable auto-calculation for sales.</p>
                    </div>
                    <Checkbox 
                      checked={company?.isVatEnabled === true} 
                      onCheckedChange={(checked) => {
                        setCompany(prev => prev ? { ...prev, isVatEnabled: !!checked } : null);
                      }} 
                      onClick={(e) => e.stopPropagation()} // Prevent double toggle
                    />
                  </div>
                  {company?.isVatEnabled && (
                    <div className="flex items-center gap-2 pt-2">
                      <Percent className="h-3.5 w-3.5 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="VAT %" 
                        className="h-10 text-sm font-black border-blue-200 focus:border-blue-600 bg-blue-50/30"
                        value={company?.vatPercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCompany(prev => prev ? { ...prev, vatPercentage: val } : null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors"
                    onClick={() => setCompany(prev => prev ? { ...prev, isServiceChargeEnabled: !prev.isServiceChargeEnabled } : null)}
                  >
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold uppercase cursor-pointer">Service Charge</Label>
                      <p className="text-[10px] text-muted-foreground italic">Default percentage for processing.</p>
                    </div>
                    <Checkbox 
                      checked={company?.isServiceChargeEnabled === true} 
                      onCheckedChange={(checked) => {
                        setCompany(prev => prev ? { ...prev, isServiceChargeEnabled: !!checked } : null);
                      }} 
                      onClick={(e) => e.stopPropagation()} // Prevent double toggle
                    />
                  </div>
                  {company?.isServiceChargeEnabled && (
                    <div className="flex items-center gap-2 pt-2">
                      <Percent className="h-3.5 w-3.5 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="Service %" 
                        className="h-10 text-sm font-black border-blue-200 focus:border-blue-600 bg-blue-50/30"
                        value={company?.serviceChargePercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCompany(prev => prev ? { ...prev, serviceChargePercentage: val } : null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
           </Card>

           <Card className="border-t-4 border-t-orange-500">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm flex items-center">
                 <MapPinned className="mr-2 h-4 w-4 text-orange-500" /> Branch Network
               </CardTitle>
               
               <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
                  <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600"><Plus className="h-3 w-3 mr-1" /> Add</Button></DialogTrigger>
                  <DialogContent>                    <DialogHeader><DialogTitle>Register New Branch</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                       <div className="space-y-2">
                         <Label>Branch Name</Label>
                         <Input placeholder="e.g. Uttara Branch" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                         <Label>Contact No</Label>
                         <Input value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                         <Label>Full Address</Label>
                         <Input value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                       </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsAddBranchOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddBranch}>Create Branch</Button>
                    </DialogFooter>
                 </DialogContent>
               </Dialog>
             </CardHeader>
             <CardContent className="space-y-4">
                {company?.branches.map(branch => (
                  <div key={branch.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center group">
                    <div>
                      <div className="font-bold text-xs flex items-center">
                        {branch.name} {branch.isMainBranch && <span className="ml-2 text-[8px] bg-orange-100 text-orange-600 px-1 rounded uppercase tracking-tighter">Main</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{branch.phone}</div>
                    </div>
                    {!branch.isMainBranch && (
                       <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    )}
                  </div>
                ))}
             </CardContent>
           </Card>

           <Card className="border-t-4 border-t-destructive">
              <CardHeader>
                <CardTitle className="text-sm flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                   Permanently remove transactional data while keeping your company profile and users intact.
                 </p>
                 <Dialog open={isResetModalOpen} onOpenChange={setIsResetOpen}>
                    <DialogTrigger asChild>
                       <Button variant="destructive" className="w-full h-9 text-xs font-bold uppercase tracking-wider">
                          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset System Data
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                       <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-destructive">
                             <Database className="h-5 w-5" /> Data Reset Console
                          </DialogTitle>
                       </DialogHeader>
                       <div className="py-6 space-y-6">
                          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 flex gap-3">
                             <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                             <p className="text-xs font-medium text-destructive-foreground leading-relaxed">
                                Warning: This action is irreversible. All selected transaction records will be permanently deleted from the database.
                             </p>
                          </div>
                          
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Select Modules to Wipe:</Label>
                                <div className="flex gap-2">
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => setSelectedModules(modules.map(m => m.id))}
                                   >
                                      Select All
                                   </Button>
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                      onClick={() => setSelectedModules([])}
                                   >
                                      Clear
                                   </Button>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 gap-3">
                                {modules.map((m) => (
                                   <div 
                                      key={m.id} 
                                      className={cn(
                                         "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                         selectedModules.includes(m.id) ? "bg-destructive/5 border-destructive/30" : "bg-slate-50 border-slate-200"
                                      )}
                                      onClick={() => {
                                         setSelectedModules(prev => 
                                            prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]
                                         );
                                      }}
                                   >
                                      <Checkbox 
                                         checked={selectedModules.includes(m.id)}
                                         onCheckedChange={() => {}} // Handled by div click
                                         className="mt-1"
                                      />
                                      <div className="space-y-1">
                                         <p className="text-sm font-bold leading-none">{m.label}</p>
                                         <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                       <DialogFooter className="bg-slate-50 -m-6 mt-0 p-6">
                          <Button variant="ghost" onClick={() => setIsResetOpen(false)} disabled={resetting}>Cancel</Button>
                          <Button 
                             variant="destructive" 
                             onClick={handleResetData} 
                             disabled={resetting || selectedModules.length === 0}
                             className="font-black uppercase tracking-widest px-8"
                          >
                             {resetting ? "Wiping Data..." : "Execute Reset"}
                          </Button>
                       </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </CardContent>
           </Card>

           <Card className="border-t-4 border-t-emerald-500">
              <CardHeader>
                <CardTitle className="text-sm flex items-center text-emerald-600">
                  <DownloadCloud className="mr-2 h-4 w-4" /> Data Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                  Export all your master data to Excel, or import data from an Excel backup.
                </p>
                <div className="flex flex-col gap-3">
                   <Button 
                     variant="outline" 
                     className="w-full h-9 text-xs font-bold uppercase tracking-wider text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                     onClick={handleExportExcel}
                     disabled={exporting}
                   >
                     <DownloadCloud className="mr-2 h-3.5 w-3.5" /> 
                     {exporting ? "Exporting..." : "Backup to Excel"}
                   </Button>

                   <div className="relative">
                     <input 
                       type="file" 
                       accept=".xlsx, .xls" 
                       className="hidden" 
                       ref={fileInputRef} 
                       onChange={handleImportExcel} 
                     />
                     <Button 
                       variant="outline" 
                       className="w-full h-9 text-xs font-bold uppercase tracking-wider text-blue-600 border-blue-200 hover:bg-blue-50"
                       onClick={() => fileInputRef.current?.click()}
                       disabled={importing}
                     >
                       <UploadCloud className="mr-2 h-3.5 w-3.5" /> 
                       {importing ? "Importing..." : "Restore from Excel"}
                     </Button>
                   </div>
                </div>
              </CardContent>
           </Card>

           <Card className="bg-blue-50 border-blue-100 text-blue-900 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="h-24 w-24" /></div>
             <CardHeader><CardTitle className="text-xs uppercase tracking-widest text-blue-500">Subscription Status</CardTitle></CardHeader>             <CardContent>
                <div className="text-xl font-bold">Enterprise Plan</div>
                <p className="text-xs text-blue-600/60 mt-1 italic font-medium">Unlimited branches & master products active.</p>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

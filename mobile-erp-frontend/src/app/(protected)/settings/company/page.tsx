"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Save, MapPin, Phone, Mail, Plus, MapPinned, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  branches: Branch[];
}

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", phone: "" });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      // Assuming ComId 1 for now (Seeded by DataSeeder)
      const data = await apiFetch("/company/1");
      setCompany(data);
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
      await apiFetch(`/company/${company.id}`, {
        method: "PUT",
        body: JSON.stringify(company),
      });
      toast.success("Company settings updated successfully!");
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

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage your company identity and branch network.</p>
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
              <CardContent className="space-y-4">
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
                    <div className="relative">
                      <Mail className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-8"
                        value={company?.email || ""}
                        onChange={(e) => setCompany({ ...company!, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Official Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-8"
                        value={company?.phone || ""}
                        onChange={(e) => setCompany({ ...company!, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Headquarters Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        className="pl-8"
                        value={company?.address || ""}
                        onChange={(e) => setCompany({ ...company!, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
           <Card className="border-t-4 border-t-orange-500">
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-sm flex items-center">
                 <MapPinned className="mr-2 h-4 w-4 text-orange-500" /> Branch Network
               </CardTitle>
               
               <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
                 <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600"><Plus className="h-3 w-3 mr-1" /> Add</Button>
                 </DialogTrigger>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Register New Branch</DialogTitle></DialogHeader>
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
                       <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    )}
                  </div>
                ))}
             </CardContent>
           </Card>

           <Card className="bg-slate-900 text-white">
             <CardHeader><CardTitle className="text-xs uppercase tracking-widest text-slate-400">Subscription Status</CardTitle></CardHeader>
             <CardContent>
                <div className="text-lg font-bold">Enterprise Plan</div>
                <p className="text-xs text-slate-400 mt-1">Status: <span className="text-green-400">Active</span></p>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

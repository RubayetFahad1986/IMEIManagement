"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, MapPin, Phone, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoPath: string;
}

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      // Assuming ComId 1 for now, in real scenario it would come from auth store
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

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and preferences.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" /> Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={company?.name || ""}
                  onChange={(e) => setCompany({ ...company!, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="phone">Phone Number</Label>
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
                <Label htmlFor="address">Address</Label>
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
              {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Branches</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground py-4">Main Branch is currently active. Additional branches can be added for multi-location tracking.</p>
        </CardContent>
      </Card>
    </div>
  );
}

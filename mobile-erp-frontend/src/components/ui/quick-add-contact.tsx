"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import { UserPlus } from "lucide-react";

interface QuickAddContactProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: any) => void;
  defaultRole?: "Customer" | "Supplier";
  initialName?: string;
}

export function QuickAddContact({ isOpen, onClose, onSuccess, defaultRole = "Customer", initialName = "" }: QuickAddContactProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    phone: "",
    address: "",
    isCustomer: defaultRole === "Customer",
    isSupplier: defaultRole === "Supplier",
  });

  // Reset form when opening with new initialName
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialName,
        phone: "",
        address: "",
        isCustomer: defaultRole === "Customer",
        isSupplier: defaultRole === "Supplier",
      });
    }
  }, [isOpen, initialName, defaultRole]);

  const handleSave = async () => {
    if (loading) return; // Prevent double submission
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/setup/contacts", {
        method: "POST",
        body: JSON.stringify({ ...formData, comId: 1 }),
      });
      toast.success("Contact added!");
      onSuccess(data);
      onClose();
    } catch (error: any) {
      toast.error("Failed to add contact: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Quick Add Contact
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="flex gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox id="qCust" checked={formData.isCustomer} onCheckedChange={c => setFormData({...formData, isCustomer: !!c})} />
              <label htmlFor="qCust" className="text-sm font-medium">Customer</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="qSupp" checked={formData.isSupplier} onCheckedChange={c => setFormData({...formData, isSupplier: !!c})} />
              <label htmlFor="qSupp" className="text-sm font-medium">Supplier</label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Contact"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

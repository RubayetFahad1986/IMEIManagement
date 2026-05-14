"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Smartphone } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useRef } from "react";

const COMMON_RAM = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "24GB"].map(v => ({ label: v, value: v }));
const COMMON_STORAGE = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"].map(v => ({ label: v, value: v }));
const COMMON_COLORS = ["Black", "White", "Silver", "Graphite", "Gold", "Blue", "Green", "Titanium", "Deep Purple"].map(v => ({ label: v, value: v }));

interface QuickAddMobileDeviceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (device: any) => void;
  initialName?: string;
}

export function QuickAddMobileDevice({ isOpen, onClose, onSuccess, initialName = "" }: QuickAddMobileDeviceProps) {
  const [loading, setLoading] = useState(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    brand: "",
    modelName: "",
    color: "",
    ram: "",
    storage: "",
    defaultCostPrice: 0,
    defaultSalesPrice: 0,
  });

  // Try to extract brand, model, and specs from initialName
  useEffect(() => {
    if (isOpen) {
      const parts = initialName.split(" ");
      const brand = parts[0] || "";
      
      // Basic extraction of RAM/ROM if format is like "8/256" or "8GB/256GB"
      let ram = "";
      let storage = "";
      const specsMatch = initialName.match(/(\d+G?B?)\/(\d+G?B?)/i);
      if (specsMatch) {
        ram = specsMatch[1].toUpperCase();
        if (!ram.endsWith("GB")) ram += "GB";
        storage = specsMatch[2].toUpperCase();
        if (!storage.endsWith("GB") && !storage.endsWith("TB")) storage += "GB";
      }

      const modelName = parts.slice(1).join(" ")
        .replace(/(\d+G?B?)\/(\d+G?B?)/i, "") // Remove specs from model name
        .trim();
      
      setFormData({
        brand: brand,
        modelName: modelName || initialName,
        color: "",
        ram: ram,
        storage: storage,
        defaultCostPrice: 0,
        defaultSalesPrice: 0,
      });

      // Focus first input on open
      setTimeout(() => {
        const firstInput = containerRef.current?.querySelector("input");
        if (firstInput) (firstInput as HTMLInputElement).focus();
      }, 100);
    }
  }, [isOpen, initialName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      
      // If we're in a SearchableSelect input, don't interfere with its own Enter handling
      // until the dropdown is closed. However, our SearchableSelect closes on Enter.
      
      const formElements = containerRef.current?.querySelectorAll("input, button") || [];
      const elements = Array.from(formElements).filter(el => {
        const htmlEl = el as HTMLElement;
        return !htmlEl.hasAttribute("disabled") && htmlEl.offsetParent !== null;
      });

      const currentIndex = elements.indexOf(target);
      
      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        e.preventDefault();
        const nextElement = elements[currentIndex + 1] as HTMLElement;
        nextElement.focus();
      } else if (currentIndex === elements.length - 1) {
        // Last element (Save button or similar)
        // Let it click
      }
    }
  };

  const handleSave = async () => {
    if (!formData.brand || !formData.modelName) {
      toast.error("Brand and Model Name are required.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/setup/mobile-devices", {
        method: "POST",
        body: JSON.stringify({ ...formData, comId: 1 }),
      });
      toast.success("Mobile device added!");
      onSuccess(data);
      onClose();
    } catch (error: any) {
      toast.error("Failed to add device: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> Quick Add Mobile Device
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4" ref={containerRef} onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Samsung" />
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input value={formData.modelName} onChange={e => setFormData({...formData, modelName: e.target.value})} placeholder="e.g. S24 Ultra" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Color</Label>
              <SearchableSelect 
                options={COMMON_COLORS} 
                value={formData.color} 
                onChange={v => setFormData({...formData, color: v.toString()})} 
                placeholder="Select..." 
                onCreate={v => setFormData({...formData, color: v})}
              />
            </div>
            <div className="space-y-2">
              <Label>RAM</Label>
              <SearchableSelect 
                options={COMMON_RAM} 
                value={formData.ram} 
                onChange={v => setFormData({...formData, ram: v.toString()})} 
                placeholder="Select..." 
                onCreate={v => setFormData({...formData, ram: v})}
              />
            </div>
            <div className="space-y-2">
              <Label>Storage</Label>
              <SearchableSelect 
                options={COMMON_STORAGE} 
                value={formData.storage} 
                onChange={v => setFormData({...formData, storage: v.toString()})} 
                placeholder="Select..." 
                onCreate={v => setFormData({...formData, storage: v})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Cost (৳)</Label>
              <Input type="number" value={formData.defaultCostPrice} onChange={e => setFormData({...formData, defaultCostPrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Default Sales (৳)</Label>
              <Input type="number" value={formData.defaultSalesPrice} onChange={e => setFormData({...formData, defaultSalesPrice: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} ref={saveButtonRef}>{loading ? "Saving..." : "Save Device"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

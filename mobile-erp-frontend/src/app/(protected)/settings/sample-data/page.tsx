"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { Database, Beaker, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const TABLES = [
  { id: "Categories", label: "Product Categories", icon: "📁" },
  { id: "Brands", label: "Brands", icon: "🏷️" },
  { id: "MobileDevices", label: "Mobile Devices (IMEI Support)", icon: "📱" },
  { id: "Products", label: "General Products", icon: "📦" },
  { id: "Contacts", label: "Contacts (Customers/Suppliers)", icon: "👥" },
  { id: "Accounts", label: "Chart of Accounts", icon: "💰" },
];

const BUSINESS_TYPES = [
  { id: "Mobile", label: "Mobile Business", description: "Smartphones, Accessories, IMEI support" },
  { id: "Computer", label: "Computer / IT Shop", description: "Laptops, Desktops, Components" },
  { id: "Grocery", label: "Grocery / Super Shop", description: "FMCG, Beverages, Dairy" },
  { id: "MotorParts", label: "Motor Parts Business", description: "Tyres, Engine Oils, Spare Parts" },
  { id: "Clothing", label: "Clothing / Fashion", description: "Mens, Womens, Kids apparel" },
];

export default function SampleDataSeederPage() {
  const [businessType, setBusinessType] = useState("Mobile");
  const [selectedTables, setSelectedTables] = useState<string[]>(["Categories", "Brands", "Contacts"]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTable = (id: string) => {
    setSelectedTables(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedTables.length === 0) {
      toast.error("Please select at least one table to seed.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/setup/seed-custom", {
        method: "POST",
        body: JSON.stringify({
          businessType,
          tables: selectedTables,
        }),
      });
      toast.success(res.message || "Sample data generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate sample data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Beaker className="h-8 w-8 text-primary" /> 
          Sample Data <span className="text-primary italic">Wizard</span>
        </h1>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
          Populate your business workspace with realistic demo data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-slate-950 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Step 1: Business Identity</CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    Select the type of business to customize your data
                  </CardDescription>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                    <Database className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Business Industry</Label>
                    <Select value={businessType} onValueChange={(val) => setBusinessType(val || "Mobile")}>
                        <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/30 font-bold focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Select Business Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl">
                            {BUSINESS_TYPES.map(type => (
                                <SelectItem key={type.id} value={type.id} className="rounded-xl font-bold py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm">{type.label}</span>
                                        <span className="text-[9px] text-muted-foreground font-medium">{type.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-4 space-y-4">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Step 2: Data Tables</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TABLES.map(table => (
                            <div 
                                key={table.id}
                                onClick={() => toggleTable(table.id)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                                    selectedTables.includes(table.id) 
                                    ? "border-primary bg-primary/5 shadow-inner" 
                                    : "border-muted bg-muted/20 hover:border-border"
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-110 ${
                                    selectedTables.includes(table.id) ? "bg-primary text-white" : "bg-card text-muted-foreground border"
                                }`}>
                                    {table.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-black uppercase tracking-tight ${selectedTables.includes(table.id) ? "text-primary" : "text-foreground"}`}>
                                        {table.label}
                                    </p>
                                </div>
                                <Checkbox 
                                    checked={selectedTables.includes(table.id)} 
                                    className="rounded-full h-5 w-5"
                                />
                            </div>
                        ))}
                   </div>
                </div>
            </CardContent>
            <CardFooter className="p-8 bg-muted/30 border-t border-border flex flex-col gap-4">
                <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Seeding Knowledge Base...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> Generate Sample Data
                        </span>
                    )}
                </Button>
                <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    This action will NOT delete existing data. It only adds new records.
                </p>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2rem] bg-amber-500/10 dark:bg-amber-500/5 overflow-hidden border border-amber-500/20">
                <CardHeader className="pb-2">
                    <div className="bg-amber-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase text-amber-900 dark:text-amber-500">Safety Warning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-[11px] font-bold text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                        Generating sample data helps you explore the ERP features instantly. However, avoid using this in your live production account as it might clutter your real business records.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                            <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-500">Non-Destructive</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                            <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-500">Industry-Specific</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-8 bg-slate-950 rounded-[2rem] text-white space-y-4 shadow-2xl border border-white/5">
                <h3 className="text-lg font-black italic uppercase tracking-tighter">Instant <span className="text-primary">Preview</span></h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    Selected business: <span className="text-white font-black">{BUSINESS_TYPES.find(b => b.id === businessType)?.label}</span>
                </p>
                <div className="space-y-2">
                    {selectedTables.map(t => (
                        <div key={t} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            {TABLES.find(table => table.id === t)?.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Server, HardDrive, Cpu, Settings2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { BASE_URL } from "@/lib/api";

export default function DatabaseSetupPage() {
  const router = useRouter();
  const [provider, setProvider] = useState("PostgreSQL");
  const [connectionString, setConnectionString] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionString.trim()) {
      toast.error("Connection string is required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || BASE_URL}/SetupDatabase/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, connectionString }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to configure database");

      toast.success(result.message || "Database configured successfully!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderTemplate = (prov: string) => {
    switch(prov) {
      case "PostgreSQL": return "Host=localhost;Database=MobileERP;Username=postgres;Password=YourPassword";
      case "SQLServer": return "Server=localhost;Database=MobileERP;User Id=sa;Password=YourPassword;TrustServerCertificate=True;";
      case "MySQL": return "Server=localhost;Database=MobileERP;User=root;Password=YourPassword;";
      case "SQLite": return "Data Source=MobileERP.db";
      case "Embedded": return "Data Source=MobileERP.db";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
            <Database className="h-8 w-8 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/50">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Database Setup</CardTitle>
            <CardDescription className="text-sm">
              Welcome! Please configure your backend database to continue. We support PostgreSQL, SQL Server, MySQL, and SQLite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfigure} className="space-y-6">
              <div className="space-y-2">
                <Label>Database Provider</Label>
                <Select value={provider} onValueChange={(val) => {
                  setProvider(val);
                  setConnectionString(getProviderTemplate(val));
                }}>
                  <SelectTrigger className="h-12 bg-slate-50/50">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PostgreSQL"><div className="flex items-center"><Server className="mr-2 h-4 w-4 text-blue-500" /> PostgreSQL (Recommended)</div></SelectItem>
                    <SelectItem value="SQLServer"><div className="flex items-center"><HardDrive className="mr-2 h-4 w-4 text-slate-500" /> Microsoft SQL Server</div></SelectItem>
                    <SelectItem value="MySQL"><div className="flex items-center"><Database className="mr-2 h-4 w-4 text-orange-500" /> MySQL</div></SelectItem>
                    <SelectItem value="SQLite"><div className="flex items-center"><Cpu className="mr-2 h-4 w-4 text-green-500" /> SQLite / Embedded (For testing)</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Connection String</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] uppercase font-bold text-blue-600 px-2"
                    onClick={() => setConnectionString(getProviderTemplate(provider))}
                  >
                    Load Template
                  </Button>
                </div>
                <Input 
                  value={connectionString} 
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder="Enter your connection string here..."
                  className="h-12 font-mono text-xs bg-slate-50/50"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 text-sm font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <Settings2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Configuring & Initializing..." : "Initialize Database"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
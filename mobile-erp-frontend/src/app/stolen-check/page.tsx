"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, CheckCircle2, AlertTriangle, Smartphone, Info } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";

export default function PublicStolenCheckPage() {
  const [imei, setImei] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imei.length < 14) {
      toast.error("Please enter a valid 15-digit IMEI.");
      return;
    }

    setLoading(true);
    try {
      // Use the new public endpoint
      const res = await apiFetch(`/public/stolen-check/${imei}`);
      setResult(res);
    } catch (error: any) {
      toast.error("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Public Navbar */}
      <nav className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
            <span className="font-black text-xl tracking-tighter uppercase italic text-slate-900">Mobile<span className="text-blue-600">ERP</span></span>
        </Link>
        <Link href="/login">
            <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Business Login</Button>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic">
              Global <span className="text-blue-600">IMEI</span> Check
            </h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">
              Verify devices against our international database of stolen & blacklisted phones.
            </p>
          </div>

          <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" /> Verify Device
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                Enter the 15-digit IMEI number found on the device box or by dialing *#06#.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleCheck} className="flex gap-4">
                <div className="relative flex-1">
                  <Smartphone className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                  <Input 
                    placeholder="Enter 15-digit IMEI..." 
                    className="h-14 pl-12 rounded-2xl border-2 border-slate-100 focus:border-blue-600 transition-all text-lg font-mono font-black tracking-widest"
                    value={imei}
                    onChange={(e) => setImei(e.target.value.replace(/\D/g, '').substring(0, 15))}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  {loading ? "SEARCHING..." : "VERIFY"}
                </Button>
              </form>

              {result && (
                <div className={`p-8 rounded-3xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  result.isStolen ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
                }`}>
                  <div className="flex items-start gap-6">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${
                      result.isStolen ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    }`}>
                      {result.isStolen ? <ShieldAlert className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                    </div>
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-black uppercase italic tracking-tight ${
                        result.isStolen ? "text-rose-900" : "text-emerald-900"
                      }`}>
                        {result.isStolen ? "DEVICE BLACKLISTED" : "DEVICE SECURE"}
                      </h3>
                      <p className={`font-bold text-sm ${
                        result.isStolen ? "text-rose-700/80" : "text-emerald-700/80"
                      }`}>
                        {result.message}
                      </p>
                      
                      {result.isStolen && (
                        <div className="mt-4 p-4 bg-white/50 rounded-xl space-y-2">
                          <p className="text-xs font-black uppercase text-rose-800 tracking-widest">Device Details:</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Model</p>
                                <p className="text-sm font-bold text-slate-900">{result.brandModel || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                                <Badge className="bg-rose-600 font-black text-[9px] uppercase">{result.status}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!result && !loading && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                    <Info className="h-6 w-6 text-blue-600 shrink-0" />
                    <div>
                        <p className="text-xs font-black uppercase text-blue-900 tracking-widest mb-1">How it works</p>
                        <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
                            Our database connects directly to thousands of mobile retailers and law enforcement agencies. 
                            When a device is reported stolen in any of our connected ERP systems, it immediately becomes blacklisted globally on this portal.
                        </p>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-8">
            <div className="text-center">
                <p className="text-2xl font-black text-slate-900">50,000+</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reports</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-black text-slate-900">24/7</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monitoring</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">DOMINATE ERP ECOSYSTEM</p>
            <p className="text-xs text-slate-400 font-medium">
                Are you a mobile business? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Join our network</Link> to secure your inventory and protect customers.
            </p>
        </div>
      </footer>
    </div>
  );
}

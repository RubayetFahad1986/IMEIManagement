"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "Monthly";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    adminFullName: "",
    password: "",
    planType: selectedPlan
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted:", formData);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5237/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Signup response status:", response.status);

      if (response.ok) {
        toast.success("Account created! Check your email for OTP.");
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        const error = await response.text();
        console.error("Signup failed:", error);
        toast.error(error || "Registration failed");
      }
    } catch (error) {
      console.error("Signup fetch error:", error);
      toast.error("An error occurred. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[3rem] relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Info */}
            <div className="bg-slate-900 p-12 text-white flex flex-col justify-between">
                <div>
                    <div className="bg-blue-600 p-3 rounded-2xl w-fit mb-8 shadow-lg shadow-blue-900/50">
                        <Smartphone className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic leading-tight mb-6">Join the <br /> Mobile Revolution.</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">Start your 14-day full feature access now.</p>
                    
                    <div className="space-y-6">
                        {[
                            "Automated IMEI tracking",
                            "Real-time Inventory Audit",
                            "Double-entry Accounting",
                            "Digital Invoicing"
                        ].map(item => (
                            <div key={item} className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Selected Subscription:</p>
                    <p className="text-lg font-black text-blue-500 uppercase italic">{formData.planType} Plan</p>
                </div>
            </div>

            {/* Right: Form */}
            <div className="p-12 bg-white">
                <CardHeader className="p-0 mb-10">
                    <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Create Account</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enterprise deployment setup</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Name</Label>
                        <Input required placeholder="Elite Mobile Ltd." className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Email</Label>
                            <Input required type="email" placeholder="admin@elite.com" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</Label>
                            <Input required placeholder="+880..." className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Full Name</Label>
                        <Input required placeholder="MD. Rashid Ali" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" value={formData.adminFullName} onChange={e => setFormData({...formData, adminFullName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5 pb-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Set Password</Label>
                        <Input required type="password" placeholder="••••••••" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-95">
                        {isLoading ? "Provisioning..." : "Launch ERP Network"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                        Already registered? <Link href="/login" className="text-blue-600 hover:underline">Login Securely</Link>
                    </p>
                </form>
            </div>
        </div>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

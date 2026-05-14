"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Smartphone, ShieldCheck, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/store/useAuthStore";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const initialOtp = searchParams.get("otp") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(initialOtp);
  const { login } = useAuthStore();

  useEffect(() => {
    if (initialOtp && email && !isLoading) {
        handleVerification(initialOtp);
    }
  }, [initialOtp, email]);

  const handleVerification = async (otpToVerify: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5237/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpToVerify }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
            login(
              {
                id: "1",
                username: email,
                fullName: data.fullName,
                role: data.role,
                comId: data.comId,
                branchId: null,
                isShowCosting: data.isShowCosting,
                canSeeOthersEntry: data.canSeeOthersEntry,
              },
              data.token
            );
            toast.success(data.message || "Verification successful! Welcome to the dashboard.");
            router.push("/dashboard");
        } else {
            toast.success("Verification successful! You can now login.");
            router.push("/login");
        }
      } else {
        toast.error(data || "Invalid OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
        toast.error("Please enter a valid 6-digit OTP.");
        return;
    }
    await handleVerification(otp);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <Card className="w-full max-w-md shadow-2xl border-none rounded-[3rem] relative z-10 overflow-hidden">
        <CardHeader className="space-y-2 flex flex-col items-center pt-12">
          <div className="bg-emerald-500 p-4 rounded-[1.5rem] mb-4 shadow-xl shadow-emerald-100">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-center uppercase tracking-tighter italic">Identity Lock</CardTitle>
          <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] text-center max-w-[250px]">
            We sent a verification code to <br /><span className="text-slate-900">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-12 pt-8 pb-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Enter 6-Digit OTP</Label>
              <Input
                required
                maxLength={6}
                placeholder="000000"
                className="h-16 rounded-2xl border-slate-100 bg-slate-50 font-black text-center text-3xl tracking-[0.5em] focus:border-emerald-500 focus:bg-white transition-all"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-[9px] font-bold text-blue-600 uppercase leading-tight italic">
                    If you don't see it, please check your spam folder or the backend console log for mock delivery.
                </p>
            </div>
          </CardContent>
          
          <CardFooter className="px-12 pb-12 flex flex-col gap-6">
            <Button disabled={isLoading} className="w-full h-16 bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl transition-all active:scale-95" type="submit">
              {isLoading ? "Authenticating..." : "Unlock My Account"}
            </Button>
            
            <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                Resend Code (Wait 59s)
            </button>
          </CardFooter>
        </form>
      </Card>
      
      <Link href="/login" className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">
        Return to Login
      </Link>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}

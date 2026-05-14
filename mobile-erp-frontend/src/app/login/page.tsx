"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smartphone, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { GoogleLogin } from "@react-oauth/google";

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired");
  
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5237/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialResponse.credential),
      });

      const data = await response.json();
      if (response.ok) {
        toast.info(data.message || "Google Login feature is being implemented. Please use standard login for now.");
      } else {
        toast.error("Google Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during Google Login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5237/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(
          {
            id: "1",
            username: username,
            fullName: data.fullName,
            role: data.role,
            comId: data.comId,
            branchId: null,
            isShowCosting: data.isShowCosting,
            canSeeOthersEntry: data.canSeeOthersEntry,
          },
          data.token
        );

        if (data.isNearExpiry) {
            toast.warning(`Subscription Alert: Your software will expire in 3 days. Please contact support.`, { duration: 10000 });
        }

        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        if (data.isExpired) {
            router.push("/login?expired=true");
        }
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred during login. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || isAuthenticated) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 relative overflow-hidden">
      {/* Animated Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

      <div className="mb-8 relative z-10">
          <Link href="/" className="flex items-center text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-widest transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Website
          </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] relative z-10 overflow-hidden">
        {expired && (
            <div className="bg-rose-500 p-4 flex items-center gap-3 text-white">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-black uppercase italic">Subscription Expired. Access Restricted.</p>
            </div>
        )}
        <CardHeader className="space-y-1 flex flex-col items-center pt-10">
          <div className="bg-slate-900 p-4 rounded-[1.5rem] mb-4 shadow-xl shadow-blue-100">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-center uppercase tracking-tighter italic">Welcome Back</CardTitle>
          <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">Enter credentials to access ERP</CardDescription>
        </CardHeader>
        
        <div className="px-10 py-4 flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                theme="filled_blue"
                shape="pill"
            />
        </div>

        <div className="relative flex items-center px-10 py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-10 pb-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Login ID / Email</Label>
              <Input
                id="username"
                placeholder="admin@example.com"
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:border-blue-600 focus:bg-white transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secret Key</Label>
                <Link href="#" className="text-[9px] font-black text-blue-600 uppercase hover:underline">Forgot?</Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:border-blue-600 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="px-10 pb-12 flex flex-col gap-4">
            <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95" type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login Securely"}
            </Button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New Company? <Link href="/signup" className="text-blue-600 hover:underline">Register Now</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] relative z-10">Dominate Software Solution © 2026</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

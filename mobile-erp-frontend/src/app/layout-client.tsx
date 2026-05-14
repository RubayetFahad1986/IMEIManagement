"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const publicPaths = ["/", "/login", "/signup", "/verify-otp"];
    
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace("/");
    } else if (isAuthenticated && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, pathname, router, mounted]);

  // Render children even if not mounted to avoid blank screen, 
  // but wrap in a div that suppresses hydration warning if necessary.
  return (
    <div suppressHydrationWarning>
      {children}
      <Toaster position="top-right" />
    </div>
  );
}

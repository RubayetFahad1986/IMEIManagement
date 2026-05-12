"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api";
import Sidebar from "./Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { User, Bell, Search, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const { setTheme } = useTheme();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value;
      if (!val) return;
      
      // Try searching for IMEI
      const invRes = await apiFetch(`/erp/inventory?search=${val}`);
      if (invRes.items?.length > 0) {
        const item = invRes.items[0].imeis[0];
        window.location.href = `/inventory/history/${item.id}`;
        return;
      }
      
      // Try searching for Invoice
      const salesRes = await apiFetch(`/erp/sales?search=${val}`);
      if (salesRes.items?.length > 0) {
        window.location.href = `/reports/invoice/sale/${salesRes.items[0].id}`;
        return;
      }
      
      toast.error("No record found for: " + val);
    }
  };

  return (
    <div className="flex bg-background h-screen w-screen overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search IMEI or Invoice..."
              className="pl-10 bg-background border-input h-10 w-full"
              onKeyDown={handleSearch}
            />
          </div>

          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><Palette className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['default', 'ocean', 'forest', 'sunset', 'midnight'].map(t => (
                  <DropdownMenuItem key={t} onClick={() => setTheme(t)} className="capitalize">{t}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 h-8 border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

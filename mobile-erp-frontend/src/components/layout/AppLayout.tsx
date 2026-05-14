"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api";
import Sidebar from "./Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { User, Bell, Search, Palette, AlertTriangle, X, Menu, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { HelpGuide } from "./HelpGuide";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const { setTheme } = useTheme();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(true);
  
  // Responsive State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Persist collapse state or handle auto-collapse on tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(false);
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value;
      if (!val) return;
      try {
        const invRes = await apiFetch(`/erp/inventory?search=${val}`);
        if (invRes.items?.length > 0) {
          window.location.href = `/inventory/history/${invRes.items[0].id}`;
          return;
        }
        const salesRes = await apiFetch(`/erp/sales?search=${val}`);
        if (salesRes.items?.length > 0) {
          window.location.href = `/reports/invoice/sale/${salesRes.items[0].id}`;
          return;
        }
        toast.error(t('no_record_found') + " " + val);
      } catch (err) {
        toast.error(t('search_failed'));
      }
    }
  };

  return (
    <div className="flex bg-slate-50 h-screen w-screen overflow-hidden text-foreground">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all z-30",
          scrolled ? "bg-card/80 backdrop-blur-md shadow-sm" : "bg-card"
        )}>
          <div className="flex items-center gap-4 flex-1">
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="relative w-full max-w-md hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t('search_placeholder')}
                className="pl-10 bg-slate-100 border-none h-10 w-full rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground">
                            <Palette className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl p-2 border-border/50">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-2 py-1.5">{t('switch_theme')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['default', 'ocean', 'forest', 'sunset', 'midnight'].map(theme => (
                            <DropdownMenuItem key={theme} onClick={() => setTheme(theme)} className="capitalize rounded-lg font-bold gap-2 focus:bg-primary focus:text-primary-foreground">
                                <div className={cn("h-2 w-2 rounded-full", `bg-${theme}-500`)} />
                                {theme}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <button className="relative p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-card shadow-sm"></span>
                </button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                        <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="text-left hidden xs:block">
                            <p className="text-[11px] font-black leading-none uppercase tracking-tight">{user?.fullName?.split(' ')[0]}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider opacity-60">{t(user?.role?.toLowerCase() || '')}</p>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2">
                        <p className="text-xs font-black truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-medium">{user?.username}</p>
                    </div>
                    <DropdownMenuItem className="rounded-lg font-bold gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" /> {t('settings')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar scroll-smooth relative">
          <HelpGuide />
          {user?.isNearExpiry && showWarning && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3.5 flex items-center justify-between shadow-xl sticky top-0 z-40"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-wider">
                    {t('license_expiry_warning')}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 rounded-full" onClick={() => setShowWarning(false)}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.995 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Search Button Overlay (Floating) */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
            <Button size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/40 bg-primary ring-4 ring-white">
                <Search className="h-6 w-6" />
            </Button>
        </div>
      </div>
    </div>
  );
}

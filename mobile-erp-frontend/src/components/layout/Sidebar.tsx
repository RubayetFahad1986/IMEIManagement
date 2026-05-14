"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "@/lib/menu-config";
import { Smartphone, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { playSound } from "@/lib/sound";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { dir, t } = useLanguage();

  const filteredMenu = MENU_ITEMS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)))
  })).filter(group => group.items.length > 0);

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden" 
          onClick={onCloseMobile}
        />
      )}

      <motion.div 
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className={cn(
          "fixed inset-y-0 z-50 lg:relative bg-card border-r h-screen flex flex-col transition-all duration-300 shadow-xl lg:shadow-none",
          dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r',
          isMobileOpen ? "translate-x-0" : (dir === 'rtl' ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"),
          isCollapsed ? "w-20" : "w-[260px]"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-black text-lg tracking-tighter leading-none whitespace-nowrap">
                DOMINATE<span className="text-primary italic ml-1">ERP</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isCollapsed && <LanguageSwitcher />}
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggle}
                className="hidden lg:flex h-8 w-8 hover:bg-accent shrink-0"
            >
                {isCollapsed ? (dir === 'rtl' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : (dir === 'rtl' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)}
            </Button>
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          {filteredMenu.map((group) => (
            <div key={group.group} className="mb-8">
              {!isCollapsed && (
                <h2 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 opacity-50">
                  {t(group.group.toLowerCase())}
                </h2>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const translationKey = item.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                  const displayName = t(translationKey);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => { 
                        playSound('menu');
                        if(window.innerWidth < 1024) onCloseMobile(); 
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:pl-4"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                      {!isCollapsed && <span className="whitespace-nowrap">{displayName}</span>}
                      {isCollapsed && (
                        <div className="absolute left-16 bg-slate-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold uppercase whitespace-nowrap z-50 shadow-xl border border-white/10">
                            {displayName}
                        </div>
                      )}
                      {isActive && !isCollapsed && (
                        <motion.div layoutId="active-pill" className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            className={cn(
                "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all font-bold",
                isCollapsed ? "px-0 justify-center" : "px-4"
            )}
            onClick={logout}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{t('logout')}</span>}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

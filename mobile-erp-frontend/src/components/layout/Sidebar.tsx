"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "@/lib/menu-config";
import { Smartphone, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const filteredMenu = MENU_ITEMS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)))
  })).filter(group => group.items.length > 0);

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight leading-tight">Dominate ERP</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        {filteredMenu.map((group) => (
          <div key={group.group} className="mb-6">
            <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {group.group}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

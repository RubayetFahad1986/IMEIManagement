"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "./Sidebar";
import { User, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search IMEI or Invoice..."
              className="pl-10 bg-slate-50 border-none h-10 w-full focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 h-8">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {user?.fullName}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {user?.role}
                </p>
              </div>
              <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

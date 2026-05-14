"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { languageNames, Language } from "@/lib/translations";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
          <Languages className="h-5 w-5 text-slate-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-2xl border-none shadow-2xl p-2 bg-white ring-1 ring-slate-100">
        {(Object.keys(languageNames) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              language === lang ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <span className="font-bold">{languageNames[lang].native}</span>
            <span className="text-[10px] font-black uppercase opacity-40">{lang}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

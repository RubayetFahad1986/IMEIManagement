"use client";

import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalCount?: number;
}

export function ServerPagination({
  pageNumber,
  totalPages,
  pageSize = 10,
  onPageChange,
  onPageSizeChange = () => {},
  totalCount,
}: PaginationProps) {
  
  const safePageSize = pageSize || 10;
  
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, pageNumber - 1);
      let end = Math.min(totalPages - 1, pageNumber + 1);
      
      if (pageNumber <= 3) end = 4;
      if (pageNumber >= totalPages - 2) start = totalPages - 3;
      
      if (start > 2) pages.push("...");
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push("...");
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t bg-slate-50/30">
      <div className="flex items-center gap-6">
        {/* Row Count Selector */}
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Rows per page</span>
            <Select 
              value={safePageSize.toString()} 
              onValueChange={(v: string | null) => onPageSizeChange(parseInt(v || "10"))}
            >

                <SelectTrigger className="h-8 w-[70px] text-xs font-bold bg-white border-slate-200">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {[5, 10, 20, 50, 100].map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="text-[11px] font-bold text-slate-500">
            {totalCount !== undefined && (
            <>Showing <span className="text-primary">{(pageNumber - 1) * safePageSize + 1}</span> to <span className="text-primary">{Math.min(pageNumber * safePageSize, totalCount)}</span> of <span className="font-black text-slate-900">{totalCount}</span> results</>
            )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* First & Previous */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white border-slate-200"
          onClick={() => onPageChange(1)}
          disabled={pageNumber <= 1}
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white border-slate-200"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 mx-2">
            {generatePageNumbers().map((p, i) => (
                p === "..." ? (
                    <span key={i} className="px-1 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>
                ) : (
                    <Button
                        key={i}
                        variant={pageNumber === p ? "default" : "outline"}
                        className={`h-8 min-w-[32px] font-bold text-xs ${pageNumber === p ? 'shadow-md shadow-primary/20' : 'bg-white border-slate-200'}`}
                        onClick={() => onPageChange(p as number)}
                    >
                        {p}
                    </Button>
                )
            ))}
        </div>

        {/* Next & Last */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white border-slate-200"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white border-slate-200"
          onClick={() => onPageChange(totalPages)}
          disabled={pageNumber >= totalPages}
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

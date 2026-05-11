"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
}

export function ServerPagination({
  pageNumber,
  totalPages,
  onPageChange,
  totalCount,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount !== undefined && (
          <>Total <span className="font-medium text-foreground">{totalCount}</span> items found</>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        
        <div className="flex items-center gap-1 text-sm font-medium">
          Page {pageNumber} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

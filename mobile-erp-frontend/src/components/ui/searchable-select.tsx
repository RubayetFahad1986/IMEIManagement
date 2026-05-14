"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search as SearchIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface SearchableSelectProps {
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  onCreate?: (name: string) => void;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
  onCreate,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (onCreate && search) {
      onCreate(search);
      setOpen(false);
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (filteredOptions.length > 0) {
        onChange(filteredOptions[0].value);
        setOpen(false);
        setSearch("");
      } else if (onCreate && search) {
        handleCreate();
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
        <div className="flex items-center border-b px-3 bg-popover sticky top-0 z-10">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-2 px-1">
                <div className="py-4 text-center text-sm text-muted-foreground">No results found.</div>
                {onCreate && search && (
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-primary font-bold hover:text-primary hover:bg-primary/5 h-9 px-2"
                        onClick={handleCreate}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create "{search}"
                    </Button>
                )}
            </div>
          ) : (
            <>
                {filteredOptions.map((option, idx) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      (value === option.value || (search && idx === 0)) && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {(value === option.value || (search && idx === 0)) && <Check className="h-4 w-4" />}
                    </span>
                    {option.label}
                  </div>
                ))}
                {onCreate && search && !filteredOptions.some(o => o.label.toLowerCase() === search.toLowerCase()) && (
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-primary font-bold hover:text-primary hover:bg-primary/5 h-9 px-2 mt-1 border-t rounded-none"
                        onClick={handleCreate}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create "{search}"
                    </Button>
                )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

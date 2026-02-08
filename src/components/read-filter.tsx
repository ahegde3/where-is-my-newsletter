"use client"

import { cn } from "@/lib/utils"
import type { ReadFilter as ReadFilterType } from "@/types"

interface ReadFilterProps {
  activeFilter: ReadFilterType
  onFilterChange: (filter: ReadFilterType) => void
  counts: { all: number; read: number; unread: number }
}

const FILTER_OPTIONS: { value: ReadFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
]

export function ReadFilter({ activeFilter, onFilterChange, counts }: ReadFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            activeFilter === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
          <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
            {counts[option.value]}
          </span>
        </button>
      ))}
    </div>
  )
}

"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  const items: (number | string)[] = [];
  let prevPage: number | null = null;

  for (const page of visiblePages) {
    if (prevPage !== null && page - prevPage > 1) {
      items.push("...");
    }
    items.push(page);
    prevPage = page;
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-surface-gray border border-white/5 text-stone-500 hover:text-white disabled:opacity-30 disabled:hover:text-stone-500 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {items.map((item, index) => {
          if (item === "...") {
            return (
              <div key={`dots-${index}`} className="px-3 py-2 text-stone-600">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const page = item as number;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "min-w-[40px] px-3 py-2 rounded-lg text-sm font-bold transition-all border",
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-surface-gray border-white/5 text-stone-500 hover:text-white hover:border-white/20"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-surface-gray border border-white/5 text-stone-500 hover:text-white disabled:opacity-30 disabled:hover:text-stone-500 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

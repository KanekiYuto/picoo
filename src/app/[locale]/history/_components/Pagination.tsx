"use client";

import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  translationNamespace?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  translationNamespace = "common",
}: PaginationProps) {
  const t = useTranslations(translationNamespace);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={t("pagination.previous")}
      >
        <span className="text-xs sm:text-sm font-medium">‹</span>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            currentPage === page
              ? "border border-foreground/20 bg-muted/20 text-foreground"
              : "border border-border hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={t("pagination.next")}
      >
        <span className="text-xs sm:text-sm font-medium">›</span>
      </button>
    </div>
  );
}

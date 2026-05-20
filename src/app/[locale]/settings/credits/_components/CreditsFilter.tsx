"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterValue = "all" | "active" | "expired";

interface CreditsFilterProps {
  filter: FilterValue;
  onChange: (value: FilterValue) => void;
  allLabel: string;
  activeLabel: string;
  expiredLabel: string;
}

export function CreditsFilter({
  filter,
  onChange,
  allLabel,
  activeLabel,
  expiredLabel,
}: CreditsFilterProps) {
  const options = [
    { value: "all" as const, label: allLabel },
    { value: "active" as const, label: activeLabel },
    { value: "expired" as const, label: expiredLabel },
  ];

  return (
    <div className="flex rounded-full border border-background-2 bg-background-1 p-1">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={filter === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn("h-7 rounded-full px-3 text-xs", filter !== option.value && "text-muted-foreground")}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

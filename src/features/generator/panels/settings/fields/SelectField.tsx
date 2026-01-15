"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { useFormField } from "@/components/ui/form";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  title: string;
  options: SelectOption[];
}

export function SelectField({ title, options }: SelectFieldProps) {
  const { field } = useFormField();

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:items-center">
      <label className="text-sm font-semibold text-foreground">
        {title}
      </label>
      <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="w-full bg-background dark:bg-muted/20 dark:hover:bg-muted/20">
            <SelectValue placeholder="选择选项" />
          </SelectTrigger>
          <SelectContent className={`z-[10000]`}>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  );
}

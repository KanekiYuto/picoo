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
    <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5 flex items-center justify-between gap-4">
      <label className="text-sm font-semibold text-foreground">
        {title}
      </label>
      <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger>
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

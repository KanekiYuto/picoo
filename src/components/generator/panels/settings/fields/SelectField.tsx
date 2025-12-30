"use client";

import { SectionCard } from "../SectionCard";
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
    <SectionCard title={title}>
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
    </SectionCard>
  );
}

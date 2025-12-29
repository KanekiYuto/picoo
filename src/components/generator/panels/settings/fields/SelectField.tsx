"use client";

import { SectionCard } from "../SectionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  title: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  zIndex?: number;
}

export function SelectField({ title, value, options, onChange }: SelectFieldProps) {
  return (
    <SectionCard title={title}>
      <Select value={value} onValueChange={onChange}>
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
    </SectionCard>
  );
}

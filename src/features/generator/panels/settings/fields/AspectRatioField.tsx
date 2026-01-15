"use client";

import { useTranslations } from "next-intl";
import { SectionCard } from "../SectionCard";
import { RatioControls } from "../RatioControls";
import { FormControl, useFormField } from "@/components/ui/form";
import type { AspectRatio, AspectRatioOption } from "../types";

interface AspectRatioFieldProps {
  options: readonly AspectRatioOption[];
}

export function AspectRatioField({ options }: AspectRatioFieldProps) {
  const t = useTranslations("generator.settingsPanel");
  const { field } = useFormField();

  return (
    <SectionCard title={t("aspectRatio")} className="bg-muted/10">
      <FormControl>
        <RatioControls options={options} value={field.value as AspectRatio} onChange={field.onChange} />
      </FormControl>
    </SectionCard>
  );
}

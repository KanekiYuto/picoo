"use client";

import { ImageUpload } from "./image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField as Field,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAppPreviewStore } from "./app-preview-store";
import { useGenerateImage } from "./useGenerateImage";
import { getRequiredCredits } from "@/config/model-credit-cost";

type AppFormValues = {
  image: File | null;
  prompt: string;
  aspectRatio: string;
};

export type AppFormContent = {
  image: { label: string; description: string };
  prompt: { label: string; help: string };
  defaultPrompt: string;
  aspectRatio: {
    label: string;
    help: string;
    options: readonly { value: string; label: string }[];
  };
  submit: string;
};

export type ImageUploadStrings = {
  remove: string;
  change: string;
  cta: string;
  recommendation: string;
  previewAlt: string;
  maxSizeHint: string;
  errors: { invalidType: string; maxSize: string };
};

export function AppFormClient({
  formContent,
  imageUploadStrings,
}: {
  formContent: AppFormContent;
  imageUploadStrings: ImageUploadStrings;
}) {
  const status = useAppPreviewStore((s) => s.status);
  const progress = useAppPreviewStore((s) => s.progress);
  const isGenerating = status === "generating";
  const percent =
    typeof progress?.value === "number"
      ? Math.round(Math.max(0, Math.min(1, progress.value)) * 100)
      : null;
  const requiredCredits = getRequiredCredits("edit-image", "seedream-v4.5", {});
  const { generate } = useGenerateImage();

  const form = useForm<AppFormValues>({
    defaultValues: {
      image: null,
      prompt: formContent.defaultPrompt,
      aspectRatio: "1:1",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(({ image, prompt }) => {
          if (!image) return;
          generate({ image, prompt });
        })}
      >
        <Field
          name="image"
          render={({ field }) => (
            <ImageUpload
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              label={formContent.image.label}
              description={formContent.image.description}
              strings={imageUploadStrings}
            />
          )}
        />

        <Field
          name="prompt"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="space-y-1">
                <FormLabel>{formContent.prompt.label}</FormLabel>
                <FormDescription className="text-xs">
                  {formContent.prompt.help}
                </FormDescription>
              </div>
              <FormControl className="mt-3">
                <Textarea
                  {...field}
                  className="min-h-[120px] rounded-lg border-background-2 bg-background-generator hover:bg-background-generator/40"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Field
          name="aspectRatio"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="space-y-1">
                <FormLabel>{formContent.aspectRatio.label}</FormLabel>
                <FormDescription className="text-xs">
                  {formContent.aspectRatio.help}
                </FormDescription>
              </div>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="mt-3 w-full cursor-pointer rounded-lg border-background-2 bg-background hover:bg-background-generator">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formContent.aspectRatio.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="default"
          disabled={isGenerating}
          className="relative w-full h-12 overflow-hidden rounded-lg text-base font-semibold"
        >
          {isGenerating && percent !== null && (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 bg-white/20 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          )}
          <span className="relative flex items-center justify-center gap-2">
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGenerating
              ? percent !== null
                ? `${percent}%`
                : progress?.label ?? formContent.submit
              : formContent.submit}
            {!isGenerating && (
              <Badge className="gap-0.5 bg-white/15 text-inherit hover:bg-white/20 border-transparent font-normal">
                <Zap className="h-3 w-3" />
                {requiredCredits}
              </Badge>
            )}
          </span>
        </Button>
      </form>
    </Form>
  );
}

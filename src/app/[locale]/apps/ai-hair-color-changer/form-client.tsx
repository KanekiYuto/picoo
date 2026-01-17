"use client";

import { ImageUpload } from "../_components/image-upload";
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
import { useForm } from "react-hook-form";

type HairColorChangerFormValues = {
  image: File | null;
  prompt: string;
  aspectRatio: "1:1" | "4:5" | "3:4" | "9:16";
};

export function AiHairColorChangerFormClient({
  formContent,
  imageUploadStrings,
}: {
  formContent: {
    image: { label: string; description: string };
    prompt: { label: string; help: string };
    aspectRatio: {
      label: string;
      help: string;
      options: readonly { value: "1:1" | "4:5" | "3:4" | "9:16"; label: string }[];
    };
    submit: string;
  };
  imageUploadStrings: {
    remove: string;
    change: string;
    cta: string;
    recommendation: string;
    previewAlt: string;
    maxSizeHint: string;
    errors: { invalidType: string; maxSize: string };
  };
}) {
  const form = useForm<HairColorChangerFormValues>({
    defaultValues: {
      image: null,
      prompt: "Change my hair color to chestnut brown",
      aspectRatio: "1:1",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(() => {})}>
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
                  className="min-h-[120px] rounded-3xl border-border bg-muted/10 hover:bg-muted/20"
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
                  <SelectTrigger className="mt-3 w-full cursor-pointer rounded-3xl border-border bg-muted/10 hover:bg-muted/20 dark:bg-muted/10 dark:hover:bg-muted/20">
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
          className="w-full rounded-2xl bg-primary text-white hover:bg-primary-hover"
        >
          {formContent.submit}
        </Button>
      </form>
    </Form>
  );
}


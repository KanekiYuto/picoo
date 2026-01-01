"use client";

import type { FormFieldRenderer } from "./types";
import { AspectRatioField, VariationsField, VisibilityField, SelectField } from "./fields";
import { FormField } from "@/components/ui/form";
import { DEFAULT_ASPECT_RATIO_OPTIONS } from "../../config";

// SelectField 配置对象
interface SelectFieldConfig {
  fieldName: string;
  title: string;
  options: Array<{ value: string; label: string }>;
}

const SELECT_FIELD_CONFIGS = {
  // GPT Image 1.5 字段
  gptSize: {
    fieldName: "size",
    title: "formFields.size",
    options: [
      { value: "1024x1024", label: "1024x1024" },
      { value: "1024x1536", label: "1024x1536" },
      { value: "1536x1024", label: "1536x1024" },
    ],
  } as SelectFieldConfig,
  gptQuality: {
    fieldName: "quality",
    title: "formFields.quality",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  } as SelectFieldConfig,
  gptFormat: {
    fieldName: "format",
    title: "formFields.outputFormat",
    options: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WEBP" },
    ],
  } as SelectFieldConfig,
  gptBackground: {
    fieldName: "background",
    title: "formFields.background",
    options: [
      { value: "auto", label: "Auto" },
      { value: "transparent", label: "Transparent" },
      { value: "opaque", label: "Opaque" },
    ],
  } as SelectFieldConfig,
  // Nano Banana Pro 字段
  resolution: {
    fieldName: "resolution",
    title: "formFields.resolution",
    options: [
      { value: "1k", label: "1K" },
      { value: "2k", label: "2K" },
      { value: "4k", label: "4K" },
    ],
  } as SelectFieldConfig,
  outputFormat: {
    fieldName: "output_format",
    title: "formFields.outputFormat",
    options: [
      { value: "png", label: "PNG" },
      { value: "jpg", label: "JPG" },
    ],
  } as SelectFieldConfig,
  // Upscale 字段
  upscaleResolution: {
    fieldName: "resolution",
    title: "formFields.resolution",
    options: [
      { value: "2k", label: "2K" },
      { value: "4k", label: "4K" },
      { value: "8k", label: "8K" },
    ],
  } as SelectFieldConfig,
  upscaleFormat: {
    fieldName: "format",
    title: "formFields.imageFormat",
    options: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WEBP" },
    ],
  } as SelectFieldConfig,
  // Remove Watermark 字段
  removeWatermarkFormat: {
    fieldName: "format",
    title: "formFields.imageFormat",
    options: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WEBP" },
    ],
  } as SelectFieldConfig,
};

// 默认文生图表单字段渲染器
export const defaultTextToImageFormFields: FormFieldRenderer = ({ t }) => (
  <>
    <div className="shrink-0">
      <FormField name="aspect_ratio" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div>
      <FormField name="variations" render={() => (
        <VariationsField />
      )} />
    </div>
    <div>
      <FormField name="visibility" render={() => (
        <VisibilityField />
      )} />
    </div>
  </>
);

// Seedream v4.5 文生图表单字段渲染器
export const seedream45FormFields: FormFieldRenderer = ({ t }) => (
  <>
    <div className="shrink-0">
      <FormField name="size" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div>
      <FormField name="visibility" render={() => (
        <VisibilityField />
      )} />
    </div>
  </>
);

// Flux 2 Pro 文生图表单字段渲染器
export const flux2ProFormFields: FormFieldRenderer = ({ t }) => (
  <>
    <div className="shrink-0">
      <FormField name="size" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div>
      <FormField name="visibility" render={() => (
        <VisibilityField />
      )} />
    </div>
  </>
);

// GPT Image 1.5 文生图表单字段渲染器
export const gptImage15FormFields: FormFieldRenderer = ({ t }) => {
  const gptSize = SELECT_FIELD_CONFIGS.gptSize;
  const gptQuality = SELECT_FIELD_CONFIGS.gptQuality;
  const gptFormat = SELECT_FIELD_CONFIGS.gptFormat;
  const gptBackground = SELECT_FIELD_CONFIGS.gptBackground;

  return (
    <>
      <div>
        <FormField name="num_images" render={() => (
          <VariationsField />
        )} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <FormField name={gptSize.fieldName} render={() => (
            <SelectField
              title={t(gptSize.title)}
              options={gptSize.options}
            />
          )} />
        </div>
        <div className="flex-1">
          <FormField name={gptQuality.fieldName} render={() => (
            <SelectField
              title={t(gptQuality.title)}
              options={gptQuality.options}
            />
          )} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <FormField name={gptFormat.fieldName} render={() => (
            <SelectField
              title={t(gptFormat.title)}
              options={gptFormat.options}
            />
          )} />
        </div>
        <div className="flex-1">
          <FormField name={gptBackground.fieldName} render={() => (
            <SelectField
              title={t(gptBackground.title)}
              options={gptBackground.options}
            />
          )} />
        </div>
      </div>

      <div>
        <FormField name="visibility" render={() => (
          <VisibilityField />
        )} />
      </div>
    </>
  );
};

// Nano Banana Pro 文生图表单字段渲染器
export const nanoBananaProFormFields: FormFieldRenderer = ({ t }) => {
  const resolution = SELECT_FIELD_CONFIGS.resolution;
  const outputFormat = SELECT_FIELD_CONFIGS.outputFormat;

  return (
    <>
      <div className="shrink-0">
        <FormField name="aspect_ratio" render={() => (
          <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
        )} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <FormField name={resolution.fieldName} render={() => (
            <SelectField
              title={t(resolution.title)}
              options={resolution.options}
            />
          )} />
        </div>
        <div className="flex-1">
          <FormField name={outputFormat.fieldName} render={() => (
            <SelectField
              title={t(outputFormat.title)}
              options={outputFormat.options}
            />
          )} />
        </div>
      </div>
      <div>
        <FormField name="visibility" render={() => (
          <VisibilityField />
        )} />
      </div>
    </>
  );
};

// 默认图生图表单字段渲染器
export const defaultImageToImageFormFields: FormFieldRenderer = ({ t }) => (
  <>
    <div className="shrink-0">
      <FormField name="aspectRatio" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div>
      <FormField name="variations" render={() => (
        <VariationsField />
      )} />
    </div>
    <div>
      <FormField name="visibility" render={() => (
        <VisibilityField />
      )} />
    </div>
  </>
);

// 放大模式表单字段渲染器
export const upscaleFormFields: FormFieldRenderer = ({ t }) => {
  const upscaleResolution = SELECT_FIELD_CONFIGS.upscaleResolution;
  const upscaleFormat = SELECT_FIELD_CONFIGS.upscaleFormat;

  return (
    <>
      <div>
        <FormField name={upscaleResolution.fieldName} render={() => (
          <SelectField
            title={t(upscaleResolution.title)}
            options={upscaleResolution.options}
          />
        )} />
      </div>
      <div>
        <FormField name={upscaleFormat.fieldName} render={() => (
          <SelectField
            title={t(upscaleFormat.title)}
            options={upscaleFormat.options}
          />
        )} />
      </div>
    </>
  );
};

// 去水印模式表单字段渲染器
export const removeWatermarkFormFields: FormFieldRenderer = ({ t }) => {
  const removeWatermarkFormat = SELECT_FIELD_CONFIGS.removeWatermarkFormat;

  return (
    <>
      <div>
        <FormField name={removeWatermarkFormat.fieldName} render={() => (
          <SelectField
            title={t(removeWatermarkFormat.title)}
            options={removeWatermarkFormat.options}
          />
        )} />
      </div>
    </>
  );
};

// Z Image Turbo 文生图表单字段渲染器
export const zImageFormFields: FormFieldRenderer = ({ t }) => (
  <>
    <div className="shrink-0">
      <FormField name="size" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div>
      <FormField name="visibility" render={() => (
        <VisibilityField />
      )} />
    </div>
  </>
);

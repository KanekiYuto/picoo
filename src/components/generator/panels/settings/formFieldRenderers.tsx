"use client";

import type { FormFieldRenderer } from "./types";
import { AspectRatioField, VariationsField, VisibilityField, SelectField } from "./fields";
import { FormField } from "@/components/ui/form";
import { DEFAULT_ASPECT_RATIO_OPTIONS } from "../../config";

// 默认文生图表单字段渲染器
export const defaultTextToImageFormFields: FormFieldRenderer = () => (
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
export const seedream45FormFields: FormFieldRenderer = () => (
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
export const flux2ProFormFields: FormFieldRenderer = () => (
  <>
    <div className="shrink-0">
      <FormField name="aspect_ratio" render={() => (
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
export const gptImage15FormFields: FormFieldRenderer = () => (
  <>
    <div>
      <FormField name="num_images" render={() => (
        <VariationsField />
      )} />
    </div>

    <div className="flex gap-4">
      <div className="flex-1">
        <FormField name="size" render={() => (
          <SelectField
            title="尺寸"
            options={[
              { value: "1024x1024", label: "1024x1024" },
              { value: "1024x1536", label: "1024x1536" },
              { value: "1536x1024", label: "1536x1024" },
            ]}
          />
        )} />
      </div>
      <div className="flex-1">
        <FormField name="quality" render={() => (
          <SelectField
            title="质量"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
        )} />
      </div>
    </div>

    <div className="flex gap-4">
      <div className="flex-1">
        <FormField name="format" render={() => (
          <SelectField
            title="输出格式"
            options={[
              { value: "jpeg", label: "JPEG" },
              { value: "png", label: "PNG" },
              { value: "webp", label: "WEBP" },
            ]}
          />
        )} />
      </div>
      <div className="flex-1">
        <FormField name="background" render={() => (
          <SelectField
            title="背景"
            options={[
              { value: "auto", label: "Auto" },
              { value: "transparent", label: "Transparent" },
              { value: "opaque", label: "Opaque" },
            ]}
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

// Nano Banana Pro 文生图表单字段渲染器
export const nanoBananaProFormFields: FormFieldRenderer = () => (
  <>
    <div className="shrink-0">
      <FormField name="aspect_ratio" render={() => (
        <AspectRatioField options={DEFAULT_ASPECT_RATIO_OPTIONS} />
      )} />
    </div>
    <div className="flex gap-4">
      <div className="flex-1">
        <FormField name="resolution" render={() => (
          <SelectField
            title="分辨率"
            options={[
              { value: "1k", label: "1K" },
              { value: "2k", label: "2K" },
              { value: "4k", label: "4K" },
            ]}
          />
        )} />
      </div>
      <div className="flex-1">
        <FormField name="output_format" render={() => (
          <SelectField
            title="输出格式"
            options={[
              { value: "png", label: "PNG" },
              { value: "jpg", label: "JPG" },
            ]}
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

// 默认图生图表单字段渲染器
export const defaultImageToImageFormFields: FormFieldRenderer = () => (
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
export const upscaleFormFields: FormFieldRenderer = () => (
  <>
    <div>
      <FormField name="resolution" render={() => (
        <SelectField
          title="分辨率"
          options={[
            { value: "2k", label: "2K" },
            { value: "4k", label: "4K" },
            { value: "8k", label: "8K" },
          ]}
        />
      )} />
    </div>
    <div>
      <FormField name="format" render={() => (
        <SelectField
          title="图片格式"
          options={[
            { value: "jpeg", label: "JPEG" },
            { value: "png", label: "PNG" },
            { value: "webp", label: "WEBP" },
          ]}
        />
      )} />
    </div>
  </>
);

// 去水印模式表单字段渲染器
export const removeWatermarkFormFields: FormFieldRenderer = () => (
  <>
    <div>
      <FormField name="format" render={() => (
        <SelectField
          title="图片格式"
          options={[
            { value: "jpeg", label: "JPEG" },
            { value: "png", label: "PNG" },
            { value: "webp", label: "WEBP" },
          ]}
        />
      )} />
    </div>
  </>
);

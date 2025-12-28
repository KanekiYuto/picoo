"use client";

import { Type, Maximize, Pencil, Wand2 } from "lucide-react";
import type { ComponentType, ReactElement } from "react";
import type { AspectRatio, AspectRatioOption, ModelOption, GeneratorSettings } from "./panels/settings/types";
import { AspectRatioField, VariationsField, VisibilityField, SelectField } from "./panels/settings/fields";

export type GeneratorMode = "text-to-image" | "upscale" | "edit-image" | "remove-watermark";

// 模型 Icon 组件
export const GoogleMonoIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M21 12.2c0-.74-.061-1.28-.193-1.84h-8.624v3.34h5.061c-.1.83-.651 2.08-1.876 2.92l-.018.111 2.727 2.07.188.019C20 17.25 21 14.94 21 12.2Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.184 21c2.48 0 4.56-.8 6.08-2.18l-2.896-2.2c-.776.53-1.817.9-3.184.9a5.518 5.518 0 0 1-5.225-3.74l-.108.009-2.835 2.15-.037.101C5.49 18.98 8.592 21 12.184 21Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.96 13.78A5.44 5.44 0 0 1 6.651 12c0-.62.112-1.22.295-1.78l-.005-.12-2.87-2.184-.094.044A8.862 8.862 0 0 0 3 12c0 1.45.357 2.82.98 4.04l2.98-2.26Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.184 6.48c1.725 0 2.888.73 3.551 1.34l2.591-2.48C16.735 3.89 14.663 3 12.184 3 8.591 3 5.49 5.02 3.98 7.96l2.97 2.26a5.539 5.539 0 0 1 5.235-3.74Z"
      clipRule="evenodd"
    />
  </svg>
);

export const GptMonoIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M19.8134 10.3668C19.9675 9.91002 20.0461 9.43174 20.0461 8.95031C20.0461 8.15369 19.831 7.37145 19.4231 6.684C18.6034 5.27609 17.0827 4.40687 15.4369 4.40687C15.1132 4.40687 14.7888 4.44062 14.4723 4.50766C14.0459 4.03362 13.5225 3.65415 12.9366 3.39427C12.3507 3.1344 11.7156 3.00002 11.0733 3H11.0444C11.0415 3.0001 11.037 3.0001 11.0336 3.0001C9.04031 3.0001 7.27265 4.26917 6.65985 6.14013C5.37666 6.39897 4.26892 7.193 3.62127 8.31553C3.21458 9.00714 3.00026 9.79247 3 10.5921C3.00016 11.7158 3.42294 12.7995 4.18645 13.6332C4.03232 14.09 3.95372 14.5683 3.95366 15.0497C3.95372 15.8464 4.16876 16.6286 4.57668 17.316C5.39633 18.7244 6.91713 19.5931 8.56306 19.5931C8.88711 19.5931 9.21027 19.5593 9.52713 19.4923C9.9536 19.9663 10.4771 20.3458 11.063 20.6057C11.649 20.8656 12.2841 21 12.9265 21H12.9553L12.9671 21C14.9614 21 16.7285 19.7309 17.3414 17.8582C18.6245 17.5993 19.7323 16.8053 20.3799 15.6827C20.7862 14.9917 21.0001 14.2071 21 13.4082C20.9999 12.2845 20.5771 11.2008 19.8136 10.3671L19.8134 10.3668ZM12.9565 19.8232H12.9518C12.1538 19.823 11.3811 19.5467 10.7681 19.0426C10.8045 19.0232 10.8404 19.0031 10.876 18.9823L14.5083 16.912C14.599 16.8611 14.6743 16.7875 14.7268 16.6985C14.7792 16.6095 14.8068 16.5085 14.8069 16.4056V11.3494L16.3422 12.2241C16.3585 12.2321 16.3697 12.2478 16.372 12.2656V16.45C16.3699 18.3104 14.8421 19.8195 12.9565 19.8232ZM5.61125 16.7279C5.31123 16.216 5.15317 15.6352 5.15298 15.0439C5.15298 14.851 5.17005 14.6576 5.2033 14.4676C5.23029 14.4836 5.27741 14.5119 5.31121 14.5311L8.94357 16.6013C9.03415 16.6534 9.13713 16.6808 9.24197 16.6808C9.34682 16.6808 9.44978 16.6533 9.54035 16.6012L13.975 14.0747V15.8241C13.9755 15.833 13.9738 15.8419 13.97 15.85C13.9661 15.8581 13.9603 15.8652 13.9531 15.8705L10.2812 17.9624C9.7616 18.2574 9.17266 18.4128 8.57317 18.413C7.97308 18.4129 7.38356 18.2571 6.86371 17.9614C6.34386 17.6656 5.91196 17.2401 5.6113 16.7277L5.61125 16.7279ZM4.65569 8.90377C5.05461 8.22003 5.68454 7.6965 6.43522 7.42481C6.43522 7.45569 6.43341 7.51034 6.43341 7.54833V11.6887L6.43336 11.6922C6.43338 11.795 6.46098 11.8959 6.51334 11.9848C6.5657 12.0737 6.64097 12.1473 6.7315 12.1982L11.1662 14.7244L9.63093 15.5991C9.62336 15.604 9.61466 15.607 9.60563 15.6078C9.59659 15.6086 9.5875 15.6072 9.57915 15.6037L5.90689 13.5101C5.38774 13.2133 4.95675 12.7872 4.65711 12.2743C4.35747 11.7615 4.1997 11.1799 4.19962 10.588C4.19987 9.99691 4.35719 9.41625 4.65589 8.90392L4.65569 8.90377ZM17.2696 11.8001L12.835 9.27354L14.3703 8.39917C14.3778 8.39424 14.3865 8.39124 14.3956 8.39043C14.4046 8.38962 14.4137 8.39103 14.422 8.39453L18.0943 10.4864C19.1513 11.0889 19.8034 12.2031 19.8034 13.4079C19.8034 14.8212 18.9097 16.0858 17.5658 16.5739V12.3096C17.566 12.308 17.566 12.3064 17.566 12.3049C17.566 12.0964 17.4528 11.9037 17.2696 11.8001ZM18.7978 9.5308C18.7708 9.51444 18.7237 9.48643 18.6899 9.46726L15.0575 7.39705C14.967 7.34496 14.864 7.3175 14.7592 7.31745C14.6544 7.31745 14.5514 7.34502 14.4609 7.39705L10.0262 9.92359V8.17417L10.0261 8.17116C10.0261 8.16272 10.0281 8.1544 10.0319 8.14685C10.0358 8.13931 10.0413 8.13274 10.0481 8.12768L13.7201 6.03761C14.2395 5.74216 14.8284 5.58661 15.428 5.58657C17.316 5.58657 18.8471 7.09729 18.8471 8.96014C18.847 9.15131 18.8305 9.34212 18.7978 9.53055V9.5308ZM9.19148 12.6488L7.65582 11.7741C7.64776 11.7702 7.64082 11.7643 7.63561 11.7571C7.63041 11.7498 7.62709 11.7414 7.62597 11.7326V7.54823C7.62677 5.68632 9.15788 4.17688 11.0451 4.17688C11.8443 4.17706 12.6183 4.45331 13.2327 4.95771C13.1964 4.97714 13.1604 4.99727 13.1248 5.01809L9.49248 7.08825C9.40185 7.13914 9.32649 7.21279 9.27407 7.30172C9.22164 7.39065 9.19401 7.49169 9.19399 7.59458V7.59794L9.19148 12.6488ZM10.0255 10.8746L12.0006 9.74903L13.9757 10.8739V13.1244L12.0006 14.2492L10.0255 13.1244V10.8746Z"
      fill="currentColor"
    />
  </svg>
);

export const ByteDanceIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m14.409 17.305-1.395-.35v-6.42l1.493-.366c.818-.2 1.505-.363 1.538-.357.026 0 .046 1.764.046 3.925v3.926l-.144-.006c-.085 0-.779-.163-1.538-.352ZM7.91 15.691c0-2.16.019-3.932.051-3.932.027-.006.714.158 1.539.359l1.486.364-.014 3.197-.02 3.197-1.335.333a95.91 95.91 0 0 1-1.518.37l-.19.044v-3.932ZM17.924 12.482c0-7.13.006-7.512.117-7.48.06.019.642.163 1.29.32.648.163 1.29.32 1.427.351l.242.064-.033 13.522-1.328.326c-.727.182-1.414.345-1.519.372l-.196.043v-7.518ZM3 12.507c0-3.693.02-6.714.052-6.714.027 0 .714.163 1.532.358l1.492.364v5.986c0 3.284-.013 5.98-.026 5.98-.02 0-.713.169-1.538.37L3 19.221v-6.714Z"
      clipRule="evenodd"
    />
  </svg>
);

export const FluxIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m2.1 20 9.908-15L21.9 20h-1.842l-8.05-12.213-7.043 10.665h10L15.986 20H2.101Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m8.757 16.734 1.71-2.57 1.711 2.57h-3.42ZM17.147 20l-4.675-7.183h1.796L18.958 20h-1.81Zm1.238-7.43 1.757-2.632L21.9 12.57h-3.514Z"
      clipRule="evenodd"
    />
  </svg>
);

export const AliIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.495 3.278c.321.565.64 1.131.96 1.698a.147.147 0 0 0 .128.074h4.543c.142 0 .263.09.365.268l1.19 2.103c.155.275.196.39.02.685-.214.351-.42.706-.623 1.063l-.3.539c-.087.16-.182.229-.033.418l2.17 3.794c.14.247.09.405-.035.63-.358.643-.722 1.28-1.092 1.915-.13.222-.288.307-.557.303a35.224 35.224 0 0 0-1.904.013.082.082 0 0 0-.066.04 472.493 472.493 0 0 1-2.213 3.879c-.138.24-.31.297-.593.297-.816.003-1.638.004-2.469.002a.44.44 0 0 1-.38-.222l-1.092-1.9a.074.074 0 0 0-.068-.04H6.258c-.233.024-.452-.001-.658-.076l-1.312-2.266a.444.444 0 0 1-.001-.442l.987-1.734a.163.163 0 0 0 0-.161c-.514-.891-1.026-1.783-1.534-2.678l-.646-1.14c-.131-.255-.142-.407.077-.79.38-.666.759-1.33 1.135-1.993.108-.192.249-.274.478-.275.706-.003 1.412-.003 2.118 0a.101.101 0 0 0 .088-.052l2.296-4.005a.4.4 0 0 1 .345-.201c.429-.001.861 0 1.295-.005L11.758 3c.28-.002.593.026.737.278Zm-2.808.33a.049.049 0 0 0-.043.025L7.299 7.736a.129.129 0 0 1-.11.064H4.844c-.046 0-.058.02-.034.06l4.754 8.31c.02.034.01.05-.028.051l-2.287.012a.178.178 0 0 0-.163.095l-1.08 1.89c-.036.064-.018.097.055.097l4.677.006c.037 0 .065.017.085.05l1.148 2.008c.037.066.075.067.114 0l4.095-7.167.641-1.131a.045.045 0 0 1 .078 0l1.166 2.07a.1.1 0 0 0 .087.05l2.26-.016a.033.033 0 0 0 .017-.004.033.033 0 0 0 .012-.012.033.033 0 0 0 0-.033l-2.372-4.16a.088.088 0 0 1 0-.093l.24-.415.916-1.618c.02-.033.01-.05-.029-.05H9.71c-.048 0-.06-.022-.035-.063l1.174-2.05a.087.087 0 0 0 0-.093L9.73 3.634a.05.05 0 0 0-.043-.026Zm5.146 6.562c.037 0 .047.016.028.049l-.681 1.199-2.138 3.75a.046.046 0 0 1-.04.025.047.047 0 0 1-.04-.024l-2.827-4.935c-.016-.028-.008-.043.023-.045l.177-.01 5.5-.01h-.002Z"
      clipRule="evenodd"
    />
  </svg>
);

// 默认纵横比选项
export const DEFAULT_ASPECT_RATIO_OPTIONS: readonly AspectRatioOption[] = [
  { portrait: "1:1" },
  { portrait: "21:9" },
  { portrait: "4:5", landscape: "5:4" },
  { portrait: "2:3", landscape: "3:2" },
  { portrait: "3:4", landscape: "4:3" },
  { portrait: "9:16", landscape: "16:9" },
];

// 模型配置接口
export interface ModelInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  apiRoute: string;
  features?: string[];
  descriptionKey?: string;
  aspectRatioOptions?: readonly AspectRatioOption[];
}

// 默认设置接口
export interface DefaultSettings {
  model?: string;
  aspectRatio?: AspectRatio;
  variations?: 1 | 2 | 3 | 4;
  resolution?: string;
  format?: string;
}

// 表单字段渲染函数类型
export type FormFieldRenderer = (props: {
  settings: GeneratorSettings;
  onChange: (settings: GeneratorSettings) => void;
  aspectRatioOptions: readonly AspectRatioOption[];
  canReset: boolean;
  onReset: () => void;
}) => ReactElement;

// ModelDisplay 显示字段类型
export type DisplayField = "model" | "aspectRatio" | "variations" | "resolution";

// 模式配置接口
export interface ModeConfig {
  id: GeneratorMode;
  icon: React.ElementType;
  labelKey: string;
  descKey: string;
  models?: Record<string, ModelInfo>; // 支持的模型及其信息
  apiRoute?: string; // 固定 API 路由（不依赖模型）
  defaultSettings?: DefaultSettings; // 默认设置
  renderFormFields?: FormFieldRenderer; // 渲染表单字段
  displayFields: DisplayField[]; // ModelDisplay 中显示的字段
}

// 模式配置
export const MODE_CONFIGS: Record<GeneratorMode, ModeConfig> = {
  "text-to-image": {
    id: "text-to-image",
    icon: Type,
    labelKey: "prompt",
    descKey: "promptDesc",
    displayFields: ["model", "aspectRatio", "variations"],
    models: {
      "nano-banana-pro": {
        name: "Nano Banana Pro",
        icon: GoogleMonoIcon,
        apiRoute: "wavespeed/nano-banana-pro/text-to-image",
        features: ["fast", "simple"],
        descriptionKey: "nano-banana-pro",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "seedream-v4-5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        apiRoute: "wavespeed/seedream-v4.5/text-to-image",
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "chatgpt-1-5": {
        name: "ChatGPT 1.5",
        icon: GptMonoIcon,
        apiRoute: "fal/gpt-image-1.5/text-to-image",
        features: ["versatile", "stable"],
        descriptionKey: "chatgpt-1-5",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        apiRoute: "wavespeed/flux-2-pro/text-to-image",
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "z-image-turbo": {
        name: "Z Image Turbo",
        icon: AliIcon,
        apiRoute: "wavespeed/z-image/turbo",
        features: ["realtime", "ultraFast"],
        descriptionKey: "z-image-turbo",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
    },
    defaultSettings: {
      model: "nano-banana-pro",
      aspectRatio: "1:1",
      variations: 1,
    },
    renderFormFields: ({ settings, onChange, aspectRatioOptions, canReset, onReset }) => (
      <>
        <div className="shrink-0">
          <AspectRatioField
            value={settings.aspectRatio}
            options={aspectRatioOptions}
            onChange={(aspectRatio) => onChange({ ...settings, aspectRatio })}
            canReset={canReset}
            onReset={onReset}
          />
        </div>
        <div>
          <VariationsField
            value={settings.variations}
            onChange={(variations) => onChange({ ...settings, variations })}
          />
        </div>
        <div>
          <VisibilityField
            value={settings.visibility}
            onChange={(visibility) => onChange({ ...settings, visibility })}
          />
        </div>
      </>
    ),
  },
  "upscale": {
    id: "upscale",
    icon: Maximize,
    labelKey: "upscale",
    descKey: "upscaleDesc",
    apiRoute: "wavespeed/image-upscaler",
    displayFields: ["model", "resolution"],
    models: {
      "upscale": {
        name: "Upscale",
        icon: AliIcon,
        apiRoute: "wavespeed/image-upscaler",
        features: ["fast", "highQuality"],
        descriptionKey: "upscale",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
    },
    defaultSettings: {
      model: "upscale",
      aspectRatio: "1:1",
      variations: 1,
      resolution: "2k",
      format: "jpeg",
    },
    renderFormFields: ({ settings, onChange }) => (
      <>
        <div>
          <SelectField
            title="分辨率"
            value={settings.resolution || "2k"}
            options={[
              { value: "2k", label: "2K" },
              { value: "4k", label: "4K" },
              { value: "8k", label: "8K" },
            ]}
            onChange={(resolution) => onChange({ ...settings, resolution })}
          />
        </div>
        <div>
          <SelectField
            title="图片格式"
            value={settings.format || "jpeg"}
            options={[
              { value: "jpeg", label: "JPEG" },
              { value: "png", label: "PNG" },
              { value: "webp", label: "WEBP" },
            ]}
            onChange={(format) => onChange({ ...settings, format })}
          />
        </div>
      </>
    ),
  },
  "edit-image": {
    id: "edit-image",
    icon: Pencil,
    labelKey: "edit",
    descKey: "editDesc",
    displayFields: ["model", "aspectRatio", "variations"],
    models: {
      "nano-banana-pro": {
        name: "Nano Banana Pro",
        icon: GoogleMonoIcon,
        apiRoute: "wavespeed/nano-banana-pro/image-to-image",
        features: ["fast", "simple"],
        descriptionKey: "nano-banana-pro",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "seedream-v4-5": {
        name: "Seedream v4.5",
        icon: ByteDanceIcon,
        apiRoute: "wavespeed/seedream-v4.5/image-to-image",
        features: ["artistic", "creative"],
        descriptionKey: "seedream-v4-5",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "chatgpt-1-5": {
        name: "ChatGPT 1.5",
        icon: GptMonoIcon,
        apiRoute: "fal/gpt-image-1.5/image-to-image",
        features: ["versatile", "stable"],
        descriptionKey: "chatgpt-1-5",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
      "flux-2-pro": {
        name: "Flux 2 Pro",
        icon: FluxIcon,
        apiRoute: "wavespeed/flux-2-pro/image-to-image",
        features: ["professional", "highQuality"],
        descriptionKey: "flux-2-pro",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
    },
    defaultSettings: {
      model: "nano-banana-pro",
      aspectRatio: "1:1",
      variations: 1,
    },
    renderFormFields: ({ settings, onChange, aspectRatioOptions, canReset, onReset }) => (
      <>
        <div className="shrink-0">
          <AspectRatioField
            value={settings.aspectRatio}
            options={aspectRatioOptions}
            onChange={(aspectRatio) => onChange({ ...settings, aspectRatio })}
            canReset={canReset}
            onReset={onReset}
          />
        </div>
        <div>
          <VariationsField
            value={settings.variations}
            onChange={(variations) => onChange({ ...settings, variations })}
          />
        </div>
        <div>
          <VisibilityField
            value={settings.visibility}
            onChange={(visibility) => onChange({ ...settings, visibility })}
          />
        </div>
      </>
    ),
  },
  "remove-watermark": {
    id: "remove-watermark",
    icon: Wand2,
    labelKey: "removeWatermark",
    descKey: "removeWatermarkDesc",
    apiRoute: "wavespeed/image-watermark-remover",
    displayFields: ["model", "variations"],
    models: {
      "remove-watermark": {
        name: "Remove Watermark",
        icon: AliIcon,
        apiRoute: "wavespeed/image-watermark-remover",
        features: ["fast", "simple"],
        descriptionKey: "remove-watermark",
        aspectRatioOptions: DEFAULT_ASPECT_RATIO_OPTIONS,
      },
    },
    defaultSettings: {
      model: "remove-watermark",
      aspectRatio: "1:1",
      variations: 1,
      format: "jpeg",
    },
    renderFormFields: ({ settings, onChange }) => (
      <>
        <div>
          <SelectField
            title="图片格式"
            value={settings.format || "jpeg"}
            options={[
              { value: "jpeg", label: "JPEG" },
              { value: "png", label: "PNG" },
              { value: "webp", label: "WEBP" },
            ]}
            onChange={(format) => onChange({ ...settings, format })}
          />
        </div>
      </>
    ),
  },
};

// 导出模式选项数组（用于 UI 渲染）
export const MODE_OPTIONS = Object.values(MODE_CONFIGS);

// 从 MODE_CONFIGS 中提取所有模型，生成统一的 MODELS 数组
export const MODELS: ModelOption[] = (() => {
  const modelMap = new Map<string, ModelOption>();

  Object.values(MODE_CONFIGS).forEach((modeConfig) => {
    if (modeConfig.models) {
      Object.entries(modeConfig.models).forEach(([id, modelInfo]) => {
        if (!modelMap.has(id)) {
          modelMap.set(id, {
            id,
            name: modelInfo.name,
            icon: modelInfo.icon,
            features: modelInfo.features,
            descriptionKey: modelInfo.descriptionKey,
            aspectRatioOptions: modelInfo.aspectRatioOptions,
          });
        }
      });
    }
  });

  return Array.from(modelMap.values());
})();

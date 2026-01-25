import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // ✅ base：只放“行为类”禁用（不放 opacity），并兼容 aria-disabled（asChild 时很重要）
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all " +
  "disabled:pointer-events-none disabled:cursor-not-allowed " +
  "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // ✅ 每个 variant 单独控制 disabled 的“视觉样式”
        default:
          "bg-background-button text-background-1 hover:bg-background-button/90 tracking-wide " +
          "disabled:bg-background-button/80 disabled:text-background disabled:hover:bg-background-button/80 " +
          "aria-disabled:bg-muted aria-disabled:text-muted-foreground aria-disabled:hover:bg-muted cursor-pointer",

        payment: "bg-white text-base text-neutral-900 hover:bg-white/90 tracking-wide cursor-pointer",

        destructive:
          "bg-destructive text-white hover:bg-destructive/90 " +
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 " +
          "disabled:bg-destructive/30 disabled:text-white/60 disabled:hover:bg-destructive/30 " +
          "aria-disabled:bg-destructive/30 aria-disabled:text-white/60 aria-disabled:hover:bg-destructive/30",

        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground " +
          "dark:bg-input/30 dark:border-input dark:hover:bg-input/50 " +
          "disabled:bg-transparent disabled:text-muted-foreground disabled:border-muted disabled:hover:bg-transparent disabled:hover:text-muted-foreground " +
          "aria-disabled:bg-transparent aria-disabled:text-muted-foreground aria-disabled:border-muted aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground",

        secondary:
          "bg-muted/20 text-secondary-foreground hover:bg-muted/30 " +
          "disabled:bg-muted/10 disabled:text-muted-foreground disabled:hover:bg-muted/10 " +
          "aria-disabled:bg-muted/10 aria-disabled:text-muted-foreground aria-disabled:hover:bg-muted/10",

        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 " +
          "disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground " +
          "aria-disabled:text-muted-foreground aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground",

        link:
          "text-primary underline-offset-4 hover:underline " +
          "disabled:text-muted-foreground disabled:no-underline " +
          "aria-disabled:text-muted-foreground aria-disabled:no-underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        payment: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // 若 asChild 且你传 aria-disabled，会走 aria-disabled:* 的禁用样式
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

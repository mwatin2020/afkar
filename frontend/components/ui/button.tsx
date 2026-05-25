"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
  {
  variants: {
    variant: {
      default: "bg-[linear-gradient(135deg,var(--primary),#5b7cff)] text-white shadow-[0_18px_36px_rgba(91,124,255,0.2)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(124,58,237,0.32)]",
      outline: "border border-white/10 bg-white/[0.04] text-white hover:border-white/15 hover:bg-white/[0.08]",
      ghost: "text-[var(--muted-foreground)] hover:bg-white/[0.06] hover:text-white",
      secondary: "bg-[linear-gradient(135deg,var(--secondary),#34d399)] text-slate-950 shadow-[0_18px_36px_rgba(16,185,129,0.18)] hover:-translate-y-0.5",
      destructive: "bg-[linear-gradient(135deg,var(--danger),#fb7185)] text-white shadow-[0_18px_36px_rgba(244,63,94,0.18)] hover:-translate-y-0.5",
    },
    size: {
      default: "h-11 px-5",
      sm: "h-9 px-3.5 text-xs",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

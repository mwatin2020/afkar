"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
  {
  variants: {
    variant: {
      default: "bg-[var(--primary)] text-white shadow-[0_8px_20px_rgba(79,124,255,0.18)] hover:bg-[var(--primary-hover)]",
      outline: "border border-white/10 bg-white/[0.03] text-white hover:border-white/15 hover:bg-white/[0.06]",
      ghost: "text-[var(--muted-foreground)] hover:bg-white/[0.06] hover:text-white",
      secondary: "bg-[var(--secondary)] text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.16)] hover:brightness-105",
      destructive: "bg-[var(--danger)] text-white shadow-[0_8px_20px_rgba(244,63,94,0.16)] hover:brightness-105",
    },
    size: {
      default: "h-10 px-4",
      sm: "h-9 px-3.5 text-sm",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

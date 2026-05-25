"use client";

import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const { t, dir } = useLanguage();

  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-2">
        <div className={cn("text-[12px] font-medium text-[var(--muted-foreground)]", dir === "ltr" ? "uppercase tracking-[0.18em]" : "tracking-normal")}>{eyebrow ?? t.common.workspace}</div>
        <div className="text-[30px] font-semibold leading-[1.25] text-white md:text-[34px]">{title}</div>
        {description ? <div className="muted-readable max-w-2xl text-base leading-8">{description}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

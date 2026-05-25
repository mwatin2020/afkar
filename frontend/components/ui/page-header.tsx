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
  const { t } = useLanguage();

  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--muted-foreground)]">{eyebrow ?? t.common.workspace}</div>
        <div className="text-3xl font-semibold tracking-tight text-white">{title}</div>
        {description ? <div className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">{description}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

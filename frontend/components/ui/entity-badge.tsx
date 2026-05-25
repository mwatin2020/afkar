"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  ACTIVE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  PAUSED: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  ARCHIVED: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  TODO: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  IN_PROGRESS: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  BLOCKED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  DONE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  LOW: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  MEDIUM: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  HIGH: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  CRITICAL: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  RAW: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  SANDBOX: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  UNDER_REVIEW: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  APPROVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  FROZEN: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  DELETED: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  PRODUCT: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  TECHNICAL: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  PHILOSOPHY: "border-indigo-400/20 bg-indigo-400/10 text-indigo-200",
  BUSINESS: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  PATENT: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  PERSONAL: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
  OTHER: "border-slate-400/20 bg-slate-400/10 text-slate-200",
  SECRET: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  STRONG: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  READY: "border-teal-400/20 bg-teal-400/10 text-teal-200",
};

export function EntityBadge({ value, className }: { value: string; className?: string }) {
  const { t } = useLanguage();
  const labels: Record<string, string> = {
    ACTIVE: t.projects.active,
    PAUSED: t.projects.paused,
    ARCHIVED: t.projects.archived,
    TODO: t.tasks.todo,
    IN_PROGRESS: t.tasks.inProgress,
    BLOCKED: t.tasks.blocked,
    DONE: t.tasks.done,
    LOW: t.tasks.low,
    MEDIUM: t.tasks.medium,
    HIGH: t.tasks.high,
    CRITICAL: t.tasks.critical,
    RAW: t.ideas.raw,
    SANDBOX: t.ideas.sandbox,
    UNDER_REVIEW: t.ideas.underReview,
    APPROVED: t.ideas.approved,
    FROZEN: t.ideas.frozen,
    DELETED: t.ideas.deleted,
    PRODUCT: t.ideas.product,
    TECHNICAL: t.ideas.technical,
    PHILOSOPHY: t.ideas.philosophy,
    BUSINESS: t.ideas.business,
    PATENT: t.ideas.patent,
    PERSONAL: t.ideas.personal,
    OTHER: t.ideas.other,
    SECRET: t.ideas.secret,
    STRONG: t.ideas.strong,
    READY: t.ideas.ready,
    EARLY: t.ideas.early,
  };

  return (
    <Badge className={cn("border font-medium tracking-wide", tones[value] ?? "border-white/10 bg-white/5 text-white", className)}>
      {labels[value] ?? value.replaceAll("_", " ")}
    </Badge>
  );
}

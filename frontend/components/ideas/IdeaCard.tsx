"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Idea } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusStyles(status: string) {
  if (status === "RAW") return "bg-[#FAC775] text-[#633806]";
  if (status === "APPROVED") return "bg-[#C0DD97] text-[#3B6D11]";
  return "bg-white/10 text-white/80";
}

function statusLabel(status: string) {
  if (status === "RAW") return "خام";
  if (status === "APPROVED") return "مكتملة";
  if (status === "DELETED") return "محذوفة";
  return status.replaceAll("_", " ");
}

function tagLabels(idea: Idea) {
  return [idea.maturity, idea.confidentiality, idea.category]
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value.replaceAll("_", " "));
}

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex min-h-[182px] flex-col rounded-xl border border-white/10 bg-[#171717] transition-all hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles(idea.status)}`}>{statusLabel(idea.status)}</div>
        <div dir="rtl" className="min-w-0 flex-1 text-right text-[15px] font-medium text-white">
          {idea.title}
        </div>
      </div>
      <div dir="rtl" className="flex-1 px-4 pb-4 text-right text-sm leading-7 text-zinc-400">
        <p className="line-clamp-2">{idea.summary}</p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-zinc-500">
        <div className="flex flex-wrap justify-end gap-2">
          {tagLabels(idea).map((tag) => (
            <Badge key={tag} className="border-white/10 bg-white/[0.03] text-zinc-300">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{formatDate(idea.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { EntityBadge } from "@/components/ui/entity-badge";
import type { Idea } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function labels(idea: Idea) {
  return [idea.maturity, idea.confidentiality, idea.category].map((value) => value.replaceAll("_", " "));
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#555]">{label}</div>
      {children}
    </div>
  );
}

export function IdeaMetaSidebar({ idea }: { idea: Idea }) {
  return (
    <aside
      dir="rtl"
      className="w-[200px] shrink-0 border-l border-[#222] px-4 py-6 min-h-[calc(100vh-60px)] flex flex-col gap-[18px]"
    >
      <MetaItem label="الحالة">
        <div className="text-[13px] text-[#aaa]">
          <EntityBadge value={idea.status} />
        </div>
      </MetaItem>

      <MetaItem label="التصنيفات">
        <div className="flex flex-wrap justify-end gap-2">
          {labels(idea).map((label) => (
            <Badge key={label} className="border-white/10 bg-white/[0.04] text-[#aaa]">
              {label}
            </Badge>
          ))}
        </div>
      </MetaItem>

      <MetaItem label="المشروع">
        <div className="text-[13px] text-[#aaa]">{idea.project_name || "—"}</div>
      </MetaItem>

      <MetaItem label="السياق">
        <div className="text-[13px] leading-7 text-[#aaa]">{idea.decision_note || "لا يوجد سياق"}</div>
      </MetaItem>

      <MetaItem label="تاريخ الإنشاء">
        <div className="text-[13px] text-[#aaa]">{formatDate(idea.created_at)}</div>
      </MetaItem>
    </aside>
  );
}

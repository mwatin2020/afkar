"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";

import type { Idea } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const preview = idea.summary?.trim() || idea.content;

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="block rounded-[18px] border border-white/7 bg-white/[0.025] px-4 py-4 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
    >
      <div dir="rtl" className="space-y-3 text-right">
        <h2 className="line-clamp-2 text-[15px] font-semibold leading-7 text-white">{idea.title}</h2>
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{preview}</p>
        <div className="flex items-center justify-end gap-1.5 text-xs text-zinc-500">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{formatDate(idea.updated_at || idea.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

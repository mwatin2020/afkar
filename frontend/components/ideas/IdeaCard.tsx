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
      className="flex min-h-[208px] flex-col rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.025))] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20"
    >
      <div dir="rtl" className="text-right">
        <h2 className="line-clamp-2 text-base font-semibold text-white">{idea.title}</h2>
      </div>

      <div dir="rtl" className="mt-3 flex-1 text-right text-sm leading-7 text-zinc-300">
        <p className="line-clamp-5 whitespace-pre-wrap">{preview}</p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-white/10 pt-3 text-xs text-zinc-500">
        <Clock3 className="h-3.5 w-3.5" />
        <span>{formatDate(idea.updated_at || idea.created_at)}</span>
      </div>
    </Link>
  );
}

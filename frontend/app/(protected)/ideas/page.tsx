"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/types";

type SortKey = "newest" | "oldest";

const IDEA_DEFAULTS = {
  category: "OTHER",
  confidentiality: "MEDIUM",
  maturity: "EARLY",
  status: "RAW",
  project_id: null,
  decision_note: null,
  tag_ids: [] as number[],
};

function buildSummary(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 180);
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  async function loadIdeas(currentSearch: string) {
    const params = new URLSearchParams();
    if (currentSearch.trim()) params.set("search", currentSearch.trim());

    const data = await api<Idea[]>(`/ideas${params.toString() ? `?${params.toString()}` : ""}`);
    setIdeas(data.filter((idea) => idea.status !== "DELETED"));
  }

  useEffect(() => {
    setLoading(true);
    loadIdeas(search)
      .then(() => setError(null))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load ideas."))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    if (!sortMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [sortMenuOpen]);

  const visibleIdeas = useMemo(() => {
    const list = [...ideas];
    list.sort((a, b) =>
      sort === "newest"
        ? new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        : new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime(),
    );
    return list;
  }, [ideas, sort]);

  async function createIdea() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("اسم الفكرة ومحتوى الفكرة مطلوبان.");
      return;
    }

    setSubmitting(true);
    try {
      await api("/ideas", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          summary: buildSummary(form.content),
          content: form.content.trim(),
          ...IDEA_DEFAULTS,
        }),
      });

      setForm({ title: "", content: "" });
      setShowCreate(false);
      toast.success("تم إنشاء الفكرة.");
      await loadIdeas(search);
      setError(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء الفكرة.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir="rtl" className="space-y-5">
      <section className="space-y-1 text-right">
        <h1 className="text-[30px] font-semibold leading-[1.25] text-white md:text-[34px]">الأفكار</h1>
        <p className="muted-readable max-w-2xl text-[16px] leading-8">احفظ الفكرة بسرعة ثم ارجع إليها لاحقًا.</p>
      </section>

      <section className="space-y-3">
        <div>
          <Input
            dir="rtl"
            className="h-11 w-full rounded-xl border-white/8 bg-white/[0.03] text-right"
            placeholder="ابحث في الأفكار"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div ref={sortMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setSortMenuOpen((value) => !value)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white transition-colors hover:border-white/15 hover:bg-white/[0.06]"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sortMenuOpen ? "rotate-180" : "")} />
              <span>{sort === "newest" ? "الأحدث" : "الأقدم"}</span>
            </button>

            {sortMenuOpen ? (
              <div className="absolute right-0 top-11 z-20 min-w-28 rounded-2xl border border-white/10 bg-[#10151d] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <button
                  type="button"
                  className={cn("block w-full rounded-xl px-3 py-2 text-right text-sm transition-colors", sort === "newest" ? "bg-white/[0.08] text-white" : "text-zinc-300 hover:bg-white/[0.05] hover:text-white")}
                  onClick={() => {
                    setSort("newest");
                    setSortMenuOpen(false);
                  }}
                >
                  الأحدث
                </button>
                <button
                  type="button"
                  className={cn("block w-full rounded-xl px-3 py-2 text-right text-sm transition-colors", sort === "oldest" ? "bg-white/[0.08] text-white" : "text-zinc-300 hover:bg-white/[0.05] hover:text-white")}
                  onClick={() => {
                    setSort("oldest");
                    setSortMenuOpen(false);
                  }}
                >
                  الأقدم
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-white/10 bg-white/[0.03]"
              onClick={() => setShowCreate(true)}
              aria-label="إضافة فكرة"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {showCreate ? (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-white/10 bg-white/[0.03]"
                onClick={() => setShowCreate(false)}
                aria-label="إخفاء نموذج الفكرة"
              >
                <Minus className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="meta-text text-right">{visibleIdeas.length} فكرة</div>
      </section>

      {showCreate ? (
        <section className="rounded-[18px] border border-white/8 bg-white/[0.025] p-4">
          <div className="space-y-4">
            <div className="text-right">
              <h2 className="text-[20px] font-semibold leading-8 text-white">فكرة جديدة</h2>
            </div>
            <div>
              <label className="field-label">اسم الفكرة</label>
              <Input dir="rtl" className="h-11 rounded-xl text-right" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="field-label">محتوى الفكرة</label>
              <Textarea dir="rtl" className="min-h-32 rounded-[18px] text-right" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="flex justify-start">
              <Button size="sm" className="rounded-full px-4" onClick={createIdea} disabled={submitting}>
                {submitting ? "جاري الإنشاء..." : "إضافة"}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {loading ? <div className="meta-text text-right">جاري التحميل...</div> : null}
      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-right text-base leading-8 text-rose-100">{error}</div> : null}
      {!loading && !error && visibleIdeas.length === 0 ? (
        <EmptyState title="لا توجد أفكار" description="أضف فكرة جديدة لتظهر هنا." icon={<Plus className="h-5 w-5" />} />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </section>
    </div>
  );
}

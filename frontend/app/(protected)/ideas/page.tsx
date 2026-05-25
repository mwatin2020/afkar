"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
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
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

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
        <h1 className="text-[26px] font-semibold tracking-tight text-white">الأفكار</h1>
        <p className="text-sm leading-7 text-[var(--muted-foreground)]">احفظ الفكرة بسرعة ثم ارجع إليها لاحقًا.</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant={showCreate ? "outline" : "default"}
            size="sm"
            className="shrink-0 rounded-full px-3"
            onClick={() => setShowCreate((value) => !value)}
          >
            {showCreate ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span className="sm:hidden">{showCreate ? "إغلاق" : "+ فكرة"}</span>
            <span className="hidden sm:inline">{showCreate ? "إغلاق" : "فكرة جديدة"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full px-3"
            onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}
          >
            {sort === "newest" ? <ArrowDownAZ className="h-3.5 w-3.5" /> : <ArrowUpAZ className="h-3.5 w-3.5" />}
            {sort === "newest" ? "الأحدث" : "الأقدم"}
          </Button>

          <div className="min-w-0 flex-1">
            <Input
              dir="rtl"
              className="h-10 rounded-xl border-white/8 bg-white/[0.03] text-right"
              placeholder="ابحث في الأفكار"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right text-sm text-zinc-500">{visibleIdeas.length} فكرة</div>
      </section>

      {showCreate ? (
        <section className="rounded-[18px] border border-white/8 bg-white/[0.025] p-4">
          <div className="space-y-4">
            <div className="text-right">
              <h2 className="text-sm font-semibold text-white">فكرة جديدة</h2>
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

      {loading ? <div className="text-right text-sm text-zinc-500">جاري التحميل...</div> : null}
      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-right text-sm text-rose-100">{error}</div> : null}
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

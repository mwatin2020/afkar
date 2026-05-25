"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
    <div dir="rtl" className="space-y-6">
      <PageHeader title="الأفكار" description="مساحة سريعة ومباشرة لحفظ الأفكار والرجوع إليها من الهاتف بسهولة." />

      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              dir="rtl"
              className="flex-1 text-right"
              placeholder="ابحث في الأفكار"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" className="min-w-24" onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}>
                {sort === "newest" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
                {sort === "newest" ? "الأحدث" : "الأقدم"}
              </Button>
              <Button className="min-w-28" onClick={() => setShowCreate((value) => !value)}>
                {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                فكرة جديدة
              </Button>
            </div>
          </div>
          <div className="text-sm text-zinc-400">{visibleIdeas.length} فكرة</div>
        </CardHeader>

        <CardContent className="space-y-5">
          {showCreate ? (
            <Card className="border-white/10 bg-[#11161d]">
              <CardHeader>
                <CardTitle>فكرة جديدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="field-label">اسم الفكرة</label>
                  <Input dir="rtl" className="text-right" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">محتوى الفكرة</label>
                  <Textarea
                    dir="rtl"
                    className="min-h-36 text-right"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
                <Button onClick={createIdea} disabled={submitting}>
                  {submitting ? "جاري الإنشاء..." : "إضافة الفكرة"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {loading ? <div className="text-sm text-zinc-500">جاري التحميل...</div> : null}
          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
          {!loading && !error && visibleIdeas.length === 0 ? (
            <EmptyState title="لا توجد أفكار" description="أضف فكرة جديدة لتظهر هنا." icon={<Plus className="h-5 w-5" />} />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

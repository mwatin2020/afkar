"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Idea, Project } from "@/lib/types";

type FilterKey = "all" | "raw" | "early" | "deleted";
type SortKey = "newest" | "oldest";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "PRODUCT",
    confidentiality: "MEDIUM",
    maturity: "EARLY",
    status: "RAW",
    project_id: "",
  });

  useEffect(() => {
    api<Project[]>("/projects").then(setProjects);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (activeFilter === "deleted") params.set("status", "DELETED");

    api<Idea[]>(`/ideas${params.toString() ? `?${params.toString()}` : ""}`)
      .then((data) => {
        setIdeas(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load ideas."))
      .finally(() => setLoading(false));
  }, [search, activeFilter]);

  const counts = useMemo(
    () => ({
      all: ideas.filter((idea) => idea.status !== "DELETED").length,
      raw: ideas.filter((idea) => idea.status === "RAW").length,
      early: ideas.filter((idea) => idea.maturity === "EARLY" && idea.status !== "DELETED").length,
      deleted: ideas.filter((idea) => idea.status === "DELETED").length,
    }),
    [ideas],
  );

  const visibleIdeas = useMemo(() => {
    let list = [...ideas];

    if (activeFilter === "all") list = list.filter((idea) => idea.status !== "DELETED");
    if (activeFilter === "raw") list = list.filter((idea) => idea.status === "RAW");
    if (activeFilter === "early") list = list.filter((idea) => idea.maturity === "EARLY" && idea.status !== "DELETED");
    if (activeFilter === "deleted") list = list.filter((idea) => idea.status === "DELETED");

    list.sort((a, b) =>
      sort === "newest"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    return list;
  }, [activeFilter, ideas, sort]);

  async function createIdea() {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error("العنوان والملخص والمحتوى مطلوبة.");
      return;
    }

    setSubmitting(true);
    try {
      await api("/ideas", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          category: form.category,
          confidentiality: form.confidentiality,
          maturity: form.maturity,
          status: form.status,
          decision_note: null,
          project_id: form.project_id ? Number(form.project_id) : null,
          tag_ids: [],
        }),
      });
      setForm({
        title: "",
        summary: "",
        content: "",
        category: "PRODUCT",
        confidentiality: "MEDIUM",
        maturity: "EARLY",
        status: "RAW",
        project_id: "",
      });
      setShowCreate(false);
      toast.success("تم إنشاء الفكرة.");
      const refresh = await api<Idea[]>("/ideas");
      setIdeas(refresh);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنشاء الفكرة.");
    } finally {
      setSubmitting(false);
    }
  }

  const tabs: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: "الكل", count: counts.all },
    { key: "raw", label: "خام", count: counts.raw },
    { key: "early", label: "مبكرة", count: counts.early },
    { key: "deleted", label: "محذوفة", count: counts.deleted },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <PageHeader title="الأفكار" description="مساحة بسيطة وواضحة لتصفح الأفكار الخاصة دون تشويش بصري." />

      <Card className="overflow-visible border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-5 p-0 pe-4 md:pe-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex flex-1 items-center gap-3">
              <div className="w-full flex-1">
                <Input dir="rtl" className="w-full text-right" placeholder="ابحث في العنوان أو الملخص..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 text-sm text-white"
                  onClick={() => setSortMenuOpen((value) => !value)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sort === "newest" ? "الأحدث" : "الأقدم"}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {sortMenuOpen ? (
                  <div className="absolute left-0 top-12 z-20 w-36 rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-right text-sm text-white hover:bg-white/5"
                      onClick={() => {
                        setSort("newest");
                        setSortMenuOpen(false);
                      }}
                    >
                      الأحدث
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-right text-sm text-white hover:bg-white/5"
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
            </div>

            <div className="flex items-center gap-3">
              <Button className="bg-[#7F77DD] text-white hover:bg-[#8b83e2]" onClick={() => setShowCreate((value) => !value)}>
                {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                فكرة جديدة
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-zinc-500">{counts.all} أفكار في المستودع المحلي</div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    activeFilter === tab.key ? "bg-white text-black" : "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 !pe-8 ps-0 pb-10 pt-0 md:!pe-10">
          {showCreate ? (
            <Card className="border-white/10 bg-[#141414]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>فكرة جديدة</CardTitle>
                  <div className="mt-1 text-sm text-zinc-400">أضف الفكرة بسرعة ثم افتحها لاحقاً من العرض المفصل.</div>
                </div>
                <Sparkles className="h-5 w-5 text-violet-300" />
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="field-label">العنوان</label>
                  <Input dir="rtl" className="text-right" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">الملخص</label>
                  <Input dir="rtl" className="text-right" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">المحتوى</label>
                  <Textarea dir="rtl" className="text-right" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">التصنيف</label>
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="PRODUCT">منتج</option>
                    <option value="TECHNICAL">تقنية</option>
                    <option value="PHILOSOPHY">فلسفة</option>
                    <option value="BUSINESS">أعمال</option>
                    <option value="PATENT">براءة</option>
                    <option value="PERSONAL">شخصية</option>
                    <option value="OTHER">أخرى</option>
                  </Select>
                </div>
                <div>
                  <label className="field-label">المشروع</label>
                  <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                    <option value="">بدون مشروع</option>
                    {projects.map((project) => (
                      <option key={project.id} value={String(project.id)}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={createIdea} disabled={submitting}>
                    {submitting ? "جاري الإنشاء..." : "إضافة الفكرة"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {loading ? <div className="text-sm text-zinc-500">جاري التحميل...</div> : null}
          {error ? <div className="rounded-xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
          {!loading && !error && visibleIdeas.length === 0 ? (
            <EmptyState title="لا توجد أفكار" description="ابدأ بإضافة فكرة جديدة أو غيّر الفلتر الحالي." icon={<Plus className="h-5 w-5" />} />
          ) : null}

          <div dir="rtl" className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] justify-start gap-3 pr-6">
            {visibleIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

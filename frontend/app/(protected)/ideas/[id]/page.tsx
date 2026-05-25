"use client";

import { Fragment, type ReactNode, useEffect, useMemo, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { IdeaMetaSidebar } from "@/components/ideas/IdeaMetaSidebar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { EntityBadge } from "@/components/ui/entity-badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Idea, Project } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[#f0f0f0]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let ordered: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-[15px] leading-[2] text-[#c8c8c8]">
          {renderInlineMarkdown(text)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushOrdered = () => {
    if (!ordered.length) return;
    blocks.push(
      <ol key={`ol-${blocks.length}`} className="list-inside list-decimal space-y-[10px] text-[15px] leading-[2] text-[#c8c8c8]">
        {ordered.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>,
    );
    ordered = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const listMatch = line.match(/^\d+\.\s+(.*)$/);

    if (!line) {
      flushParagraph();
      flushOrdered();
      continue;
    }

    if (listMatch) {
      flushParagraph();
      ordered.push(listMatch[1]);
      continue;
    }

    flushOrdered();
    paragraph.push(line);
  }

  flushParagraph();
  flushOrdered();

  return blocks;
}

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
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
    if (!params?.id) return;
    api<Idea>(`/ideas/${params.id}`)
      .then((data) => {
        setIdea(data);
        setForm({
          title: data.title,
          summary: data.summary,
          content: data.content,
          category: data.category,
          confidentiality: data.confidentiality,
          maturity: data.maturity,
          status: data.status,
          project_id: data.project_id ? String(data.project_id) : "",
        });
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load idea."))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const lastModified = useMemo(() => (idea ? formatDate(idea.updated_at) : ""), [idea]);

  async function handleCopy() {
    if (!idea) return;
    try {
      await navigator.clipboard.writeText(`${idea.title}\n\n${idea.content}`);
      toast.success("تم نسخ الفكرة.");
    } catch {
      toast.error("فشل نسخ الفكرة.");
    }
  }

  async function handleSave() {
    if (!idea) return;
    setSaving(true);
    try {
      const updated = await api<Idea>(`/ideas/${idea.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          category: form.category,
          confidentiality: form.confidentiality,
          maturity: form.maturity,
          status: form.status,
          project_id: form.project_id ? Number(form.project_id) : null,
          tag_ids: idea.tags.map((tag) => tag.id),
        }),
      });
      setIdea(updated);
      setEditing(false);
      toast.success("تم حفظ التغييرات.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل حفظ التغييرات.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!idea) return;
    setDeleting(true);
    try {
      await api<Idea>(`/ideas/${idea.id}/soft-delete`, { method: "PATCH" });
      toast.success("تم نقل الفكرة إلى سلة المحذوفات.");
      router.push("/ideas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل حذف الفكرة.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) return <div dir="rtl" className="text-sm text-zinc-500">جاري التحميل...</div>;
  if (error || !idea) return <div dir="rtl" className="rounded-xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error || "تعذر العثور على الفكرة."}</div>;

  return (
    <div dir="rtl" className="space-y-6">
      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="حذف الفكرة؟"
        description="سيتم نقل الفكرة إلى سلة المحذوفات. يمكنك استعادتها لاحقًا."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/ideas" className="text-sm text-zinc-400 transition-colors hover:text-white">
            ← الأفكار
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            نسخ
          </Button>
          <Button variant="outline" onClick={() => setEditing((value) => !value)}>
            <Pencil className="h-4 w-4" />
            تحرير
          </Button>
          <Button variant="outline" className="mr-2 border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <EntityBadge value={idea.status} />
        <span>آخر تعديل: {lastModified}</span>
      </div>

      <div className="flex flex-col xl:flex-row-reverse">
        <IdeaMetaSidebar idea={idea} />

        <main className="min-w-0 flex-1 px-0 py-6 md:px-4 xl:px-10 xl:py-8">
          {editing ? (
            <div className="space-y-5">
              <Input dir="rtl" className="text-right" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input dir="rtl" className="text-right" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              <Textarea dir="rtl" className="min-h-[420px] text-right" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="PRODUCT">منتج</option>
                  <option value="TECHNICAL">تقنية</option>
                  <option value="PHILOSOPHY">فلسفة</option>
                  <option value="BUSINESS">أعمال</option>
                  <option value="PATENT">براءة</option>
                  <option value="PERSONAL">شخصية</option>
                  <option value="OTHER">أخرى</option>
                </Select>
                <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                  <option value="">بدون مشروع</option>
                  {projects.map((project) => (
                    <option key={project.id} value={String(project.id)}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={form.confidentiality} onChange={(e) => setForm({ ...form, confidentiality: e.target.value })}>
                  <option value="LOW">منخفض</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HIGH">عال</option>
                  <option value="SECRET">سري</option>
                </Select>
                <Select value={form.maturity} onChange={(e) => setForm({ ...form, maturity: e.target.value })}>
                  <option value="RAW">خام</option>
                  <option value="EARLY">مبكرة</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="STRONG">قوية</option>
                  <option value="READY">جاهزة</option>
                </Select>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="RAW">خام</option>
                  <option value="SANDBOX">مختبر</option>
                  <option value="UNDER_REVIEW">تحت المراجعة</option>
                  <option value="APPROVED">معتمدة</option>
                  <option value="FROZEN">مجمّدة</option>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mb-7 text-right text-[28px] font-semibold text-[#f0f0f0]">{idea.title}</h1>
              <div dir="rtl" className="space-y-4 text-right">
                {renderMarkdown(idea.content)}
                <div className="border-r-2 border-[#333] pe-4 text-right text-[14px] leading-7 text-[#888]">
                  {idea.summary}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Idea } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildSummary(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 180);
}

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!params?.id) return;

    setLoading(true);
    api<Idea>(`/ideas/${params.id}`)
      .then((data) => {
        setIdea(data);
        setForm({
          title: data.title,
          content: data.content,
        });
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load idea."))
      .finally(() => setLoading(false));
  }, [params?.id]);

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
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("اسم الفكرة ومحتوى الفكرة مطلوبان.");
      return;
    }

    setSaving(true);
    try {
      const updated = await api<Idea>(`/ideas/${idea.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title.trim(),
          summary: buildSummary(form.content),
          content: form.content.trim(),
          category: idea.category,
          confidentiality: idea.confidentiality,
          maturity: idea.maturity,
          status: idea.status,
          project_id: idea.project_id,
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
      toast.success("تم حذف الفكرة.");
      router.push("/ideas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل حذف الفكرة.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) return <div dir="rtl" className="meta-text">جاري التحميل...</div>;
  if (error || !idea) return <div dir="rtl" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-base leading-8 text-rose-100">{error || "تعذر العثور على الفكرة."}</div>;

  return (
    <div dir="rtl" className="space-y-6">
      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="حذف الفكرة؟"
        description="سيتم نقل الفكرة إلى سلة المحذوفات."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/ideas" className="meta-text transition-colors hover:text-white">
          العودة إلى الأفكار
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            نسخ
          </Button>
          <Button variant="outline" onClick={() => setEditing((value) => !value)}>
            <Pencil className="h-4 w-4" />
            {editing ? "إغلاق" : "تحرير"}
          </Button>
          <Button variant="outline" className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 md:p-6">
        {editing ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <div>
              <label className="field-label">اسم الفكرة</label>
              <Input dir="rtl" className="text-right" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="field-label">محتوى الفكرة</label>
              <Textarea
                dir="rtl"
                className="min-h-[320px] text-right"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-2 text-right">
              <h1 className="text-[30px] font-semibold leading-[1.35] text-white md:text-[34px]">{idea.title}</h1>
              <div className="meta-text">التاريخ: {formatDate(idea.updated_at || idea.created_at)}</div>
            </div>
            <div className="prose-note whitespace-pre-wrap text-right">{idea.content}</div>
          </div>
        )}
      </section>
    </div>
  );
}

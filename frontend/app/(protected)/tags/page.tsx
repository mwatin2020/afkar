"use client";

import { useEffect, useState } from "react";
import { Tag as TagIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { Tag } from "@/lib/types";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#7c3aed" });
  const { t } = useLanguage();

  const load = () => api<Tag[]>("/tags").then(setTags);
  useEffect(() => void load(), []);

  async function createTag() {
    if (!form.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }
    await api("/tags", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", color: "#7c3aed" });
    toast.success(t.tags.created);
    load();
  }

  async function deleteTag() {
    if (!selectedTag) return;

    setDeleting(true);
    try {
      await api(`/tags/${selectedTag.id}`, { method: "DELETE" });
      setTags((current) => current.filter((tag) => tag.id !== selectedTag.id));
      setSelectedTag(null);
      toast.success("تم حذف الوسم.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حذف الوسم.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="حذف الوسم؟"
        description={selectedTag ? `سيتم حذف الوسم "${selectedTag.name}" نهائيًا.` : "سيتم حذف هذا الوسم نهائيًا."}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteTag}
      />
      <PageHeader title={t.nav.tags} description="Create lightweight labels for faster browsing and private organization inside the vault." />
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.tags.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="field-label">{t.tags.tagName}</label>
              <Input placeholder={t.tags.tagName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Color</label>
              <Input type="color" className="h-12 w-full rounded-2xl p-2" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <Button className="w-full" onClick={createTag}>
              {t.common.create}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tags.length} tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <EmptyState title="No tags yet" description="Create your first tag to start grouping tasks and ideas." icon={<TagIcon className="h-5 w-5" />} />
            ) : (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.02] px-2 py-2">
                    <Badge className="px-3 py-1 text-sm" style={{ borderColor: tag.color ?? "#273244", color: tag.color ?? "#f9fafb" }}>
                      {tag.name}
                    </Badge>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/20 text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                      onClick={() => {
                        setSelectedTag(tag);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

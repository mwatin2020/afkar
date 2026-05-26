"use client";

import { useEffect, useState } from "react";
import { Brain, CheckCircle2, Circle, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/i18n/language-provider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type MemoryItem = {
  id: number;
  content: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export default function MemoryPage() {
  const { t, dir } = useLanguage();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Track items in process of fading out
  const [fadingIds, setFadingIds] = useState<Record<number, boolean>>({});

  async function loadMemories() {
    try {
      const data = await api<MemoryItem[]>("/memories");
      setMemories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      const created = await api<MemoryItem>("/memories", {
        method: "POST",
        body: JSON.stringify({ content: newContent.trim() }),
      });
      setMemories((prev) => [created, ...prev]);
      setNewContent("");
      toast.success(dir === "rtl" ? "تم إضافة الملاحظة للذاكرة!" : "Saved to memory!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save memory.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleCheck(id: number) {
    // Add to fading list first to trigger animation
    setFadingIds((prev) => ({ ...prev, [id]: true }));

    try {
      await api<MemoryItem>(`/memories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: true }),
      });

      // Wait for fadeout animation (600ms) before removing from local list
      setTimeout(() => {
        setMemories((prev) => prev.filter((m) => m.id !== id));
        setFadingIds((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        toast.success(dir === "rtl" ? "رائع، تم الإنجاز!" : "Awesome, completed!");
      }, 600000 / 1000); // 600ms
    } catch (err) {
      // Revert fading if error
      setFadingIds((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      toast.error(err instanceof Error ? err.message : "Failed to complete memory task.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await api(`/memories/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success(dir === "rtl" ? "تم الحذف بنجاح." : "Deleted successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  const isRtl = dir === "rtl";

  return (
    <div dir={dir} className="mx-auto max-w-2xl space-y-6">
      {/* Header section with Premium design */}
      <section className={cn("space-y-2", isRtl ? "text-right" : "text-left")}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 text-sky-400 border border-sky-500/10 shadow-lg">
          <Brain className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {isRtl ? "مفكرة الذاكرة السريعة" : "Memory Vault"}
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed max-w-xl">
          {isRtl
            ? "اكتب هنا المهام السريعة التي تخطر ببالك فجأة لتتذكرها لاحقاً. بمجرد إنجازها، اضغط عليها لتختفي إلى الأبد."
            : "Jot down sudden thoughts or tasks that cross your mind. Once completed, check them off to watch them disappear forever."}
        </p>
      </section>

      {/* Aesthetic quick-add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            className={cn(
              "h-12 w-full rounded-2xl border-white/8 bg-white/[0.03] px-4 text-white placeholder-zinc-500 focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10 transition-all",
              isRtl ? "text-right" : "text-left"
            )}
            placeholder={isRtl ? "مثال: شراء الحليب، سداد الفاتورة..." : "Type something to remember..."}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={submitting}
          />
        </div>
        <Button
          type="submit"
          disabled={submitting || !newContent.trim()}
          className="h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium px-5 transition-all shadow-md active:scale-95"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5">
              <Plus className="h-5 w-5" />
              <span>{isRtl ? "تذكر" : "Remember"}</span>
            </span>
          )}
        </Button>
      </form>

      {/* Tasks checklist container */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-4 text-center text-rose-200">
            {error}
          </div>
        ) : memories.length === 0 ? (
          <EmptyState
            title={isRtl ? "الذاكرة صافية وخالية" : "Your mind is clear"}
            description={isRtl ? "لا توجد ذكريات أو مهام سريعة معلقة حالياً." : "No pending quick thoughts in your memory."}
            icon={<CheckCircle2 className="h-8 w-8 text-sky-400" />}
          />
        ) : (
          <div className="space-y-2">
            {memories.map((memory) => {
              const isFading = fadingIds[memory.id];
              return (
                <div
                  key={memory.id}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04]",
                    isFading && "opacity-0 scale-95 pointer-events-none translate-y-2"
                  )}
                  style={{ transitionProperty: "all" }}
                >
                  <div className="flex flex-1 items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCheck(memory.id)}
                      disabled={isFading}
                      className="text-zinc-500 hover:text-sky-400 transition-colors flex-shrink-0"
                    >
                      {isFading ? (
                        <CheckCircle2 className="h-6 w-6 text-sky-500 animate-pulse" />
                      ) : (
                        <Circle className="h-6 w-6 group-hover:scale-105 transition-transform" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "text-base text-zinc-100 break-words leading-relaxed select-none transition-all duration-300",
                        isRtl ? "text-right" : "text-left",
                        isFading && "line-through text-zinc-600"
                      )}
                    >
                      {memory.content}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(memory.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-white/[0.05]"
                    aria-label="Delete thought"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

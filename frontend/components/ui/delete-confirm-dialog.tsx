"use client";

import { Button } from "@/components/ui/button";

export function DeleteConfirmDialog({
  open,
  loading,
  title,
  description,
  confirmLabel = "نعم، احذف",
  cancelLabel = "إلغاء",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div dir="rtl" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-right shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="text-lg font-medium text-white">{title}</div>
        <div className="mt-3 text-sm leading-7 text-zinc-400">{description}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "جاري الحذف..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

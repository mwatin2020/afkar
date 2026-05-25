"use client";

import { useEffect, useState } from "react";
import { FlaskConical, ScanSearch } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityBadge } from "@/components/ui/entity-badge";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { Idea } from "@/lib/types";

export default function SandboxPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    api<Idea[]>("/ideas/sandbox")
      .then((data) => {
        setIdeas(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sandbox ideas."));
  }, []);

  const sandboxIdeas = ideas.filter((idea) => idea.status === "SANDBOX");
  const reviewIdeas = ideas.filter((idea) => idea.status === "UNDER_REVIEW");
  const columns: { label: string; list: Idea[]; icon: React.ReactNode }[] = [
    { label: t.sandbox.sandbox, list: sandboxIdeas, icon: <FlaskConical className="h-5 w-5 text-violet-300" /> },
    { label: t.sandbox.underReview, list: reviewIdeas, icon: <ScanSearch className="h-5 w-5 text-sky-300" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t.nav.sandbox} description="A review room for concepts that are being tested, refined, or prepared for approval." />
      {error ? <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {columns.map((column) => (
          <Card key={column.label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{column.label}</CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">{column.icon}</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.list.length === 0 ? (
                <EmptyState title={t.sandbox.empty} description="Move an idea into this lane to continue the review workflow." icon={column.icon} />
              ) : (
                column.list.map((idea) => (
                  <div key={idea.id} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{idea.title}</div>
                        <div className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{idea.summary}</div>
                      </div>
                      <EntityBadge value={idea.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <EntityBadge value={idea.category} />
                      <EntityBadge value={idea.confidentiality} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

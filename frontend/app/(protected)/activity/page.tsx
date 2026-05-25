"use client";

import { useEffect, useState } from "react";
import { Activity as ActivityIcon, FolderKanban, Lightbulb, Lock, Settings, SquareCheckBig } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { ActivityItem } from "@/lib/types";

function activityIcon(type: string) {
  switch (type.toLowerCase()) {
    case "project":
      return <FolderKanban className="h-4 w-4 text-emerald-300" />;
    case "task":
      return <SquareCheckBig className="h-4 w-4 text-sky-300" />;
    case "idea":
      return <Lightbulb className="h-4 w-4 text-violet-300" />;
    case "auth":
      return <Lock className="h-4 w-4 text-amber-300" />;
    default:
      return <Settings className="h-4 w-4 text-[var(--muted-foreground)]" />;
  }
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    api<ActivityItem[]>("/activity")
      .then((data) => {
        setActivity(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load activity."));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t.nav.activity} description="A readable timeline of what changed across authentication, projects, tasks, ideas, and system events." />
      <Card>
        <CardHeader>
        <CardTitle>{t.activity.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="The timeline will populate as you start using the vault." icon={<ActivityIcon className="h-5 w-5" />} />
          ) : (
            activity.map((item, index) => (
              <div key={item.id} className="relative ps-10">
                {index < activity.length - 1 ? <div className="absolute start-[18px] top-10 h-[calc(100%-1.25rem)] w-px bg-white/10" /> : null}
                <div className="absolute start-0 top-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  {activityIcon(item.entity_type)}
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    {item.entity_type} / {item.action}
                  </div>
                  <div className="mt-2 font-medium text-white">{item.message}</div>
                  <div className="mt-3 text-sm text-[var(--muted-foreground)]">{new Date(item.created_at).toLocaleString(language === "ar" ? "ar" : "en-US")}</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckSquare, FolderKanban, Lightbulb, TimerReset } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { api } from "@/lib/api";
import type { ActivityItem, DashboardSummary } from "@/lib/types";
import { EntityBadge } from "@/components/ui/entity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const stats = [
    { key: "total_projects", label: t.dashboard.totalProjects },
    { key: "open_tasks", label: t.dashboard.openTasks },
    { key: "total_ideas", label: t.dashboard.totalIdeas },
    { key: "approved_ideas", label: t.dashboard.approvedIdeas },
  ] as const;

  const quickLinks = [
    { href: "/projects", title: t.projects.createProject, icon: FolderKanban },
    { href: "/tasks", title: t.tasks.newTask, icon: CheckSquare },
    { href: "/ideas", title: t.ideas.newIdea, icon: Lightbulb },
  ];

  useEffect(() => {
    Promise.all([api<DashboardSummary>("/dashboard/summary"), api<ActivityItem[]>("/activity")])
      .then(([summaryData, activityData]) => {
        setSummary(summaryData);
        setActivity(activityData.slice(0, 5));
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.dashboard.loadFailed));
  }, [t.dashboard.loadFailed]);

  return (
    <div className="space-y-6">
      <PageHeader title={t.nav.dashboard} description={t.dashboard.overview} />
      {error ? <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.key} className="rounded-[18px] border border-white/6 bg-white/[0.02] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">{item.label}</div>
              <div className="mt-3 text-3xl font-semibold text-white">{summary ? summary[item.key] : "..."}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-[18px] border border-white/6 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]">
                      <Icon className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div className="font-medium text-white">{link.title}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.dashboard.recentActivity}</CardTitle>
            <Link
              href="/activity"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-white"
            >
              {t.dashboard.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <EmptyState title={t.dashboard.noActivity} description={t.dashboard.noActivityDescription} icon={<TimerReset className="h-5 w-5" />} />
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-[18px] border border-white/6 bg-white/[0.02] p-4">
                  <div className="space-y-1">
                    <div className="font-medium text-white">{item.message}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">{new Date(item.created_at).toLocaleString(language === "ar" ? "ar" : "en-US")}</div>
                  </div>
                  <EntityBadge value={item.entity_type.toUpperCase()} className="capitalize" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

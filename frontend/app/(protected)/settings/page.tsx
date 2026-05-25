"use client";

import { useEffect, useState } from "react";
import { Database, Download, ShieldCheck, WifiOff } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    api<Record<string, unknown>>("/settings/export")
      .then((data) => {
        setPayload(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load settings."));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t.nav.settings} description="Review the local runtime, privacy posture, and a live export preview of your private vault data." />
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.localRuntime}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  <ShieldCheck className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <div className="text-sm text-[var(--muted-foreground)]">{t.settings.backendUrl}</div>
                  <div className="font-medium text-white">http://127.0.0.1:8000</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  <Database className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-sm text-[var(--muted-foreground)]">{t.settings.database}</div>
                  <div className="font-medium text-white">{t.settings.localPostgres}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  <WifiOff className="h-5 w-5 text-sky-300" />
                </div>
                <div>
                  <div className="text-sm text-[var(--muted-foreground)]">{t.settings.privacy}</div>
                  <div className="font-medium leading-7 text-white">{t.settings.privacyValue}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.settings.exportPreview}</CardTitle>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-[var(--muted-foreground)]">
              Back up PostgreSQL with `pg_dump`, or keep a JSON copy from the local export endpoint for quick inspection.
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.exportPreview}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[640px] overflow-auto rounded-[24px] border border-white/8 bg-black/30 p-5 text-xs leading-6 text-[var(--muted-foreground)]">
              {error ?? JSON.stringify(payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

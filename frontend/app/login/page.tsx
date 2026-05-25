"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, LockKeyhole, ShieldCheck, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "Vault Admin", email: "admin@example.com", password: "StrongPass123" });
  const { user, loginWithToken } = useAuth();
  const { t, dir } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    authApi
      .setupStatus()
      .then((data) => setRequiresSetup(data.requires_setup))
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t.login.authFailed);
      });
  }, [t.login.authFailed]);

  useEffect(() => {
    if (user) {
      router.replace("/ideas");
    }
  }, [router, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = requiresSetup ? await authApi.setup(form) : await authApi.login(form);
      loginWithToken(result.token.access_token, result.user);
      toast.success(requiresSetup ? t.login.createdSuccess : t.login.loginSuccess);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.login.authFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir={dir} className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div className="grid w-full max-w-6xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel hidden rounded-[36px] border border-white/10 p-8 xl:flex xl:flex-col xl:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--muted-foreground)]">{t.nav.privateVault}</div>
            <div className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-white">{t.nav.commandCenter}</div>
            <div className="mt-5 max-w-xl text-base leading-8 text-[var(--muted-foreground)]">{t.login.privacy}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
              <ShieldCheck className="h-5 w-5 text-violet-300" />
              <div className="mt-4 text-sm font-medium text-white">JWT Auth</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Private local authentication with no cloud provider.</div>
            </div>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
              <WifiOff className="h-5 w-5 text-emerald-300" />
              <div className="mt-4 text-sm font-medium text-white">Offline-first</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Everything runs on your laptop without telemetry.</div>
            </div>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
              <Database className="h-5 w-5 text-sky-300" />
              <div className="mt-4 text-sm font-medium text-white">Local PostgreSQL</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Your private ideas remain stored in your local vault.</div>
            </div>
          </div>
        </section>
        <Card className="w-full rounded-[36px] bg-[linear-gradient(180deg,rgba(22,27,34,0.96),rgba(11,15,25,0.96))]">
          <CardHeader className="p-8 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7C3AED,#2563EB)] shadow-[0_20px_40px_rgba(124,58,237,0.3)]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <LanguageToggle />
            </div>
            <CardTitle className="text-3xl">{requiresSetup ? t.login.createLocalAdmin : t.login.openVault}</CardTitle>
            <CardDescription className="max-w-md text-base leading-7">{t.login.privacy}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {requiresSetup && <Input placeholder={t.login.fullName} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />}
              <Input placeholder={t.login.email} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder={t.login.password} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? t.common.pleaseWait : requiresSetup ? t.login.createAdmin : t.login.login}
              </Button>
            </form>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 text-sm leading-7 text-[var(--muted-foreground)]">
              {t.common.localBanner}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

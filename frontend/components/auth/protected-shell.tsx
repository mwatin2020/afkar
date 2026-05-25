"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, CheckSquare, FolderKanban, Home, Lightbulb, Lock, LogOut, PanelLeftClose, PanelLeftOpen, Settings, Tags, TestTubeDiagonal } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t, dir } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const items = [
    { href: "/dashboard", label: t.nav.dashboard, icon: Home },
    { href: "/projects", label: t.nav.projects, icon: FolderKanban },
    { href: "/tasks", label: t.nav.tasks, icon: CheckSquare },
    { href: "/ideas", label: t.nav.ideas, icon: Lightbulb },
    { href: "/sandbox", label: t.nav.sandbox, icon: TestTubeDiagonal },
    { href: "/tags", label: t.nav.tags, icon: Tags },
    { href: "/activity", label: t.nav.activity, icon: Activity },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  useEffect(() => {
    const saved = window.localStorage.getItem("private-vault-sidebar-hidden");
    if (saved === "true") setSidebarHidden(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("private-vault-sidebar-hidden", String(sidebarHidden));
  }, [sidebarHidden]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-[var(--muted-foreground)]">{t.common.loadingVault}</div>;
  }

  return (
    <div dir={dir} className="min-h-screen p-3 md:p-4">
      <div className={`mx-auto grid max-w-[1600px] gap-4 ${sidebarHidden ? "xl:grid-cols-[1fr]" : "xl:grid-cols-[260px_1fr]"}`}>
        {!sidebarHidden ? (
        <aside className="glass-panel flex flex-col rounded-[28px] border border-white/8 p-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between border-b border-white/6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Lock className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{t.nav.privateVault}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{t.nav.commandCenter}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSidebarHidden((value) => !value)}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <nav className="mt-4 space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-colors",
                    active
                      ? "border-white/10 bg-white/[0.06] text-white"
                      : "border-transparent text-[var(--muted-foreground)] hover:border-white/8 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-colors", active ? "border-white/10 bg-white/[0.08]" : "border-white/6 bg-white/[0.03] group-hover:border-white/10 group-hover:bg-white/[0.05]")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            <LanguageToggle />
            <Button variant="ghost" className="w-full justify-start rounded-2xl border border-white/8 bg-white/[0.02] px-4" onClick={logout}>
              <LogOut className="me-2 h-4 w-4" />
              {t.common.logout}
            </Button>
          </div>
        </aside>
        ) : null}
        <main className="glass-panel rounded-[28px] border border-white/8 px-5 py-5 md:px-6 md:py-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/6 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">{t.common.localBanner}</div>
              <div className="text-xl font-semibold tracking-tight text-white md:text-2xl">{t.nav.welcome.replace("{name}", user.full_name)}</div>
            </div>
            <div className="flex items-center gap-3">
              {sidebarHidden ? (
                <Button variant="outline" size="sm" onClick={() => setSidebarHidden(false)}>
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              ) : null}
              <div className="md:hidden">
                <LanguageToggle />
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lightbulb, Lock, LogOut, Settings } from "lucide-react";

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

  const items = [
    { href: "/ideas", label: t.nav.ideas, icon: Lightbulb },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-[var(--muted-foreground)]">{t.common.loadingVault}</div>;
  }

  return (
    <div dir={dir} className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(87,117,255,0.18),transparent_34%),linear-gradient(180deg,#090c12,#11161e_48%,#0b0f16)] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-5 md:pb-6">
      <div className="mx-auto max-w-5xl">
        <header className="glass-panel mb-4 rounded-[28px] border border-white/8 px-4 py-4 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Lock className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">{t.nav.privateVault}</div>
                <div className="truncate text-lg font-semibold text-white">{t.nav.ideas}</div>
                <div className="truncate text-sm text-[var(--muted-foreground)]">{t.nav.welcome.replace("{name}", user.full_name)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <LanguageToggle />
              </div>
              <Button variant="ghost" className="h-10 rounded-2xl border border-white/8 bg-white/[0.02] px-3 text-sm" onClick={logout}>
                <LogOut className="me-2 h-4 w-4" />
                {t.common.logout}
              </Button>
            </div>
          </div>
          <div className="mt-3 md:hidden">
            <LanguageToggle />
          </div>
        </header>

        <main className="glass-panel rounded-[30px] border border-white/8 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[rgba(8,11,18,0.88)] px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition-colors",
                  active ? "border-white/14 bg-white/[0.08] text-white" : "border-white/8 bg-white/[0.03] text-[var(--muted-foreground)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

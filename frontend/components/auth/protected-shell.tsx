"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Brain, Lightbulb, Lock, LogOut, Settings, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition-colors hover:bg-white/[0.06]"
    >
      <span className="relative flex h-4 w-4 flex-col justify-between">
        <span className={cn("block h-[1.5px] w-4 rounded-full bg-current transition-transform", open ? "translate-y-[7px] rotate-45" : "")} />
        <span className={cn("block h-[1.5px] w-4 rounded-full bg-current transition-opacity", open ? "opacity-0" : "opacity-100")} />
        <span className={cn("block h-[1.5px] w-4 rounded-full bg-current transition-transform", open ? "-translate-y-[7px] -rotate-45" : "")} />
      </span>
    </button>
  );
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { href: "/ideas", label: t.nav.ideas, icon: Lightbulb },
      { href: "/memory", label: t.nav.memory, icon: Brain },
      { href: "/settings", label: t.nav.settings, icon: Settings },
    ],
    [t.nav.ideas, t.nav.memory, t.nav.settings],
  );

  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/settings")) return t.nav.settings;
    if (pathname.startsWith("/memory")) return t.nav.memory;
    return t.nav.ideas;
  }, [pathname, t.nav.ideas, t.nav.memory, t.nav.settings]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-[var(--muted-foreground)]">{t.common.loadingVault}</div>;
  }

  const drawerSide = dir === "rtl" ? "right-0 border-l" : "left-0 border-r";
  const drawerState = drawerOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  return (
    <div dir={dir} className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#090d14_0%,#0d1117_100%)] text-white">
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(9,13,20,0.94)] backdrop-blur-xl md:hidden">
        <div className="flex h-[60px] items-center justify-between px-4">
          <HamburgerButton open={drawerOpen} onClick={() => setDrawerOpen((value) => !value)} />
          <div className={cn("min-w-0 flex-1 px-3", dir === "rtl" ? "text-right" : "text-center")}>
            <div className="truncate text-[19px] font-semibold leading-none">{pageTitle}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-[var(--muted-foreground)]">
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl md:min-h-screen md:px-6">
        <aside className="hidden md:flex md:w-72 md:flex-col md:border-e md:border-white/8 md:py-8 md:pe-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-[var(--primary)]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-white">{t.nav.privateVault}</div>
              <div className="meta-text">{language === "ar" ? "واجهة مبسطة للأفكار" : "Ideas-only workspace"}</div>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] transition-colors",
                    active ? "bg-white/[0.06] text-white" : "text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 px-2 pt-8">
            <LanguageToggle />
            <Button variant="outline" className="w-full justify-start" onClick={logout}>
              <LogOut className="me-2 h-4 w-4" />
              {t.common.logout}
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="px-4 pb-8 pt-5 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      <div className={cn("fixed inset-0 z-40 bg-black/55 transition-opacity duration-200 md:hidden", drawerOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setDrawerOpen(false)} />
      <aside
        className={cn(
          "fixed top-0 z-50 h-full w-[82vw] max-w-[320px] border-white/10 bg-[#0b1017] px-5 pb-6 pt-[calc(1rem+env(safe-area-inset-top))] shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out md:hidden",
          drawerSide,
          drawerState,
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-[var(--primary)]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-white">{t.nav.privateVault}</div>
              <div className="meta-text">{pageTitle}</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-8 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] transition-colors",
                  active ? "bg-white/[0.07] text-white" : "text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="soft-divider mt-8 pt-6">
          <div className="space-y-3">
            <LanguageToggle />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setDrawerOpen(false);
                logout();
              }}
            >
              <LogOut className="me-2 h-4 w-4" />
              {t.common.logout}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

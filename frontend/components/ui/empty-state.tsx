import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--muted-foreground)]">{icon}</div> : null}
      <div className="text-lg font-semibold leading-8 text-white">{title}</div>
      {description ? <div className="muted-readable mt-2 text-base leading-8">{description}</div> : null}
    </div>
  );
}

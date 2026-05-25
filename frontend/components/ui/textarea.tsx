import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-base leading-8 text-white outline-none transition-all placeholder:text-[var(--muted-foreground)]/80 focus:border-[var(--primary)] focus:bg-white/[0.06] focus:ring-4 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}

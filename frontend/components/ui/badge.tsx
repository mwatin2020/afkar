import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90", className)} {...props} />;
}

"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type OptionItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

function extractOptions(children: React.ReactNode): OptionItem[] {
  return React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => {
      const props = child.props as { value?: string; children?: React.ReactNode; disabled?: boolean };
      return {
        value: props.value ?? "",
        label: typeof props.children === "string" ? props.children : String(props.children ?? ""),
        disabled: props.disabled,
      };
    });
}

export function Select({
  className,
  children,
  value,
  onChange,
  disabled,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const options = React.useMemo(() => extractOptions(children), [children]);
  const selected = options.find((option) => option.value === value) ?? options[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextValue: string) {
    if (disabled) return;
    onChange?.({
      target: { value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1b2230] px-4 text-sm text-white outline-none transition-all focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
          open ? "border-[var(--primary)] bg-[#222b3d]" : "",
          className,
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown className={cn("h-4 w-4 text-[var(--muted-foreground)] transition-transform", open ? "rotate-180" : "")} />
      </button>
      <select className="hidden" value={value} onChange={onChange} disabled={disabled} {...props}>
        {children}
      </select>
      {open ? (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-white/10 bg-[#1b2230] p-2 shadow-[0_24px_80px_rgba(2,6,23,0.55)]">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                disabled={option.disabled}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl bg-[#1b2230] px-3 py-2.5 text-sm text-white transition-colors",
                  active ? "bg-[linear-gradient(135deg,rgba(124,58,237,0.32),rgba(59,130,246,0.18))]" : "hover:bg-[#252f44]",
                  option.disabled ? "cursor-not-allowed opacity-50" : "",
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {active ? <Check className="h-4 w-4 text-violet-300" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

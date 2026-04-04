import { cn } from "@/lib/utils";

export function Input({ label, value, onChange, type = "text", placeholder, mono, className, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "bg-surface-alt border border-border rounded-[10px] py-2.5 px-3.5",
          "text-text-primary text-sm outline-none transition-colors",
          "focus:border-accent",
          mono ? "font-mono" : "font-body",
          className
        )}
        {...rest}
      />
    </div>
  );
}

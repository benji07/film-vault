import { cn } from "@/lib/utils";

export function Badge({ children, className, style = {} }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full",
        "text-[11px] font-semibold font-body tracking-wide",
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}

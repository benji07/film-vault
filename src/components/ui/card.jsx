import { cn } from "@/lib/utils";

export function Card({ children, onClick, className, style = {} }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-[14px] p-4 transition-all",
        onClick && "cursor-pointer",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

import { T } from "@/constants/theme";

export function BarChart({ data: chartData, color = T.accent }) {
  const max = Math.max(...Object.values(chartData), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(chartData).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2.5">
          <span className="text-xs text-text-sec font-body min-w-[80px] text-right">{k}</span>
          <div className="flex-1 h-[22px] bg-surface-alt rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-[width] duration-500 ease-out"
              style={{
                width: `${(v / max) * 100}%`,
                background: `linear-gradient(90deg, ${color}, ${color}88)`,
              }}
            />
          </div>
          <span className="text-[13px] font-mono text-text-primary min-w-[24px] font-semibold">{v}</span>
        </div>
      ))}
    </div>
  );
}

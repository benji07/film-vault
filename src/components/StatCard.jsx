export function StatCard({ icon: Icon, label, value, color = "var(--color-accent)" }) {
  return (
    <div className="bg-card border border-border rounded-[14px] py-3.5 px-4 flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: color + "18" }}
        >
          <Icon size={14} color={color} />
        </div>
        <span className="text-[11px] text-text-muted font-body font-semibold">{label}</span>
      </div>
      <span className="text-[26px] font-bold font-mono text-text-primary">{value}</span>
    </div>
  );
}

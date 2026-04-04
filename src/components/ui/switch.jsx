export function Switch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {label && (
        <label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
          {label}
        </label>
      )}
      <div
        onClick={() => onChange(!checked)}
        className="w-11 h-6 rounded-full cursor-pointer relative transition-all"
        style={{
          background: checked ? "var(--color-accent)" : "var(--color-surface-alt)",
          border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-border)"}`,
        }}
      >
        <div
          className="w-[18px] h-[18px] rounded-full absolute top-[2px] transition-all"
          style={{
            background: checked ? "#fff" : "var(--color-text-muted)",
            left: checked ? 22 : 2,
          }}
        />
      </div>
    </div>
  );
}

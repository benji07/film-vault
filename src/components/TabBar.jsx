import { Home, Film, Camera, BarChart3 } from "lucide-react";

const tabs = [
  { key: "home", icon: Home, label: "Accueil" },
  { key: "stock", icon: Film, label: "Pellicules" },
  { key: "cameras", icon: Camera, label: "Appareils" },
  { key: "stats", icon: BarChart3, label: "Stats" },
];

export function TabBar({ screen, setScreen }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface border-t border-border flex justify-around pt-2.5 pb-4.5 z-[100]">
      {tabs.map(t => {
        const active = screen === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setScreen(t.key)}
            className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer py-1 px-3"
          >
            <t.icon
              size={20}
              className={active ? "text-accent" : "text-text-muted"}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <span
              className={`text-[10px] font-body ${active ? "font-bold text-accent" : "font-medium text-text-muted"}`}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

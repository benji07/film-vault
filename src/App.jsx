import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Camera, Film, BarChart3, Snowflake, Plus, Search, ChevronRight,
  AlertTriangle, Check, X, Eye, Trash2, Edit3, ArrowLeft, ChevronDown,
  Clock, Archive, Aperture, CircleDot, Home, Package, Loader2,
  RotateCcw, Send, ImageIcon, Hash, Calendar, MessageSquare, Thermometer
} from "lucide-react";

// ══════════════════════════════════════════════════════════
//  FILMVAULT — PROTOTYPE INTERACTIF · DARKROOM THEME
//  Persistance via window.storage
// ══════════════════════════════════════════════════════════

const T = {
  bg: "#0D0D0D", surface: "#1A1A1A", surfaceAlt: "#242424",
  card: "#1E1E1E", cardHover: "#252525", border: "#2A2A2A",
  borderLight: "#333", text: "#E8E4DF", textSec: "#A09A92",
  textMuted: "#6B665F", accent: "#C4392D", accentHover: "#D44435",
  accentSoft: "rgba(196,57,45,0.12)", amber: "#D4A858",
  amberSoft: "rgba(212,168,88,0.10)", green: "#4A8C5C",
  greenSoft: "rgba(74,140,92,0.12)", blue: "#5B7FA5",
  blueSoft: "rgba(91,127,165,0.10)",
};

const FONT = { display: "'Instrument Serif', serif", body: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const FILM_CATALOG = [
  { id: "portra400", name: "Kodak Portra 400", brand: "Kodak", iso: 400, type: "Couleur", formats: ["35mm","120"] },
  { id: "portra160", name: "Kodak Portra 160", brand: "Kodak", iso: 160, type: "Couleur", formats: ["35mm","120"] },
  { id: "portra800", name: "Kodak Portra 800", brand: "Kodak", iso: 800, type: "Couleur", formats: ["35mm","120"] },
  { id: "gold200", name: "Kodak Gold 200", brand: "Kodak", iso: 200, type: "Couleur", formats: ["35mm"] },
  { id: "colorplus200", name: "Kodak ColorPlus 200", brand: "Kodak", iso: 200, type: "Couleur", formats: ["35mm"] },
  { id: "ultramax400", name: "Kodak Ultramax 400", brand: "Kodak", iso: 400, type: "Couleur", formats: ["35mm"] },
  { id: "ektar100", name: "Kodak Ektar 100", brand: "Kodak", iso: 100, type: "Couleur", formats: ["35mm","120"] },
  { id: "trix400", name: "Kodak Tri-X 400", brand: "Kodak", iso: 400, type: "N&B", formats: ["35mm","120"] },
  { id: "tmax400", name: "Kodak T-Max 400", brand: "Kodak", iso: 400, type: "N&B", formats: ["35mm","120"] },
  { id: "tmax100", name: "Kodak T-Max 100", brand: "Kodak", iso: 100, type: "N&B", formats: ["35mm","120"] },
  { id: "hp5", name: "Ilford HP5 Plus 400", brand: "Ilford", iso: 400, type: "N&B", formats: ["35mm","120"] },
  { id: "delta400", name: "Ilford Delta 400", brand: "Ilford", iso: 400, type: "N&B", formats: ["35mm","120"] },
  { id: "delta3200", name: "Ilford Delta 3200", brand: "Ilford", iso: 3200, type: "N&B", formats: ["35mm","120"] },
  { id: "fp4", name: "Ilford FP4 Plus 125", brand: "Ilford", iso: 125, type: "N&B", formats: ["35mm","120"] },
  { id: "panf", name: "Ilford Pan F Plus 50", brand: "Ilford", iso: 50, type: "N&B", formats: ["35mm","120"] },
  { id: "xp2", name: "Ilford XP2 Super 400", brand: "Ilford", iso: 400, type: "N&B", formats: ["35mm"] },
  { id: "superia400", name: "Fujifilm Superia X-TRA 400", brand: "Fujifilm", iso: 400, type: "Couleur", formats: ["35mm"] },
  { id: "c200", name: "Fujifilm C200", brand: "Fujifilm", iso: 200, type: "Couleur", formats: ["35mm"] },
  { id: "provia100f", name: "Fujifilm Provia 100F", brand: "Fujifilm", iso: 100, type: "Diapo", formats: ["35mm","120"] },
  { id: "velvia50", name: "Fujifilm Velvia 50", brand: "Fujifilm", iso: 50, type: "Diapo", formats: ["35mm","120"] },
  { id: "velvia100", name: "Fujifilm Velvia 100", brand: "Fujifilm", iso: 100, type: "Diapo", formats: ["35mm","120"] },
  { id: "acros100ii", name: "Fujifilm Acros 100 II", brand: "Fujifilm", iso: 100, type: "N&B", formats: ["35mm","120"] },
  { id: "instaxmini", name: "Fujifilm Instax Mini", brand: "Fujifilm", iso: 800, type: "Instant", formats: ["Instant"] },
  { id: "instaxwide", name: "Fujifilm Instax Wide", brand: "Fujifilm", iso: 800, type: "Instant", formats: ["Instant"] },
  { id: "ektachrome", name: "Kodak Ektachrome E100", brand: "Kodak", iso: 100, type: "Diapo", formats: ["35mm","120"] },
  { id: "cinestill800", name: "CineStill 800T", brand: "CineStill", iso: 800, type: "Couleur", formats: ["35mm","120"] },
  { id: "cinestill400", name: "CineStill 400D", brand: "CineStill", iso: 400, type: "Couleur", formats: ["35mm","120"] },
  { id: "cinestill50", name: "CineStill 50D", brand: "CineStill", iso: 50, type: "Couleur", formats: ["35mm"] },
  { id: "lomo400", name: "Lomography Color Negative 400", brand: "Lomography", iso: 400, type: "Couleur", formats: ["35mm","120"] },
  { id: "lomo800", name: "Lomography Color Negative 800", brand: "Lomography", iso: 800, type: "Couleur", formats: ["35mm"] },
  { id: "kentmere400", name: "Kentmere 400", brand: "Kentmere", iso: 400, type: "N&B", formats: ["35mm"] },
  { id: "fomapan400", name: "Fomapan 400", brand: "Foma", iso: 400, type: "N&B", formats: ["35mm","120"] },
  { id: "fomapan100", name: "Fomapan 100", brand: "Foma", iso: 100, type: "N&B", formats: ["35mm","120"] },
];

const STATES = {
  stock: { label: "En stock", color: T.blue, icon: Snowflake },
  loaded: { label: "Chargée", color: T.green, icon: Camera },
  partial: { label: "Partielle", color: T.amber, icon: Clock },
  exposed: { label: "Exposée", color: T.accent, icon: Eye },
  developed: { label: "Développée", color: T.textSec, icon: Archive },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

const DEFAULT_CAMERAS = [
  { id: "cam1", name: "Canon A-1", format: "35mm", hasInterchangeableBack: false, backs: [] },
  { id: "cam2", name: "Canon AE-1", format: "35mm", hasInterchangeableBack: false, backs: [] },
  { id: "cam3", name: "Hasselblad 503cx", format: "120", hasInterchangeableBack: true, backs: [
    { id: "back1", name: "A12 — Couleur", ref: "A12" },
    { id: "back2", name: "A12 — N&B", ref: "A12" },
  ]},
  { id: "cam4", name: "Yashica Mat 124G", format: "120", hasInterchangeableBack: false, backs: [] },
  { id: "cam5", name: "Olympus mju-II", format: "35mm", hasInterchangeableBack: false, backs: [] },
  { id: "cam6", name: "Canon 1000FN", format: "35mm", hasInterchangeableBack: false, backs: [] },
];

// ── Storage helpers (localStorage) ─────────────────────
const STORAGE_KEY = "filmvault-data";
let storageAvailable = false;

async function checkStorage() {
  try {
    localStorage.setItem("filmvault-test", "1");
    localStorage.removeItem("filmvault-test");
    storageAvailable = true;
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}

async function loadData() {
  if (!storageAvailable) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.films)) return parsed;
    }
  } catch (e) {
    console.log("Load error:", e?.message || e);
  }
  return null;
}

async function saveData(data) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function getInitialData() {
  return {
    films: [],
    cameras: DEFAULT_CAMERAS,
    version: 1,
  };
}

// ── Shared Components ──────────────────────────────────
const Badge = ({ children, color = T.textMuted, bg, style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, fontFamily: FONT.body, letterSpacing: 0.2,
    color: color, background: bg || (color + "18"),
    ...style,
  }}>{children}</span>
);

const Btn = ({ children, variant = "primary", onClick, disabled, style = {}, small }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FONT.body, fontWeight: 600, borderRadius: 12, transition: "all 0.2s",
    padding: small ? "6px 12px" : "10px 18px", fontSize: small ? 12 : 13,
    opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary: { background: T.accent, color: "#fff" },
    secondary: { background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.textSec },
    danger: { background: T.accentSoft, color: T.accent },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, mono, ...rest }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, fontFamily: FONT.body, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "10px 14px", color: T.text, fontSize: 14,
        fontFamily: mono ? FONT.mono : FONT.body, outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = T.accent}
      onBlur={e => e.target.style.borderColor = T.border}
      {...rest}
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, fontFamily: FONT.body, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "10px 14px", color: value ? T.text : T.textMuted, fontSize: 14,
        fontFamily: FONT.body, outline: "none", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B665F' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, fontFamily: FONT.body, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <div onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer",
      background: checked ? T.accent : T.surfaceAlt, border: `1px solid ${checked ? T.accent : T.border}`,
      position: "relative", transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 9, background: checked ? "#fff" : T.textMuted,
        position: "absolute", top: 2, left: checked ? 22 : 2, transition: "left 0.2s, background 0.2s",
      }} />
    </div>
  </div>
);

const Card = ({ children, onClick, style = {} }) => (
  <div onClick={onClick} style={{
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
    padding: 16, cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style,
  }}>{children}</div>
);

const StatCard = ({ icon: Icon, label, value, color = T.accent }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
    padding: "14px 16px", flex: 1, minWidth: 0,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} />
      </div>
      <span style={{ fontSize: 11, color: T.textMuted, fontFamily: FONT.body, fontWeight: 600 }}>{label}</span>
    </div>
    <span style={{ fontSize: 26, fontWeight: 700, fontFamily: FONT.mono, color: T.text }}>{value}</span>
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: 12 }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={24} color={T.textMuted} />
    </div>
    <span style={{ fontSize: 16, fontWeight: 600, color: T.textSec, fontFamily: FONT.body }}>{title}</span>
    <span style={{ fontSize: 13, color: T.textMuted, fontFamily: FONT.body, textAlign: "center" }}>{subtitle}</span>
    {action}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto",
        background: T.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 32px",
        border: `1px solid ${T.border}`, borderBottom: "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: FONT.display, fontSize: 22, color: T.text, fontStyle: "italic" }}>{title}</span>
          <button onClick={onClose} style={{ background: T.surfaceAlt, border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={T.textMuted} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const filmName = (film) => {
  if (film.brand && film.model) return `${film.brand} ${film.model}`;
  if (film.model) return film.model;
  // Legacy catalog lookup
  const cat = FILM_CATALOG.find(c => c.id === film.catalogId);
  return cat?.name || film.customName || "Pellicule";
};
const filmBrand = (film) => film.brand || FILM_CATALOG.find(c => c.id === film.catalogId)?.brand || "?";
const filmType = (film) => film.type || FILM_CATALOG.find(c => c.id === film.catalogId)?.type || "?";
const filmIso = (film) => film.iso || FILM_CATALOG.find(c => c.id === film.catalogId)?.iso || "?";

const FilmRow = ({ film, onClick, cameras }) => {
  const st = STATES[film.state];
  const StIcon = st.icon;
  const cam = film.cameraId ? cameras.find(c => c.id === film.cameraId) : null;
  const back = film.backId && cam ? cam.backs.find(b => b.id === film.backId) : null;
  const isExpiring = film.state === "stock" && film.expDate && new Date(film.expDate) < new Date(Date.now() + 90 * 86400000);
  const isExpired = film.state === "stock" && film.expDate && new Date(film.expDate) < new Date();

  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `linear-gradient(135deg, ${st.color}22, ${st.color}08)`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <StIcon size={18} color={st.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: FONT.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {filmName(film)}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <Badge color={st.color}>{st.label}</Badge>
          <Badge color={T.textMuted}>{film.format}</Badge>
          {film.shootIso && film.shootIso !== filmIso(film) && <Badge color={T.amber}>Push {film.shootIso}</Badge>}
          {cam && <Badge color={T.green}>{cam.name}{back ? ` · ${back.name}` : ""}</Badge>}
          {isExpired && <Badge color={T.accent}>Périmée</Badge>}
          {isExpiring && !isExpired && <Badge color={T.amber}>Expire bientôt</Badge>}
        </div>
      </div>
      <ChevronRight size={16} color={T.textMuted} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  SCREENS
// ══════════════════════════════════════════════════════════

// ── DASHBOARD ──────────────────────────────────────────
function DashboardScreen({ data, setScreen, setSelectedFilm }) {
  const { films, cameras } = data;
  const stockCount = films.filter(f => f.state === "stock").length;
  const loadedCount = films.filter(f => f.state === "loaded").length;
  const exposedCount = films.filter(f => f.state === "exposed").length;
  const developedCount = films.filter(f => f.state === "developed").length;
  const partialCount = films.filter(f => f.state === "partial").length;

  const expiring = films.filter(f => f.state === "stock" && f.expDate && new Date(f.expDate) < new Date(Date.now() + 90 * 86400000));
  const loaded = films.filter(f => f.state === "loaded");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: FONT.display, fontSize: 28, color: T.text, margin: 0, fontStyle: "italic" }}>FilmVault</h1>
        <p style={{ fontFamily: FONT.body, fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>Ton inventaire argentique</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard icon={Snowflake} label="En stock" value={stockCount} color={T.blue} />
        <StatCard icon={Camera} label="Chargées" value={loadedCount} color={T.green} />
        <StatCard icon={Eye} label="Exposées" value={exposedCount} color={T.accent} />
        <StatCard icon={Archive} label="Développées" value={developedCount} color={T.textSec} />
      </div>

      {partialCount > 0 && (
        <Card style={{ borderColor: T.amber + "44" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={16} color={T.amber} />
            <span style={{ fontSize: 13, color: T.amber, fontFamily: FONT.body, fontWeight: 600 }}>
              {partialCount} pellicule{partialCount > 1 ? "s" : ""} partiellement exposée{partialCount > 1 ? "s" : ""}
            </span>
          </div>
        </Card>
      )}

      {expiring.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} color={T.amber} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.amber, fontFamily: FONT.body }}>Péremption proche</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {expiring.slice(0, 3).map(f => <FilmRow key={f.id} film={f} cameras={cameras} onClick={() => { setSelectedFilm(f.id); setScreen("filmDetail"); }} />)}
          </div>
        </div>
      )}

      {loaded.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.textSec, fontFamily: FONT.body }}>Dans les appareils</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loaded.map(f => <FilmRow key={f.id} film={f} cameras={cameras} onClick={() => { setSelectedFilm(f.id); setScreen("filmDetail"); }} />)}
          </div>
        </div>
      )}

      {films.length === 0 && (
        <EmptyState
          icon={Film}
          title="Aucune pellicule"
          subtitle="Ajoute ta première pellicule pour commencer à tracker ton stock"
          action={<Btn onClick={() => setScreen("addFilm")}><Plus size={14} /> Ajouter une pellicule</Btn>}
        />
      )}
    </div>
  );
}

// ── STOCK SCREEN ───────────────────────────────────────
function StockScreen({ data, setScreen, setSelectedFilm }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { films, cameras } = data;

  const filtered = films.filter(f => {
    if (filter !== "all" && f.state !== filter) return false;
    if (search) {
      const name = filmName(f);
      return name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const tabs = [
    { key: "all", label: "Toutes", count: films.length },
    { key: "stock", label: "Stock", count: films.filter(f => f.state === "stock").length },
    { key: "loaded", label: "Chargées", count: films.filter(f => f.state === "loaded").length },
    { key: "partial", label: "Partielles", count: films.filter(f => f.state === "partial").length },
    { key: "exposed", label: "Exposées", count: films.filter(f => f.state === "exposed").length },
    { key: "developed", label: "Dév.", count: films.filter(f => f.state === "developed").length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: 24, color: T.text, margin: 0, fontStyle: "italic" }}>Pellicules</h2>
        <Btn small onClick={() => setScreen("addFilm")}><Plus size={14} /> Ajouter</Btn>
      </div>

      <div style={{ position: "relative" }}>
        <Search size={16} color={T.textMuted} style={{ position: "absolute", left: 12, top: 12 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
          style={{
            width: "100%", boxSizing: "border-box", background: T.surfaceAlt, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "10px 14px 10px 36px", color: T.text, fontSize: 14,
            fontFamily: FONT.body, outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
            background: filter === t.key ? T.accent : T.surfaceAlt,
            color: filter === t.key ? "#fff" : T.textSec,
            fontSize: 12, fontWeight: 600, fontFamily: FONT.body, whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>
            {t.label} <span style={{ opacity: 0.7 }}>({t.count})</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(f => <FilmRow key={f.id} film={f} cameras={cameras} onClick={() => { setSelectedFilm(f.id); setScreen("filmDetail"); }} />)}
        {filtered.length === 0 && <EmptyState icon={Film} title="Rien trouvé" subtitle="Aucune pellicule ne correspond à ta recherche" />}
      </div>
    </div>
  );
}

// ── ADD FILM ───────────────────────────────────────────
function AddFilmScreen({ data, setData, setScreen }) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [iso, setIso] = useState("");
  const [type, setType] = useState("Couleur");
  const [format, setFormat] = useState("35mm");
  const [expDate, setExpDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [comment, setComment] = useState("");
  const [price, setPrice] = useState("");

  const handleSave = async () => {
    const qty = parseInt(quantity) || 1;
    const newFilms = [];
    for (let i = 0; i < qty; i++) {
      newFilms.push({
        id: uid(), catalogId: null, brand, model, iso: parseInt(iso) || 0, type, format,
        state: "stock", expDate, comment, price: price ? parseFloat(price) : null,
        addedDate: today(), shootIso: null, cameraId: null, backId: null,
        startDate: null, endDate: null, posesShot: null,
        posesTotal: format === "120" ? 12 : format === "Instant" ? 10 : 36,
        lab: null, devDate: null, history: [{ date: today(), action: "Ajoutée au stock" }],
      });
    }
    const updated = { ...data, films: [...data.films, ...newFilms] };
    setData(updated);
    setScreen("stock");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setScreen("stock")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={T.textSec} />
        </button>
        <h2 style={{ fontFamily: FONT.display, fontSize: 22, color: T.text, margin: 0, fontStyle: "italic" }}>Ajouter une pellicule</h2>
      </div>

      <Input label="Marque" value={brand} onChange={setBrand} placeholder="Ex : Kodak, Ilford, Fujifilm…" />
      <Input label="Modèle" value={model} onChange={setModel} placeholder="Ex : Portra 400, HP5 Plus…" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="ISO" type="number" value={iso} onChange={setIso} placeholder="400" mono />
        <Select label="Type" value={type} onChange={setType}
          options={[
            { value: "Couleur", label: "Couleur" },
            { value: "N&B", label: "N&B" },
            { value: "Diapo", label: "Diapo" },
            { value: "ECN-2", label: "ECN-2" },
            { value: "Instant", label: "Instant" },
          ]} />
      </div>

      <Select label="Format" value={format} onChange={setFormat}
        options={[
          { value: "35mm", label: "35mm" },
          { value: "120", label: "Moyen format (120)" },
          { value: "Instant", label: "Instant" },
        ]} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Quantité" type="number" value={quantity} onChange={setQuantity} min="1" max="50" mono />
        <Input label="Prix unitaire (€)" type="number" value={price} onChange={setPrice} placeholder="0.00" mono />
      </div>

      <Input label="Date d'expiration" type="date" value={expDate} onChange={setExpDate} mono />
      <Input label="Commentaire" value={comment} onChange={setComment} placeholder="Notes…" />

      <Btn onClick={handleSave} disabled={!brand || !model} style={{ width: "100%", justifyContent: "center", padding: "14px 20px" }}>
        <Plus size={16} /> Ajouter {parseInt(quantity) > 1 ? `${quantity} pellicules` : "la pellicule"}
      </Btn>
    </div>
  );
}

// ── FILM DETAIL ────────────────────────────────────────
function FilmDetailScreen({ data, setData, setScreen, filmId }) {
  const film = data.films.find(f => f.id === filmId);
  const [showAction, setShowAction] = useState(null);
  const [actionData, setActionData] = useState({});

  if (!film) return <EmptyState icon={Film} title="Pellicule introuvable" action={<Btn onClick={() => setScreen("stock")}>Retour</Btn>} />;

  const st = STATES[film.state];
  const cam = film.cameraId ? data.cameras.find(c => c.id === film.cameraId) : null;
  const back = film.backId && cam ? cam.backs.find(b => b.id === film.backId) : null;
  const fIso = filmIso(film);

  const updateFilm = async (updates) => {
    const newFilms = data.films.map(f => f.id === filmId ? { ...f, ...updates } : f);
    const updated = { ...data, films: newFilms };
    setData(updated);
    setShowAction(null);
    setActionData({});
  };

  const deleteFilm = async () => {
    const updated = { ...data, films: data.films.filter(f => f.id !== filmId) };
    setData(updated);
    setScreen("stock");
  };

  const getAvailableCameras = () => {
    return data.cameras.filter(c => {
      if (film.format === "120" && c.format !== "120") return false;
      if (film.format === "35mm" && c.format !== "35mm") return false;
      return true;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setScreen("stock")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={T.textSec} />
        </button>
        <h2 style={{ fontFamily: FONT.display, fontSize: 22, color: T.text, margin: 0, fontStyle: "italic" }}>{filmName(film)}</h2>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Badge color={st.color}>{st.label}</Badge>
          <Badge color={T.textMuted}>{film.format}</Badge>
          <Badge color={T.textMuted}>{filmType(film)}</Badge>
          <Badge color={T.textMuted}>ISO {fIso}</Badge>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {film.expDate && <InfoLine icon={Calendar} label="Expiration" value={fmtDate(film.expDate)} warn={new Date(film.expDate) < new Date()} />}
          {film.price && <InfoLine icon={Hash} label="Prix" value={`${film.price.toFixed(2)} €`} />}
          {film.shootIso && <InfoLine icon={Aperture} label="ISO de prise de vue" value={film.shootIso} />}
          {cam && <InfoLine icon={Camera} label="Appareil" value={`${cam.name}${back ? ` · ${back.name}` : ""}`} />}
          {film.startDate && <InfoLine icon={Calendar} label="Début" value={fmtDate(film.startDate)} />}
          {film.endDate && <InfoLine icon={Calendar} label="Fin" value={fmtDate(film.endDate)} />}
          {film.posesShot != null && <InfoLine icon={CircleDot} label="Poses" value={`${film.posesShot} / ${film.posesTotal}`} />}
          {film.lab && <InfoLine icon={Package} label="Labo" value={film.lab} />}
          {film.comment && <InfoLine icon={MessageSquare} label="Notes" value={film.comment} />}
        </div>
      </Card>

      {/* Actions by state */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {film.state === "stock" && (
          <Btn onClick={() => setShowAction("load")} style={{ width: "100%", justifyContent: "center" }}>
            <Camera size={16} /> Charger dans un appareil
          </Btn>
        )}
        {film.state === "loaded" && (
          <>
            <Btn onClick={() => setShowAction("finish")} style={{ width: "100%", justifyContent: "center" }}>
              <Check size={16} /> Marquer comme terminée
            </Btn>
            {film.format === "35mm" && (
              <Btn variant="secondary" onClick={() => setShowAction("partial")} style={{ width: "100%", justifyContent: "center" }}>
                <Clock size={16} /> Retirer (non terminée)
              </Btn>
            )}
          </>
        )}
        {film.state === "partial" && (
          <>
            <Btn onClick={() => setShowAction("reload")} style={{ width: "100%", justifyContent: "center" }}>
              <RotateCcw size={16} /> Recharger dans un appareil
            </Btn>
            <Btn variant="secondary" onClick={() => setShowAction("sendDev")} style={{ width: "100%", justifyContent: "center" }}>
              <Send size={16} /> Envoyer au développement
            </Btn>
          </>
        )}
        {film.state === "exposed" && (
          <Btn onClick={() => setShowAction("develop")} style={{ width: "100%", justifyContent: "center" }}>
            <Archive size={16} /> Marquer comme développée
          </Btn>
        )}
        <Btn variant="danger" onClick={deleteFilm} style={{ width: "100%", justifyContent: "center" }}>
          <Trash2 size={14} /> Supprimer
        </Btn>
      </div>

      {/* History */}
      {film.history && film.history.length > 0 && (
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, fontFamily: FONT.body, textTransform: "uppercase", letterSpacing: 0.5 }}>Historique</span>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
            {film.history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < film.history.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ fontSize: 11, color: T.textMuted, fontFamily: FONT.mono, whiteSpace: "nowrap" }}>{fmtDate(h.date)}</span>
                <span style={{ fontSize: 12, color: T.textSec, fontFamily: FONT.body }}>{h.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal open={showAction === "load"} onClose={() => setShowAction(null)} title="Charger dans un appareil">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Select label="Appareil" value={actionData.cameraId || ""} onChange={v => setActionData({ ...actionData, cameraId: v, backId: "" })}
            placeholder="Choisir…" options={getAvailableCameras().map(c => ({ value: c.id, label: c.name }))} />
          {actionData.cameraId && data.cameras.find(c => c.id === actionData.cameraId)?.backs?.length > 0 && (
            <Select label="Dos" value={actionData.backId || ""} onChange={v => setActionData({ ...actionData, backId: v })}
              placeholder="Choisir un dos…" options={data.cameras.find(c => c.id === actionData.cameraId).backs.map(b => ({ value: b.id, label: b.name }))} />
          )}
          <Input label="ISO de prise de vue" type="number" value={actionData.shootIso || String(fIso)} onChange={v => setActionData({ ...actionData, shootIso: v })} mono />
          <Input label="Date de début" type="date" value={actionData.startDate || today()} onChange={v => setActionData({ ...actionData, startDate: v })} mono />
          <Input label="Commentaire" value={actionData.comment || ""} onChange={v => setActionData({ ...actionData, comment: v })} />
          <Btn disabled={!actionData.cameraId} onClick={() => updateFilm({
            state: "loaded", cameraId: actionData.cameraId, backId: actionData.backId || null,
            shootIso: parseInt(actionData.shootIso) || fIso, startDate: actionData.startDate || today(),
            comment: actionData.comment || film.comment,
            history: [...(film.history || []), { date: today(), action: `Chargée dans ${data.cameras.find(c => c.id === actionData.cameraId)?.name}` }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <Camera size={16} /> Charger
          </Btn>
        </div>
      </Modal>

      <Modal open={showAction === "finish"} onClose={() => setShowAction(null)} title="Pellicule terminée">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Date de fin" type="date" value={actionData.endDate || today()} onChange={v => setActionData({ ...actionData, endDate: v })} mono />
          <Input label="Commentaire" value={actionData.comment || ""} onChange={v => setActionData({ ...actionData, comment: v })} />
          <Btn onClick={() => updateFilm({
            state: "exposed", endDate: actionData.endDate || today(),
            comment: actionData.comment || film.comment, cameraId: null, backId: null,
            history: [...(film.history || []), { date: today(), action: "Exposée — en attente de développement" }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <Check size={16} /> Confirmer
          </Btn>
        </div>
      </Modal>

      <Modal open={showAction === "partial"} onClose={() => setShowAction(null)} title="Retirer de l'appareil">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}33`, borderRadius: 12, padding: 14 }}>
            <span style={{ fontSize: 12, color: T.amber, fontFamily: FONT.body }}>La pellicule sera placée dans la section "partiellement exposées" de ton frigo.</span>
          </div>
          <Input label="Poses prises" type="number" value={actionData.posesShot || ""} onChange={v => setActionData({ ...actionData, posesShot: v })} placeholder={`Sur ${film.posesTotal}`} mono />
          <Input label="Commentaire" value={actionData.comment || ""} onChange={v => setActionData({ ...actionData, comment: v })} />
          <Btn onClick={() => updateFilm({
            state: "partial", posesShot: parseInt(actionData.posesShot) || 0,
            comment: actionData.comment || film.comment, cameraId: null, backId: null,
            history: [...(film.history || []), { date: today(), action: `Retirée partiellement (${actionData.posesShot || 0}/${film.posesTotal} poses)` }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <Clock size={16} /> Retirer
          </Btn>
        </div>
      </Modal>

      <Modal open={showAction === "reload"} onClose={() => setShowAction(null)} title="Recharger la pellicule">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}33`, borderRadius: 12, padding: 14 }}>
            <span style={{ fontSize: 12, color: T.amber, fontFamily: FONT.body, fontWeight: 600 }}>
              Avancer le film jusqu'à la pose {(film.posesShot || 0) + 1}
            </span>
          </div>
          <Select label="Appareil" value={actionData.cameraId || ""} onChange={v => setActionData({ ...actionData, cameraId: v, backId: "" })}
            placeholder="Choisir…" options={getAvailableCameras().map(c => ({ value: c.id, label: c.name }))} />
          <Input label="Date de reprise" type="date" value={actionData.startDate || today()} onChange={v => setActionData({ ...actionData, startDate: v })} mono />
          <Btn disabled={!actionData.cameraId} onClick={() => updateFilm({
            state: "loaded", cameraId: actionData.cameraId, backId: actionData.backId || null,
            startDate: actionData.startDate || today(),
            history: [...(film.history || []), { date: today(), action: `Rechargée dans ${data.cameras.find(c => c.id === actionData.cameraId)?.name}` }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <RotateCcw size={16} /> Recharger
          </Btn>
        </div>
      </Modal>

      <Modal open={showAction === "sendDev"} onClose={() => setShowAction(null)} title="Envoyer au développement">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Date de fin" type="date" value={actionData.endDate || today()} onChange={v => setActionData({ ...actionData, endDate: v })} mono />
          <Input label="Commentaire" value={actionData.comment || ""} onChange={v => setActionData({ ...actionData, comment: v })} />
          <Btn onClick={() => updateFilm({
            state: "exposed", endDate: actionData.endDate || today(),
            comment: actionData.comment || film.comment,
            history: [...(film.history || []), { date: today(), action: "Envoyée au développement (partielle)" }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <Send size={16} /> Envoyer
          </Btn>
        </div>
      </Modal>

      <Modal open={showAction === "develop"} onClose={() => setShowAction(null)} title="Marquer comme développée">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Labo" value={actionData.lab || ""} onChange={v => setActionData({ ...actionData, lab: v })} placeholder="Nom du labo…" />
          <Input label="Date de développement" type="date" value={actionData.devDate || today()} onChange={v => setActionData({ ...actionData, devDate: v })} mono />
          <Input label="Commentaire" value={actionData.comment || ""} onChange={v => setActionData({ ...actionData, comment: v })} />
          <Btn onClick={() => updateFilm({
            state: "developed", lab: actionData.lab || null,
            devDate: actionData.devDate || today(), comment: actionData.comment || film.comment,
            history: [...(film.history || []), { date: today(), action: `Développée${actionData.lab ? ` chez ${actionData.lab}` : ""}` }],
          })} style={{ width: "100%", justifyContent: "center" }}>
            <Archive size={16} /> Confirmer
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

const InfoLine = ({ icon: Icon, label, value, warn }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
    <Icon size={14} color={warn ? T.accent : T.textMuted} />
    <span style={{ fontSize: 12, color: T.textMuted, fontFamily: FONT.body, minWidth: 80 }}>{label}</span>
    <span style={{ fontSize: 13, color: warn ? T.accent : T.text, fontFamily: FONT.mono, fontWeight: 500 }}>{value}</span>
  </div>
);

// ── CAMERAS SCREEN ─────────────────────────────────────
function CamerasScreen({ data, setData, setScreen }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCam, setNewCam] = useState({ name: "", format: "35mm", hasInterchangeableBack: false });
  const [showBackModal, setShowBackModal] = useState(null); // camId for add
  const [newBack, setNewBack] = useState({ name: "", ref: "" });
  const [editCam, setEditCam] = useState(null); // full camera object
  const [editBack, setEditBack] = useState(null); // { camId, back }

  const addCamera = async () => {
    if (!newCam.name) return;
    const camera = { id: uid(), name: newCam.name, format: newCam.format, hasInterchangeableBack: newCam.hasInterchangeableBack || false, backs: [] };
    const updated = { ...data, cameras: [...data.cameras, camera] };
    setData(updated);
    setShowAdd(false);
    setNewCam({ name: "", format: "35mm", hasInterchangeableBack: false });
  };

  const saveEditCamera = async () => {
    if (!editCam?.name) return;
    const newCams = data.cameras.map(c => c.id === editCam.id ? { ...c, name: editCam.name, format: editCam.format, hasInterchangeableBack: editCam.hasInterchangeableBack || false } : c);
    const updated = { ...data, cameras: newCams };
    setData(updated);
    setEditCam(null);
  };

  const addBack = async (camId) => {
    if (!newBack.name) return;
    const back = { id: uid(), name: newBack.name, ref: newBack.ref };
    const newCams = data.cameras.map(c => c.id === camId ? { ...c, backs: [...c.backs, back] } : c);
    const updated = { ...data, cameras: newCams };
    setData(updated);
    setShowBackModal(null);
    setNewBack({ name: "", ref: "" });
  };

  const saveEditBack = async () => {
    if (!editBack?.back?.name) return;
    const newCams = data.cameras.map(c => {
      if (c.id !== editBack.camId) return c;
      return { ...c, backs: c.backs.map(b => b.id === editBack.back.id ? { ...b, name: editBack.back.name, ref: editBack.back.ref } : b) };
    });
    const updated = { ...data, cameras: newCams };
    setData(updated);
    setEditBack(null);
  };

  const deleteBack = async (camId, backId) => {
    const newCams = data.cameras.map(c => {
      if (c.id !== camId) return c;
      return { ...c, backs: c.backs.filter(b => b.id !== backId) };
    });
    const updated = { ...data, cameras: newCams };
    setData(updated);
    setEditBack(null);
  };

  const deleteCamera = async (camId) => {
    const updated = { ...data, cameras: data.cameras.filter(c => c.id !== camId) };
    setData(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: 24, color: T.text, margin: 0, fontStyle: "italic" }}>Appareils</h2>
        <Btn small onClick={() => setShowAdd(true)}><Plus size={14} /> Ajouter</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.cameras.map(cam => {
          const loadedFilms = data.films.filter(f => f.state === "loaded" && f.cameraId === cam.id);
          return (
            <Card key={cam.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: FONT.body }}>{cam.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <Badge color={T.textMuted}>{cam.format}</Badge>
                    {cam.backs.length > 0 && <Badge color={T.blue}>{cam.backs.length} dos</Badge>}
                    {loadedFilms.length > 0 && <Badge color={T.green}>{loadedFilms.length} chargée{loadedFilms.length > 1 ? "s" : ""}</Badge>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditCam({ ...cam })} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit3 size={14} color={T.textSec} />
                  </button>
                  {cam.hasInterchangeableBack && (
                    <button onClick={() => setShowBackModal(cam.id)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Plus size={14} color={T.textSec} />
                    </button>
                  )}
                  <button onClick={() => deleteCamera(cam.id)} style={{ background: T.accentSoft, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={14} color={T.accent} />
                  </button>
                </div>
              </div>
              {cam.backs.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  {cam.backs.map(b => {
                    const backFilm = data.films.find(f => f.state === "loaded" && f.cameraId === cam.id && f.backId === b.id);
                    return (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, color: T.textSec, fontFamily: FONT.body }}>{b.name}</span>
                          {b.ref && <span style={{ fontSize: 11, color: T.textMuted, fontFamily: FONT.mono, marginLeft: 8 }}>{b.ref}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {backFilm && <Badge color={T.green}>{filmName(backFilm)}</Badge>}
                          <button onClick={() => setEditBack({ camId: cam.id, back: { ...b } })} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <Edit3 size={12} color={T.textMuted} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {loadedFilms.length > 0 && cam.backs.length === 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  {loadedFilms.map(f => (
                    <div key={f.id} style={{ fontSize: 13, color: T.green, fontFamily: FONT.body }}>
                      {filmName(f)} — ISO {f.shootIso}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
        {data.cameras.length === 0 && (
          <EmptyState icon={Camera} title="Aucun appareil" subtitle="Ajoute tes boîtiers pour commencer" />
        )}
      </div>

      {/* Add camera modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nouvel appareil">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Nom du boîtier" value={newCam.name} onChange={v => setNewCam({ ...newCam, name: v })} placeholder="Ex: Canon A-1" />
          <Select label="Format" value={newCam.format} onChange={v => setNewCam({ ...newCam, format: v })}
            options={[{ value: "35mm", label: "35mm" }, { value: "120", label: "Moyen format (120)" }, { value: "Instant", label: "Instant" }]} />
          <Toggle label="Dos interchangeable" checked={newCam.hasInterchangeableBack} onChange={v => setNewCam({ ...newCam, hasInterchangeableBack: v })} />
          <Btn onClick={addCamera} disabled={!newCam.name} style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={16} /> Ajouter
          </Btn>
        </div>
      </Modal>

      {/* Edit camera modal */}
      <Modal open={!!editCam} onClose={() => setEditCam(null)} title="Modifier l'appareil">
        {editCam && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nom du boîtier" value={editCam.name} onChange={v => setEditCam({ ...editCam, name: v })} />
            <Select label="Format" value={editCam.format} onChange={v => setEditCam({ ...editCam, format: v })}
              options={[{ value: "35mm", label: "35mm" }, { value: "120", label: "Moyen format (120)" }, { value: "Instant", label: "Instant" }]} />
            <Toggle label="Dos interchangeable" checked={editCam.hasInterchangeableBack || false} onChange={v => setEditCam({ ...editCam, hasInterchangeableBack: v })} />
            <Btn onClick={saveEditCamera} disabled={!editCam.name} style={{ width: "100%", justifyContent: "center" }}>
              <Check size={16} /> Enregistrer
            </Btn>
          </div>
        )}
      </Modal>

      {/* Add back modal */}
      <Modal open={!!showBackModal} onClose={() => setShowBackModal(null)} title="Ajouter un dos">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Nom du dos" value={newBack.name} onChange={v => setNewBack({ ...newBack, name: v })} placeholder="Ex: A12 — Couleur" />
          <Input label="Référence" value={newBack.ref} onChange={v => setNewBack({ ...newBack, ref: v })} placeholder="Ex: A12" />
          <Btn onClick={() => addBack(showBackModal)} disabled={!newBack.name} style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={16} /> Ajouter le dos
          </Btn>
        </div>
      </Modal>

      {/* Edit back modal */}
      <Modal open={!!editBack} onClose={() => setEditBack(null)} title="Modifier le dos">
        {editBack && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nom du dos" value={editBack.back.name} onChange={v => setEditBack({ ...editBack, back: { ...editBack.back, name: v } })} />
            <Input label="Référence" value={editBack.back.ref} onChange={v => setEditBack({ ...editBack, back: { ...editBack.back, ref: v } })} />
            <Btn onClick={saveEditBack} disabled={!editBack.back.name} style={{ width: "100%", justifyContent: "center" }}>
              <Check size={16} /> Enregistrer
            </Btn>
            <Btn variant="danger" onClick={() => deleteBack(editBack.camId, editBack.back.id)} style={{ width: "100%", justifyContent: "center" }}>
              <Trash2 size={14} /> Supprimer ce dos
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── STATS SCREEN ───────────────────────────────────────
function StatsScreen({ data }) {
  const { films } = data;
  const allShot = films.filter(f => ["exposed", "developed", "loaded", "partial"].includes(f.state));
  const developed = films.filter(f => f.state === "developed");
  const stock = films.filter(f => f.state === "stock");

  const byType = {};
  const byBrand = {};
  const byFormat = {};
  const byCamera = {};
  const totalSpent = films.reduce((s, f) => s + (f.price || 0), 0);

  films.forEach(f => {
    byType[filmType(f)] = (byType[filmType(f)] || 0) + 1;
    byBrand[filmBrand(f)] = (byBrand[filmBrand(f)] || 0) + 1;
    byFormat[f.format || "?"] = (byFormat[f.format || "?"] || 0) + 1;
  });

  allShot.forEach(f => {
    if (f.cameraId) {
      const cam = data.cameras.find(c => c.id === f.cameraId);
      const name = cam?.name || "Inconnu";
      byCamera[name] = (byCamera[name] || 0) + 1;
    }
  });

  const topFilms = {};
  allShot.forEach(f => {
    const name = filmName(f);
    topFilms[name] = (topFilms[name] || 0) + 1;
  });
  const topFilmsSorted = Object.entries(topFilms).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const BarChart = ({ data: chartData, color = T.accent }) => {
    const max = Math.max(...Object.values(chartData), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(chartData).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: T.textSec, fontFamily: FONT.body, minWidth: 80, textAlign: "right" }}>{k}</span>
            <div style={{ flex: 1, height: 22, background: T.surfaceAlt, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(v / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 6, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 13, fontFamily: FONT.mono, color: T.text, minWidth: 24, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    );
  };

  if (films.length === 0) {
    return <EmptyState icon={BarChart3} title="Pas encore de stats" subtitle="Ajoute des pellicules pour voir tes statistiques" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontFamily: FONT.display, fontSize: 24, color: T.text, margin: 0, fontStyle: "italic" }}>Statistiques</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard icon={Film} label="Total pellicules" value={films.length} color={T.blue} />
        <StatCard icon={Eye} label="Shootées" value={allShot.length} color={T.green} />
        <StatCard icon={Archive} label="Développées" value={developed.length} color={T.textSec} />
        <StatCard icon={Hash} label="Dépensé" value={`${totalSpent.toFixed(0)}€`} color={T.amber} />
      </div>

      <Card>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: FONT.body, marginBottom: 12, display: "block" }}>Par type</span>
        <BarChart data={byType} color={T.accent} />
      </Card>

      <Card>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: FONT.body, marginBottom: 12, display: "block" }}>Par marque</span>
        <BarChart data={byBrand} color={T.blue} />
      </Card>

      <Card>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: FONT.body, marginBottom: 12, display: "block" }}>Par format</span>
        <BarChart data={byFormat} color={T.green} />
      </Card>

      {Object.keys(byCamera).length > 0 && (
        <Card>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: FONT.body, marginBottom: 12, display: "block" }}>Par appareil</span>
          <BarChart data={byCamera} color={T.amber} />
        </Card>
      )}

      {topFilmsSorted.length > 0 && (
        <Card>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: FONT.body, marginBottom: 12, display: "block" }}>Films favoris</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topFilmsSorted.map(([name, count], i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, fontFamily: FONT.mono, fontWeight: 700, color: i === 0 ? T.accent : T.textMuted, minWidth: 28 }}>#{i + 1}</span>
                <span style={{ fontSize: 13, color: T.text, fontFamily: FONT.body, flex: 1 }}>{name}</span>
                <span style={{ fontSize: 14, fontFamily: FONT.mono, fontWeight: 600, color: T.textSec }}>{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════
export default function FilmVaultApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [persistent, setPersistent] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Wrap setData to auto-save
  const updateData = useCallback(async (newData) => {
    setData(newData);
    if (storageAvailable) {
      setSaveStatus("saving");
      const ok = await saveData(newData);
      setSaveStatus(ok ? "saved" : "error");
      if (ok) setTimeout(() => setSaveStatus(null), 2000);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasStorage = await checkStorage();
      if (cancelled) return;
      setPersistent(hasStorage);
      if (hasStorage) {
        const saved = await loadData();
        if (!cancelled) setData(saved && Array.isArray(saved.films) ? saved : getInitialData());
      } else {
        setData(getInitialData());
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Loader2 size={24} color={T.accent} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 12, color: T.textMuted, fontFamily: FONT.body }}>Chargement des données…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const tabs = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "stock", icon: Film, label: "Pellicules" },
    { key: "cameras", icon: Camera, label: "Appareils" },
    { key: "stats", icon: BarChart3, label: "Stats" },
  ];

  const renderScreen = () => {
    switch (screen) {
      case "home": return <DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
      case "stock": return <StockScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
      case "addFilm": return <AddFilmScreen data={data} setData={updateData} setScreen={setScreen} />;
      case "filmDetail": return <FilmDetailScreen data={data} setData={updateData} setScreen={setScreen} filmId={selectedFilm} />;
      case "cameras": return <CamerasScreen data={data} setData={updateData} setScreen={setScreen} />;
      case "stats": return <StatsScreen data={data} />;
      default: return <DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
    }
  };

  const showTabBar = !["addFilm", "filmDetail"].includes(screen);

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text, fontFamily: FONT.body,
      maxWidth: 480, margin: "0 auto", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, button { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      <div style={{ padding: "20px 16px", paddingBottom: showTabBar ? 80 : 20 }}>
        {renderScreen()}
      </div>

      {/* Save status toast */}
      {saveStatus === "saved" && (
        <div style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          background: T.green, color: "#fff", padding: "6px 16px", borderRadius: 20,
          fontSize: 12, fontFamily: FONT.body, fontWeight: 600, zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}>
          <Check size={12} style={{ marginRight: 4, verticalAlign: -2 }} /> Sauvegardé
        </div>
      )}

      {/* Mode indicator */}
      <div style={{
        position: "fixed", top: 6, right: 8, zIndex: 200,
        fontSize: 9, fontFamily: FONT.mono,
        color: persistent ? T.green : T.amber, opacity: 0.6,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: 5, background: persistent ? T.green : T.amber }} />
        {persistent ? "sync" : "session"}
      </div>

      {showTabBar && (
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: T.surface, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-around", padding: "10px 0 18px",
          zIndex: 100,
        }}>
          {tabs.map(t => {
            const active = screen === t.key;
            return (
              <button key={t.key} onClick={() => setScreen(t.key)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
              }}>
                <t.icon size={20} color={active ? T.accent : T.textMuted} strokeWidth={active ? 2.5 : 1.5} />
                <span style={{
                  fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: FONT.body,
                  color: active ? T.accent : T.textMuted,
                }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

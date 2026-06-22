import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Layers, Cpu, Waves,
  Disc3, Drum, Guitar, Skull, Flame, Compass,
  Pencil, Trash2, Plus, Star, Eye, EyeOff, Wand2, type LucideIcon,
} from "lucide-react";
import { api, type PricingItem } from "@/lib/api";

const ICON_MAP: Record<string, LucideIcon> = {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Layers, Cpu, Waves,
  Disc3, Drum, Guitar, Skull, Flame, Compass,
};

const COLOR_OPTIONS = [
  { label: "Purple",  value: "from-purple-500/20 to-primary/5" },
  { label: "Blue",    value: "from-blue-500/20 to-accent/5" },
  { label: "Cyan",    value: "from-cyan-500/20 to-cyan-900/5" },
  { label: "Pink",    value: "from-pink-500/20 to-pink-900/5" },
  { label: "Emerald", value: "from-emerald-500/20 to-emerald-900/5" },
  { label: "Orange",  value: "from-orange-500/20 to-orange-900/5" },
  { label: "Red",     value: "from-red-500/20 to-red-900/5" },
  { label: "Yellow",  value: "from-yellow-500/20 to-yellow-900/5" },
];

const COLOR_BG: Record<string, string> = {
  "from-purple-500/20 to-primary/5":     "bg-purple-500/40",
  "from-blue-500/20 to-accent/5":        "bg-blue-500/40",
  "from-cyan-500/20 to-cyan-900/5":      "bg-cyan-500/40",
  "from-pink-500/20 to-pink-900/5":      "bg-pink-500/40",
  "from-emerald-500/20 to-emerald-900/5":"bg-emerald-500/40",
  "from-orange-500/20 to-orange-900/5":  "bg-orange-500/40",
  "from-red-500/20 to-red-900/5":        "bg-red-500/40",
  "from-yellow-500/20 to-yellow-900/5":  "bg-yellow-500/40",
};

type FormData = Omit<PricingItem, "id" | "createdAt" | "updatedAt">;

const BLANK: FormData = {
  iconName: "Music2", title: "", subtitle: "", price: "",
  priceUnit: "", description: "", features: "[]",
  colorClass: "from-purple-500/20 to-primary/5",
  popular: false, sortOrder: 0, active: true,
};

// Presets — shown as quick-start templates in admin; never shown on the live site
const PRESETS: Array<FormData & { label: string }> = [
  {
    label: "Single Track",
    iconName: "Music2", title: "Single Track", subtitle: "Perfect for artists",
    price: "$150", priceUnit: "per track",
    description: "Full production of one original track from concept to delivery.",
    features: JSON.stringify(["Up to 4 minutes", "Stems included", "2 revisions", "WAV + MP3 delivery"]),
    colorClass: "from-purple-500/20 to-primary/5", popular: false, sortOrder: 1, active: true,
  },
  {
    label: "EP Bundle",
    iconName: "Disc3", title: "EP Bundle", subtitle: "Best value",
    price: "$400", priceUnit: "for 3 tracks",
    description: "Three fully produced tracks with cohesive sound design and mastering.",
    features: JSON.stringify(["3 original tracks", "Stems for all tracks", "4 revisions", "Mastering included", "Commercial license"]),
    colorClass: "from-blue-500/20 to-accent/5", popular: true, sortOrder: 2, active: true,
  },
  {
    label: "Game Soundtrack",
    iconName: "Gamepad2", title: "Game Soundtrack", subtitle: "For developers",
    price: "Custom", priceUnit: "project-based",
    description: "Adaptive music system and full soundtrack for indie and AA game projects.",
    features: JSON.stringify(["Unlimited tracks", "Adaptive/layered audio", "Sound design FX", "Unlimited revisions", "Full source files", "Dedicated support"]),
    colorClass: "from-cyan-500/20 to-cyan-900/5", popular: false, sortOrder: 3, active: true,
  },
  {
    label: "Mixing & Mastering",
    iconName: "SlidersHorizontal", title: "Mix & Master", subtitle: "Polish your sound",
    price: "$80", priceUnit: "per track",
    description: "Professional mixing and mastering for tracks you've already recorded.",
    features: JSON.stringify(["Full mix + master", "Streaming-ready loudness", "2 revisions", "24-bit WAV delivery"]),
    colorClass: "from-emerald-500/20 to-emerald-900/5", popular: false, sortOrder: 4, active: true,
  },
  {
    label: "Sound Design Pack",
    iconName: "Waves", title: "Sound Design Pack", subtitle: "Custom SFX",
    price: "$200", priceUnit: "per pack",
    description: "Custom sound effects and audio assets designed for your game, film, or brand.",
    features: JSON.stringify(["20–50 custom SFX", "WAV format", "Categorised delivery", "Commercial license"]),
    colorClass: "from-orange-500/20 to-orange-900/5", popular: false, sortOrder: 5, active: true,
  },
  {
    label: "Film Score",
    iconName: "Film", title: "Film Score", subtitle: "Cinematic",
    price: "Custom", priceUnit: "project-based",
    description: "Original orchestral or hybrid score for short films, trailers, and indie features.",
    features: JSON.stringify(["Full orchestration", "Stems & cue sheets", "Sync license", "Unlimited revisions"]),
    colorClass: "from-pink-500/20 to-pink-900/5", popular: false, sortOrder: 6, active: true,
  },
];

function parsedFeatures(raw: string): string[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return raw.split("\n").filter(Boolean); }
}

function Toggle({ on, onChange, label, color = "purple" }: { on: boolean; onChange: () => void; label: string; color?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
      <div className={`w-10 h-5 rounded-full transition-colors relative ${on ? (color === "purple" ? "bg-purple-600" : "bg-green-600") : "bg-white/10"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "left-5" : "left-0.5"}`} />
      </div>
      <span className="text-white/60 text-sm">{label}</span>
    </label>
  );
}

function PricingForm({
  initial, onSave, onCancel, saving,
}: { initial: FormData; onSave: (d: FormData) => void; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState<FormData>({ ...BLANK, ...initial });
  const [featuresText, setFeaturesText] = useState(
    () => parsedFeatures(initial.features).join("\n")
  );

  function set(key: keyof FormData, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleFeaturesChange(val: string) {
    setFeaturesText(val);
    const lines = val.split("\n").map((l) => l.trim()).filter(Boolean);
    set("features", JSON.stringify(lines));
  }

  return (
    <div className="space-y-5 p-5 bg-white/5 rounded-xl border border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-white/50 text-xs mb-1.5 block">Title *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Single Track"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-white/50 text-xs mb-1.5 block">Subtitle</label>
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
            placeholder="e.g. Best value"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Price *</label>
          <input value={form.price} onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. $150 or Custom"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Price Unit</label>
          <input value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)}
            placeholder="e.g. per track"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={2} placeholder="Short description of what's included"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm resize-none" />
        </div>
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1.5 block">
            Features <span className="text-white/25 normal-case font-normal">(one per line)</span>
          </label>
          <textarea value={featuresText} onChange={(e) => handleFeaturesChange(e.target.value)}
            rows={5} placeholder={"Stems included\n2 revisions\nWAV + MP3 delivery"}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm resize-none font-mono" />
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ICON_MAP).map(([name, Icon]) => (
            <button key={name} type="button" onClick={() => set("iconName", name)} title={name}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                form.iconName === name
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white"
              }`}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Color Theme</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button key={c.value} type="button" onClick={() => set("colorClass", c.value)} title={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${COLOR_BG[c.value] ?? "bg-white/20"} ${
                form.colorClass === c.value ? "border-white scale-125" : "border-transparent hover:scale-110"
              }`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle on={form.active} onChange={() => set("active", !form.active)} label="Active" />
          <Toggle on={!!form.popular} onChange={() => set("popular", !form.popular)} label="Popular" color="yellow" />
        </div>
        <div className="flex items-center gap-2">
          <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-purple-500 text-center" />
          <span className="text-white/30 text-xs">sort</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.price}
          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {saving ? "Saving..." : "Save Pricing Card"}
        </button>
        <button onClick={onCancel} className="px-4 text-white/40 hover:text-white text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PricingTab() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingPreset, setAddingPreset] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  function refresh() {
    api.getPricing(true)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    // Load current visibility setting
    api.getSettings().then((s) => {
      setSectionVisible(s.pricingVisible !== "false");
    }).catch(() => {});
  }, []);

  async function toggleVisibility() {
    const next = !sectionVisible;
    setSectionVisible(next);
    setSavingVisibility(true);
    try {
      await api.updateSettings({ pricingVisible: next ? "true" : "false" });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    } catch {
      setSectionVisible(!next); // revert on error
    } finally {
      setSavingVisibility(false);
    }
  }

  async function handleCreate(data: FormData) {
    setSaving(true);
    try {
      await api.createPricingItem(data);
      setAdding(false);
      setAddingPreset(null);
      refresh();
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: number, data: FormData) {
    setSaving(true);
    try {
      await api.updatePricingItem(id, data);
      setEditingId(null);
      refresh();
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this pricing card?")) return;
    await api.deletePricingItem(id);
    refresh();
    queryClient.invalidateQueries({ queryKey: ["pricing"] });
  }

  function usePreset(preset: FormData) {
    setAddingPreset({ ...preset });
    setAdding(false);
    setShowPresets(false);
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Pricing Cards</h2>
          <p className="text-white/40 text-sm">Manage the pricing tiers shown on your site.</p>
        </div>
        <div className="flex items-center gap-2">
          {!adding && !addingPreset && (
            <>
              <button
                onClick={() => { setShowPresets((v) => !v); setAdding(false); setAddingPreset(null); }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 rounded-lg text-sm transition-colors"
                title="Start from a preset"
              >
                <Wand2 size={14} /> Presets
              </button>
              <button onClick={() => { setAdding(true); setShowPresets(false); setAddingPreset(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-sm transition-colors">
                <Plus size={15} /> Add Card
              </button>
            </>
          )}
        </div>
      </div>

      {/* Show/hide section toggle */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          {sectionVisible ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-white/30" />}
          <div>
            <p className="text-white text-sm font-medium">Pricing section on live site</p>
            <p className="text-white/30 text-xs">{sectionVisible ? "Visible to visitors" : "Hidden from visitors"}</p>
          </div>
        </div>
        <button
          onClick={toggleVisibility}
          disabled={savingVisibility}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 ${
            sectionVisible
              ? "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              : "bg-white/5 text-white/40 border border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
          }`}
        >
          {savingVisibility ? "Saving..." : sectionVisible ? "Hide Section" : "Show Section"}
        </button>
      </div>

      {/* Presets panel */}
      {showPresets && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-widest font-mono mb-3">Quick-start presets</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const Icon = ICON_MAP[preset.iconName] ?? Music2;
              return (
                <button
                  key={preset.label}
                  onClick={() => usePreset(preset)}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-lg text-left transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${preset.colorClass}`}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-purple-300 transition-colors">{preset.label}</p>
                    <p className="text-white/30 text-xs">{preset.price} {preset.priceUnit}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowPresets(false)} className="text-white/25 hover:text-white text-xs transition-colors mt-1">
            Cancel
          </button>
        </div>
      )}

      {/* Add from preset form */}
      {addingPreset && (
        <div>
          <p className="text-white/30 text-xs font-mono mb-3 uppercase tracking-wider">Editing preset — customise before saving</p>
          <PricingForm
            initial={addingPreset}
            onSave={handleCreate}
            onCancel={() => setAddingPreset(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Blank add form */}
      {adding && (
        <PricingForm initial={BLANK} onSave={handleCreate} onCancel={() => setAdding(false)} saving={saving} />
      )}

      {/* Existing cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = ICON_MAP[item.iconName] ?? Music2;
          if (editingId === item.id) {
            return (
              <PricingForm key={item.id} initial={item}
                onSave={(d) => handleUpdate(item.id, d)}
                onCancel={() => setEditingId(null)} saving={saving} />
            );
          }
          return (
            <div key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                item.active ? "bg-white/5 border-white/10" : "bg-white/2 border-white/5 opacity-50"
              }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.colorClass}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{item.title}</p>
                  {item.popular && <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                </div>
                <p className="text-white/40 text-xs">{item.price} {item.priceUnit}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setEditingId(item.id)}
                  className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && !adding && !addingPreset && !showPresets && (
          <div className="text-center py-12 text-white/30 text-sm border border-white/5 rounded-xl space-y-3">
            <p>No pricing cards yet.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowPresets(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs transition-colors hover:bg-purple-600/30">
                <Wand2 size={12} /> Start from a preset
              </button>
              <button onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/50 border border-white/10 rounded-lg text-xs transition-colors hover:bg-white/10">
                <Plus size={12} /> Blank card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

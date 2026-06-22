import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Layers, Cpu, Waves,
  Disc3, Drum, Guitar, Skull, Flame, Compass,
  Pencil, Trash2, Plus, Star, type LucideIcon,
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

function parsedFeatures(raw: string): string[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return raw.split("\n").filter(Boolean); }
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
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set("active", !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? "bg-purple-600" : "bg-white/10"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-white/60 text-sm">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set("popular", !form.popular)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.popular ? "bg-yellow-500" : "bg-white/10"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.popular ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-white/60 text-sm">Popular</span>
          </label>
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
  const [saving, setSaving] = useState(false);

  function refresh() {
    api.getPricing(true)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useState(() => { refresh(); });

  async function handleCreate(data: FormData) {
    setSaving(true);
    try {
      await api.createPricingItem(data);
      setAdding(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Pricing Cards</h2>
          <p className="text-white/40 text-sm">Manage the pricing tiers shown on your site.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-sm transition-colors">
            <Plus size={15} /> Add Card
          </button>
        )}
      </div>

      {adding && (
        <PricingForm initial={BLANK} onSave={handleCreate} onCancel={() => setAdding(false)} saving={saving} />
      )}

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
        {items.length === 0 && !adding && (
          <div className="text-center py-12 text-white/30 text-sm border border-white/5 rounded-xl">
            No pricing cards yet. Click "Add Card" to create your first.
          </div>
        )}
      </div>
    </div>
  );
}

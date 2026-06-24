import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Star, Layers, Cpu, Waves,
  Disc3, BookOpen, Drum, Podcast, Guitar, Pencil, Trash2, Plus, GripVertical,
  Eye, EyeOff,
  type LucideIcon
} from "lucide-react";
import { api, type Service } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, LucideIcon> = {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Star, Layers, Cpu, Waves,
  Disc3, BookOpen, Drum, Podcast, Guitar,
};

const COLOR_OPTIONS = [
  { label: "Purple", value: "from-purple-500/20 to-primary/5" },
  { label: "Blue", value: "from-blue-500/20 to-accent/5" },
  { label: "Pink", value: "from-pink-500/20 to-pink-900/5" },
  { label: "Emerald", value: "from-emerald-500/20 to-emerald-900/5" },
  { label: "Orange", value: "from-orange-500/20 to-orange-900/5" },
  { label: "Cyan", value: "from-cyan-500/20 to-cyan-900/5" },
  { label: "Red", value: "from-red-500/20 to-red-900/5" },
  { label: "Yellow", value: "from-yellow-500/20 to-yellow-900/5" },
];

const COLOR_BG: Record<string, string> = {
  "from-purple-500/20 to-primary/5": "bg-purple-500/30",
  "from-blue-500/20 to-accent/5": "bg-blue-500/30",
  "from-pink-500/20 to-pink-900/5": "bg-pink-500/30",
  "from-emerald-500/20 to-emerald-900/5": "bg-emerald-500/30",
  "from-orange-500/20 to-orange-900/5": "bg-orange-500/30",
  "from-cyan-500/20 to-cyan-900/5": "bg-cyan-500/30",
  "from-red-500/20 to-red-900/5": "bg-red-500/30",
  "from-yellow-500/20 to-yellow-900/5": "bg-yellow-500/30",
};

const BLANK: Omit<Service, "id" | "createdAt" | "updatedAt"> = {
  iconName: "Music2", title: "", description: "",
  colorClass: "from-purple-500/20 to-primary/5",
  sortOrder: 0, active: true,
};

function ServiceForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Partial<Service>;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...BLANK, ...initial });

  function set(key: string, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1.5 block">Title *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Service name"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="What this service includes..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 text-sm resize-none"
          />
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ICON_MAP).map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => set("iconName", name)}
              title={name}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                form.iconName === name
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Color Theme</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => set("colorClass", c.value)}
              title={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${COLOR_BG[c.value] ?? "bg-white/20"} ${
                form.colorClass === c.value ? "border-white scale-125" : "border-transparent hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => set("active", !form.active)}
            className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? "bg-purple-600" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-white/60 text-sm">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-purple-500 text-center"
          />
          <span className="text-white/30 text-xs">sort</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title}
          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Service"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 text-white/40 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ServicesTab() {
  const queryClient = useQueryClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function refresh() {
    api.getServices(true)
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    api.getSettings().then((s) => setSectionVisible(s.servicesVisible !== "false")).catch(() => {});
  }, []);

  async function toggleVisibility() {
    const next = !sectionVisible;
    setSectionVisible(next);
    setSavingVisibility(true);
    try {
      await api.updateSettings({ servicesVisible: next ? "true" : "false" });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    } catch { setSectionVisible(!next); }
    finally { setSavingVisibility(false); }
  }

  async function handleCreate(data: Partial<Service>) {
    setSaving(true);
    try {
      await api.createService(data);
      setAdding(false);
      refresh();
      queryClient.invalidateQueries({ queryKey: ["services"] });
    } catch (e) { toast({ title: "Error saving service", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: number, data: Partial<Service>) {
    setSaving(true);
    try {
      await api.updateService(id, data);
      setEditingId(null);
      refresh();
      queryClient.invalidateQueries({ queryKey: ["services"] });
    } catch (e) { toast({ title: "Error saving service", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    await api.deleteService(id);
    setConfirmId(null);
    refresh();
    queryClient.invalidateQueries({ queryKey: ["services"] });
  }

  async function toggleActive(svc: Service) {
    await api.updateService(svc.id, { active: !svc.active });
    refresh();
    queryClient.invalidateQueries({ queryKey: ["services"] });
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
          <h2 className="text-lg font-semibold text-white mb-1">Services</h2>
          <p className="text-white/40 text-sm">Manage the service cards shown on your portfolio.</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-sm transition-colors"
          >
            <Plus size={15} /> Add Service
          </button>
        )}
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          {sectionVisible ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-white/30" />}
          <div>
            <p className="text-white text-sm font-medium">Services section on live site</p>
            <p className="text-white/30 text-xs">{sectionVisible ? "Visible to visitors" : "Hidden from visitors"}</p>
          </div>
        </div>
        <button onClick={toggleVisibility} disabled={savingVisibility}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 ${
            sectionVisible
              ? "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              : "bg-white/5 text-white/40 border border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
          }`}>
          {savingVisibility ? "Saving..." : sectionVisible ? "Hide Section" : "Show Section"}
        </button>
      </div>

      {adding && (
        <ServiceForm
          initial={BLANK}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      <div className="space-y-3">
        {services.map((svc) => {
          const Icon = ICON_MAP[svc.iconName] ?? Music2;
          if (editingId === svc.id) {
            return (
              <ServiceForm
                key={svc.id}
                initial={svc}
                onSave={(data) => handleUpdate(svc.id, data)}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            );
          }
          return (
            <div
              key={svc.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                svc.active ? "bg-white/5 border-white/10" : "bg-white/2 border-white/5 opacity-50"
              }`}
            >
              <GripVertical size={16} className="text-white/20 flex-shrink-0 cursor-grab" />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${svc.colorClass}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{svc.title}</p>
                <p className="text-white/40 text-xs truncate">{svc.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(svc)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${svc.active ? "bg-purple-600" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${svc.active ? "left-4" : "left-0.5"}`} />
                </button>
                <button
                  onClick={() => setEditingId(svc.id)}
                  className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Pencil size={14} />
                </button>
                {confirmId === svc.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(svc.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium">
                      Delete
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(svc.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {services.length === 0 && !adding && (
          <div className="text-center py-12 text-white/30 text-sm border border-white/5 rounded-xl">
            No services yet. Click "Add Service" to create your first.
          </div>
        )}
      </div>
    </div>
  );
}

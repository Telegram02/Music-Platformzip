import { useState, useEffect } from "react";
import { api, uploadFile, storageUrl, type AudioTrack } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";
import { Trash2, Edit2, Plus, X, Check, Pin, PinOff } from "lucide-react";
import { Music2 } from "lucide-react";
import { GENRE_ICON_MAP, GENRE_ICON_GROUPS } from "@/lib/genreIcons";
import { toast } from "@/hooks/use-toast";

// ── Preset accent colors ──────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  { label: "Purple (default)", value: "" },
  { label: "Cyan",    value: "#22d3ee" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Red",     value: "#ef4444" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Orange",  value: "#f97316" },
  { label: "White",   value: "#ffffff" },
];

const ICON_COLOR_PRESETS = [
  { label: "Auto (matches genre)", value: "" },
  { label: "Purple",  value: "#a855f7" },
  { label: "Cyan",    value: "#22d3ee" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Red",     value: "#ef4444" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "White",   value: "#ffffff" },
];

function ColorSwatchPicker({
  label, presets, value, onChange,
}: { label: string; presets: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-white/50 text-xs">{label}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = value === p.value;
          return (
            <button
              key={p.label}
              type="button"
              title={p.label}
              onClick={() => onChange(p.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                active
                  ? "border-white/40 bg-white/15 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white"
              }`}
            >
              {p.value ? (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
                  style={{ background: p.value }}
                />
              ) : (
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 border border-white/20" />
              )}
              {p.label}
            </button>
          );
        })}
        {/* Custom hex */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5">
          <label className="text-white/40 text-xs">Custom</label>
          <input
            type="color"
            value={value || "#9333ea"}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
          />
        </div>
      </div>
    </div>
  );
}

function GenreIconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div className="space-y-2">
      {GENRE_ICON_GROUPS.map((group) => (
        <div key={group.label}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${group.borderColor} ${group.bgColor}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider w-20 flex-shrink-0 ${group.textColor}`}>
            {group.label}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {group.icons.map(({ name, icon: Icon }) => (
              <button key={name} type="button" title={name} onClick={() => onChange(name)}
                className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
                  value === name
                    ? `${group.activeBorder} ${group.activeBg} ${group.textColor}`
                    : "border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white"
                }`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const CARD_STYLES = [
  {
    value: "default",
    label: "Default",
    desc: "Standard square card",
    preview: (
      <svg viewBox="0 0 48 36" className="w-12 h-9">
        <rect x="1" y="1" width="46" height="34" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <rect x="6" y="6" width="12" height="12" rx="2" fill="rgba(255,255,255,0.1)"/>
        <rect x="22" y="7" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.3)"/>
        <rect x="22" y="12" width="14" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
        <rect x="6" y="24" width="28" height="2" rx="1" fill="rgba(147,51,234,0.5)"/>
        <rect x="6" y="28" width="12" height="2" rx="1" fill="rgba(147,51,234,0.3)"/>
      </svg>
    ),
  },
  {
    value: "featured",
    label: "Featured",
    desc: "Wide 2-column card with large artwork",
    preview: (
      <svg viewBox="0 0 96 36" className="w-24 h-9">
        <rect x="1" y="1" width="94" height="34" rx="3" fill="rgba(147,51,234,0.08)" stroke="rgba(147,51,234,0.4)" strokeWidth="1.5"/>
        <rect x="2" y="1" width="24" height="34" rx="2" fill="rgba(147,51,234,0.15)"/>
        <text x="14" y="22" fontSize="14" textAnchor="middle" fill="rgba(147,51,234,0.8)">♪</text>
        <rect x="30" y="7" width="30" height="3" rx="1" fill="rgba(255,255,255,0.4)"/>
        <rect x="30" y="13" width="20" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>
        <rect x="30" y="22" width="40" height="2" rx="1" fill="rgba(147,51,234,0.5)"/>
        <rect x="30" y="26" width="16" height="2" rx="1" fill="rgba(147,51,234,0.3)"/>
        <circle cx="82" cy="25" r="6" fill="rgba(147,51,234,0.6)"/>
        <rect x="1" y="1" width="94" height="2" rx="1" fill="rgba(147,51,234,0.6)"/>
      </svg>
    ),
  },
] as const;

const empty = (): Partial<AudioTrack> => ({
  title: "", description: "", genre: "", iconName: "Music2",
  audioUrl: "", coverUrl: "", sortOrder: 0, active: true,
  pinned: false, accentColor: "", iconColor: "", cardStyle: "default",
});

export default function TracksTab() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [editing, setEditing] = useState<Partial<AudioTrack> | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function load() {
    const data = await api.getTracks(true);
    setTracks(data);
  }

  useEffect(() => { load(); }, []);

  function startNew() { setEditing(empty()); setEditingId(null); }
  function startEdit(t: AudioTrack) { setEditing({ ...t }); setEditingId(t.id); }
  function cancelEdit() { setEditing(null); setEditingId(null); }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editingId) { await api.updateTrack(editingId, editing); }
      else { await api.createTrack(editing); }
      cancelEdit();
      await load();
      toast({ title: editingId ? "Track updated" : "Track created" });
    } catch (e) {
      toast({ title: "Error saving track", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    await api.deleteTrack(id);
    setConfirmId(null);
    await load();
    toast({ title: "Track deleted" });
  }

  async function togglePin(t: AudioTrack) {
    await api.updateTrack(t.id, { ...t, pinned: !t.pinned });
    await load();
  }

  function set(key: keyof AudioTrack, value: string | number | boolean) {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  const sortedTracks = [...tracks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Audio Tracks</h2>
          <p className="text-white/40 text-sm">Manage demo tracks shown in your portfolio.</p>
        </div>
        {!editing && (
          <button onClick={startNew}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Add Track
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6 space-y-5">
          <h3 className="text-white font-semibold">{editingId ? "Edit Track" : "New Track"}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              ["title", "Title", "text"],
              ["genre", "Genre Label", "text"],
              ["sortOrder", "Sort Order", "number"],
            ] as [keyof AudioTrack, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-white/50 text-xs mb-1">{label}</label>
                <input type={type} value={String(editing[key] ?? "")}
                  onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition-all" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-xs mb-1">Description</label>
              <textarea value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition-all resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2">
              Genre Icon <span className="text-white/25">(shown when no cover art)</span>
            </label>
            <GenreIconPicker value={editing.iconName ?? "Music2"} onChange={(name) => set("iconName", name)} />
          </div>

          {/* Card style */}
          <div className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/3">
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Card Style</p>
            <div className="flex flex-wrap gap-3">
              {CARD_STYLES.map((s) => {
                const active = (editing.cardStyle ?? "default") === s.value;
                return (
                  <button key={s.value} type="button" onClick={() => set("cardStyle", s.value)}
                    className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all ${
                      active
                        ? "border-purple-500/60 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}>
                    {s.preview}
                    <div className="text-left">
                      <p className={`text-xs font-medium ${active ? "text-purple-300" : "text-white/70"}`}>{s.label}</p>
                      <p className="text-[10px] text-white/30 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color customization */}
          <div className="border border-white/10 rounded-xl p-4 space-y-4 bg-white/3">
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Card Colors</p>
            <ColorSwatchPicker
              label="Accent color — card glow, waveform bars, play button"
              presets={ACCENT_PRESETS}
              value={editing.accentColor ?? ""}
              onChange={(v) => set("accentColor", v)}
            />
            <ColorSwatchPicker
              label="Icon color — icon tint when no cover art is set"
              presets={ICON_COLOR_PRESETS}
              value={editing.iconColor ?? ""}
              onChange={(v) => set("iconColor", v)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/50 text-xs mb-2">Audio File</label>
              <FileUploader accept="audio/*" label="Upload audio" onUploaded={(path) => set("audioUrl", path)} />
              {editing.audioUrl && <p className="text-purple-400 text-xs mt-1 truncate">Set: {editing.audioUrl}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-2">
                Cover Art <span className="text-white/25">(optional)</span>
              </label>
              <FileUploader accept="image/*" label="Upload cover art" onUploaded={(path) => set("coverUrl", path)} />
              {editing.coverUrl && <p className="text-purple-400 text-xs mt-1 truncate">Set: {editing.coverUrl}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active-track" checked={editing.active ?? true}
                onChange={(e) => set("active", e.target.checked)} className="accent-purple-500" />
              <label htmlFor="active-track" className="text-white/60 text-sm">Active (visible on site)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pinned-track" checked={editing.pinned ?? false}
                onChange={(e) => set("pinned", e.target.checked)} className="accent-yellow-400" />
              <label htmlFor="pinned-track" className="text-white/60 text-sm flex items-center gap-1.5">
                <Pin size={12} className="text-yellow-400" /> Pin to top of list
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              <Check size={16} /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={cancelEdit}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tracks.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No tracks yet. Add your first track.</p>
        )}
        {sortedTracks.map((t) => {
          const Icon = GENRE_ICON_MAP[t.iconName ?? "Music2"] ?? Music2;
          const group = GENRE_ICON_GROUPS.find((g) => g.icons.some((i) => i.name === t.iconName));
          const iconColor = t.iconColor || group?.textColor || "text-purple-300";
          const iconBg = group?.activeBg ?? "bg-purple-500/20";
          const iconBorder = group?.activeBorder ?? "border-purple-500/30";
          const accent = t.accentColor || "#9333ea";
          return (
            <div key={t.id}
              className={`flex items-center gap-4 bg-white/5 border rounded-xl px-5 py-4 transition-all ${
                t.pinned ? "border-yellow-400/30 bg-yellow-400/5" : "border-white/10"
              }`}
              style={t.accentColor ? { borderColor: `${t.accentColor}30` } : {}}>
              {t.coverUrl ? (
                <img src={storageUrl(t.coverUrl)} alt={t.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconBg} ${iconBorder}`}
                  style={t.accentColor ? { borderColor: `${accent}40`, background: `${accent}18` } : {}}>
                  <Icon size={20}
                    className={t.iconColor ? "" : iconColor}
                    style={t.iconColor ? { color: t.iconColor } : {}} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{t.title}</p>
                  {t.pinned && <Pin size={11} className="text-yellow-400 flex-shrink-0" />}
                </div>
                <p className="text-white/40 text-xs">
                  {t.genre}
                  {!t.active && " · Hidden"}
                  {t.accentColor && <span className="ml-1">· <span className="inline-block w-2 h-2 rounded-full align-middle" style={{ background: t.accentColor }} /></span>}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePin(t)} title={t.pinned ? "Unpin" : "Pin to top"}
                  className={`p-2 rounded-lg transition-colors ${
                    t.pinned
                      ? "bg-yellow-400/15 text-yellow-400 hover:bg-yellow-400/25"
                      : "bg-white/5 hover:bg-yellow-400/10 text-white/30 hover:text-yellow-400"
                  }`}>
                  {t.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button onClick={() => startEdit(t)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <Edit2 size={15} />
                </button>
                {confirmId === t.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(t.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium">
                      Delete
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(t.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

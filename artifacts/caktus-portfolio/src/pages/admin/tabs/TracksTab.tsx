import { useState, useEffect } from "react";
import { api, uploadFile, storageUrl, type AudioTrack } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";
import { Trash2, Edit2, Plus, X, Check } from "lucide-react";

const empty = (): Partial<AudioTrack> => ({
  title: "",
  description: "",
  genre: "",
  audioUrl: "",
  coverUrl: "",
  sortOrder: 0,
  active: true,
});

export default function TracksTab() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [editing, setEditing] = useState<Partial<AudioTrack> | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await api.getTracks(true);
    setTracks(data);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(empty());
    setEditingId(null);
  }

  function startEdit(t: AudioTrack) {
    setEditing({ ...t });
    setEditingId(t.id);
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateTrack(editingId, editing);
      } else {
        await api.createTrack(editing);
      }
      cancelEdit();
      await load();
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this track?")) return;
    await api.deleteTrack(id);
    await load();
  }

  function set(key: keyof AudioTrack, value: string | number | boolean) {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Audio Tracks</h2>
          <p className="text-white/40 text-sm">Manage demo tracks shown in your portfolio.</p>
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Track
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold">{editingId ? "Edit Track" : "New Track"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              ["title", "Title", "text"],
              ["genre", "Genre", "text"],
              ["sortOrder", "Sort Order", "number"],
            ] as [keyof AudioTrack, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-white/50 text-xs mb-1">{label}</label>
                <input
                  type={type}
                  value={String(editing[key] ?? "")}
                  onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-xs mb-1">Description</label>
              <textarea
                value={editing.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/50 text-xs mb-2">Audio File</label>
              <FileUploader
                accept="audio/*"
                label="Upload audio"
                onUploaded={(path) => set("audioUrl", path)}
              />
              {editing.audioUrl && (
                <p className="text-purple-400 text-xs mt-1 truncate">Set: {editing.audioUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-2">Cover Image</label>
              <FileUploader
                accept="image/*"
                label="Upload cover art"
                onUploaded={(path) => set("coverUrl", path)}
              />
              {editing.coverUrl && (
                <p className="text-purple-400 text-xs mt-1 truncate">Set: {editing.coverUrl}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-track"
              checked={editing.active ?? true}
              onChange={(e) => set("active", e.target.checked)}
              className="accent-purple-500"
            />
            <label htmlFor="active-track" className="text-white/60 text-sm">Active (visible on site)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              <Check size={16} /> {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tracks.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No tracks yet. Add your first track.</p>
        )}
        {tracks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4"
          >
            {t.coverUrl && (
              <img
                src={storageUrl(t.coverUrl)}
                alt={t.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{t.title}</p>
              <p className="text-white/40 text-xs">{t.genre} {!t.active && "· Hidden"}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => startEdit(t)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

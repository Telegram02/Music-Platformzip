import { useState, useEffect } from "react";
import { api, type SocialLink } from "@/lib/api";
import { Trash2, Plus, Save } from "lucide-react";

const PLATFORMS = ["youtube", "instagram", "soundcloud", "spotify", "tiktok", "twitter", "facebook", "twitch", "discord", "bandcamp", "apple-music", "other"];

const empty = (): Partial<SocialLink> => ({
  platform: "youtube",
  url: "",
  sortOrder: 0,
  active: true,
});

export default function SocialTab() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [newLink, setNewLink] = useState<Partial<SocialLink> | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  async function load() {
    const data = await api.getSocial(true);
    setLinks(data);
  }

  useEffect(() => { load(); }, []);

  function setField(id: number, key: keyof SocialLink, value: string | number | boolean) {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l))
    );
  }

  async function handleUpdate(link: SocialLink) {
    setSaving((prev) => ({ ...prev, [link.id]: true }));
    try {
      await api.updateSocialLink(link.id, link);
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setSaving((prev) => ({ ...prev, [link.id]: false }));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this link?")) return;
    await api.deleteSocialLink(id);
    await load();
  }

  async function handleAdd() {
    if (!newLink) return;
    setAddSaving(true);
    try {
      await api.createSocialLink(newLink);
      setNewLink(null);
      await load();
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setAddSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Social Links</h2>
          <p className="text-white/40 text-sm">Manage links shown in the contact section.</p>
        </div>
        {!newLink && (
          <button
            onClick={() => setNewLink(empty())}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Link
          </button>
        )}
      </div>

      {newLink && (
        <div className="bg-white/5 border border-purple-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">New Social Link</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Platform</label>
              <select
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Sort Order</label>
              <input
                type="number"
                value={newLink.sortOrder ?? 0}
                onChange={(e) => setNewLink({ ...newLink, sortOrder: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-white/50 text-xs mb-1">URL</label>
              <input
                value={newLink.url ?? ""}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={addSaving}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {addSaving ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => setNewLink(null)}
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {links.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No social links yet.</p>
        )}
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm capitalize">{link.platform}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-white/50 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.active}
                    onChange={(e) => setField(link.id, "active", e.target.checked)}
                    className="accent-purple-500"
                  />
                  Active
                </label>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                value={link.url}
                onChange={(e) => setField(link.id, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdate(link)}
                disabled={saving[link.id]}
                className="flex items-center gap-1.5 bg-purple-600/70 hover:bg-purple-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Save size={14} /> {saving[link.id] ? "..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";

const SETTINGS_GROUPS = [
  {
    label: "Hero & Branding",
    keys: [
      { key: "heroBadge", label: "Hero Badge Text", type: "text", placeholder: "Music Producer | Composer | Sound Designer" },
      { key: "tagline", label: "Hero Tagline", type: "text", placeholder: "Cinematic soundtracks..." },
    ],
  },
  {
    label: "About",
    keys: [
      { key: "bio", label: "Bio", type: "textarea", placeholder: "Your professional bio..." },
      { key: "yearsExperience", label: "Years of Experience", type: "text", placeholder: "10" },
    ],
  },
  {
    label: "Contact Info",
    keys: [
      { key: "contactEmail", label: "Contact Email", type: "email", placeholder: "caktusaudio@gmail.com" },
      { key: "discord", label: "Discord Handle", type: "text", placeholder: "caktus#0000" },
      { key: "availability", label: "Availability Message", type: "textarea", placeholder: "Currently accepting projects for Q4..." },
    ],
  },
  {
    label: "SEO & Meta",
    keys: [
      { key: "siteMetaTitle", label: "Page Title (SEO)", type: "text", placeholder: "Caktus Productions — Music Producer & Composer" },
      { key: "siteMetaDescription", label: "Meta Description (SEO)", type: "textarea", placeholder: "Cinematic soundtracks, game audio..." },
    ],
  },
];

export default function SiteTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("Failed to save: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Site Settings</h2>
        <p className="text-white/40 text-sm">Edit core content, SEO, and contact info shown on the portfolio.</p>
      </div>

      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label} className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400/80 border-b border-white/5 pb-2">
            {group.label}
          </h3>
          {group.keys.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-white/60 text-sm mb-1.5 font-medium">{label}</label>
              {type === "textarea" ? (
                <textarea
                  value={settings[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none text-sm"
                />
              ) : (
                <input
                  type={type}
                  value={settings[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400/80 border-b border-white/5 pb-2">
          Media
        </h3>
        <div>
          <label className="block text-white/60 text-sm mb-1.5 font-medium">Background Video URL</label>
          <input
            type="text"
            value={settings.introVideoUrl ?? ""}
            onChange={(e) => handleChange("introVideoUrl", e.target.value)}
            placeholder="/objects/..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
          />
        </div>
        <FileUploader
          accept="video/*"
          label="Upload intro/background video"
          onUploaded={(path) => handleChange("introVideoUrl", path)}
        />
        {settings.introVideoUrl && (
          <p className="text-purple-400 text-xs truncate">Current: {settings.introVideoUrl}</p>
        )}

        <div className="mt-2">
          <label className="block text-white/60 text-sm mb-1.5 font-medium">Hero Background Image URL</label>
          <input
            type="text"
            value={settings.heroImageUrl ?? ""}
            onChange={(e) => handleChange("heroImageUrl", e.target.value)}
            placeholder="/objects/..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
          />
        </div>
        <FileUploader
          accept="image/*"
          label="Upload hero background image"
          onUploaded={(path) => handleChange("heroImageUrl", path)}
        />
        {settings.heroImageUrl && (
          <p className="text-purple-400 text-xs truncate">Current: {settings.heroImageUrl}</p>
        )}
      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

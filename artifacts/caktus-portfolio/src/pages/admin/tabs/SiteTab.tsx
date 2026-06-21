import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";

const SETTINGS_KEYS = [
  { key: "bio", label: "Bio", type: "textarea", placeholder: "Your professional bio..." },
  { key: "tagline", label: "Tagline (Hero subtitle)", type: "text", placeholder: "Cinematic soundtracks..." },
  { key: "yearsExperience", label: "Years of Experience", type: "text", placeholder: "10" },
  { key: "contactEmail", label: "Contact Email", type: "email", placeholder: "caktusaudio@gmail.com" },
  { key: "discord", label: "Discord Handle", type: "text", placeholder: "caktus#0000" },
  { key: "introVideoUrl", label: "Intro/Background Video URL (objectPath or external URL)", type: "text", placeholder: "/objects/..." },
  { key: "heroImageUrl", label: "Hero Background Image URL", type: "text", placeholder: "/objects/..." },
];

export default function SiteTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
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
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Site Settings</h2>
        <p className="text-white/40 text-sm">Edit core content shown on the portfolio.</p>
      </div>

      <div className="space-y-4">
        {SETTINGS_KEYS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-white/60 text-sm mb-1.5 font-medium">{label}</label>
            {type === "textarea" ? (
              <textarea
                value={settings[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={4}
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

      <div className="border-t border-white/10 pt-4">
        <p className="text-white/50 text-sm mb-3 font-medium">Upload Background Video</p>
        <FileUploader
          accept="video/*"
          label="Upload intro/background video"
          onUploaded={(path) => handleChange("introVideoUrl", path)}
        />
        {settings.introVideoUrl && (
          <p className="text-purple-400 text-xs mt-2 truncate">Current: {settings.introVideoUrl}</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-white/50 text-sm mb-3 font-medium">Upload Hero Background Image</p>
        <FileUploader
          accept="image/*"
          label="Upload hero background image"
          onUploaded={(path) => handleChange("heroImageUrl", path)}
        />
        {settings.heroImageUrl && (
          <p className="text-purple-400 text-xs mt-2 truncate">Current: {settings.heroImageUrl}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}

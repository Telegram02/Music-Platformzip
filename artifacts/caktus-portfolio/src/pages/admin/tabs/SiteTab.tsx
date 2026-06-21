import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";
import { storageUrl } from "@/lib/api";
import { Eye, EyeOff, User } from "lucide-react";

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

  const photoUrl = settings.profilePhotoUrl ? storageUrl(settings.profilePhotoUrl) : "";
  const photoVisible = settings.profilePhotoVisible !== "false";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Site Settings</h2>
        <p className="text-white/40 text-sm">Edit core content, SEO, and contact info shown on the portfolio.</p>
      </div>

      {/* Profile Photo */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400/80 border-b border-white/5 pb-2">
          Profile Photo
        </h3>

        <div className="flex gap-5 items-start">
          {/* Preview */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover object-top" />
              ) : (
                <User size={32} className="text-white/20" />
              )}
            </div>
            {photoUrl && (
              <p className="text-[10px] text-white/25 text-center mt-1 font-mono">
                {photoVisible ? "Visible" : "Hidden"}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-medium">Photo URL</label>
              <input
                type="text"
                value={settings.profilePhotoUrl ?? ""}
                onChange={(e) => handleChange("profilePhotoUrl", e.target.value)}
                placeholder="/objects/... or https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
              />
            </div>

            <FileUploader
              accept="image/*"
              label="Upload your photo"
              onUploaded={(path) => {
                handleChange("profilePhotoUrl", path);
                handleChange("profilePhotoVisible", "true");
              }}
            />

            {/* Show / Hide toggle */}
            {settings.profilePhotoUrl && (
              <button
                type="button"
                onClick={() => handleChange("profilePhotoVisible", photoVisible ? "false" : "true")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  photoVisible
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                {photoVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                {photoVisible ? "Showing on site — click to hide" : "Hidden from site — click to show"}
              </button>
            )}
          </div>
        </div>
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
          Background Media
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

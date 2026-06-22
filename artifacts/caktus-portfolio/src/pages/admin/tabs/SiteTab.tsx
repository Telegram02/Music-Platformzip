import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";
import { storageUrl } from "@/lib/api";
import { Eye, EyeOff, User, Image, Music2, Film, Headphones, X } from "lucide-react";

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

const SECTION_BGS = [
  { key: "heroImageUrl", label: "Hero", hint: "Shown as wallpaper behind CAKTUS PRODUCTIONS title" },
  { key: "aboutBgImage", label: "About", hint: "Background behind the About section" },
  { key: "servicesBgImage", label: "Services", hint: "Background behind the Sonic Arsenal cards" },
  { key: "portfolioBgImage", label: "Portfolio", hint: "Background behind Featured Transmissions" },
  { key: "workflowBgImage", label: "Workflow", hint: "Background behind The Process section" },
  { key: "contactBgImage", label: "Contact", hint: "Background behind the contact section" },
];

type WidgetType = "default" | "photo" | "video" | "audio";

const WIDGET_OPTIONS: { value: WidgetType; label: string; icon: React.ReactNode }[] = [
  { value: "default", label: "Default", icon: <Headphones size={14} /> },
  { value: "photo", label: "Photo", icon: <Image size={14} /> },
  { value: "video", label: "Video", icon: <Film size={14} /> },
  { value: "audio", label: "Audio", icon: <Music2 size={14} /> },
];

function UrlFieldRow({
  label, hint, settingKey, settings, handleChange,
  accept = "image/*",
}: {
  label: string; hint?: string; settingKey: string;
  settings: Record<string, string>;
  handleChange: (k: string, v: string) => void;
  accept?: string;
}) {
  const val = settings[settingKey] ?? "";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-white/60 text-sm font-medium">{label}</label>
        {val && (
          <button
            type="button"
            onClick={() => handleChange(settingKey, "")}
            className="text-white/25 hover:text-red-400 transition-colors flex items-center gap-1 text-xs"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
      {hint && <p className="text-white/25 text-xs mb-2">{hint}</p>}
      <input
        type="text"
        value={val}
        onChange={(e) => handleChange(settingKey, e.target.value)}
        placeholder="/objects/... or https://..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm mb-2"
      />
      <FileUploader
        accept={accept}
        label={`Upload ${label.toLowerCase()}`}
        onUploaded={(path) => handleChange(settingKey, path)}
      />
      {val && (
        <p className="text-purple-400 text-xs mt-1.5 truncate">✓ {val}</p>
      )}
    </div>
  );
}

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
  const widgetType = (settings.aboutWidgetType ?? "default") as WidgetType;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Site Settings</h2>
        <p className="text-white/40 text-sm">Edit content, backgrounds, and media across your whole portfolio.</p>
      </div>

      {/* ── About Widget ───────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400/80 border-b border-white/5 pb-2">
          About Widget
        </h3>
        <p className="text-white/30 text-xs">Choose what appears inside the square frame in the About section.</p>

        {/* Type picker */}
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {WIDGET_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleChange("aboutWidgetType", value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all border-r last:border-0 border-white/10 ${
                widgetType === value
                  ? "bg-purple-600/25 text-purple-300"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Photo controls */}
        {widgetType === "photo" && (
          <div className="space-y-3 p-4 bg-white/3 rounded-lg border border-white/5">
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover object-top" />
                ) : (
                  <User size={24} className="text-white/20" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <UrlFieldRow
                  label="Photo URL"
                  settingKey="profilePhotoUrl"
                  settings={settings}
                  handleChange={handleChange}
                  accept="image/*"
                />
              </div>
            </div>
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
                {photoVisible ? "Visible on site — click to hide" : "Hidden — click to show"}
              </button>
            )}
          </div>
        )}

        {/* Video controls */}
        {widgetType === "video" && (
          <div className="space-y-3 p-4 bg-white/3 rounded-lg border border-white/5">
            <p className="text-white/30 text-xs">The video will autoplay, loop, and fill the square frame.</p>
            <UrlFieldRow
              label="Video URL"
              settingKey="aboutVideoUrl"
              settings={settings}
              handleChange={handleChange}
              accept="video/*"
            />
          </div>
        )}

        {/* Audio controls */}
        {widgetType === "audio" && (
          <div className="space-y-4 p-4 bg-white/3 rounded-lg border border-white/5">
            <p className="text-white/30 text-xs">Displays cover art with a playable audio track.</p>
            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-medium">Track Title</label>
              <input
                type="text"
                value={settings.aboutAudioTitle ?? ""}
                onChange={(e) => handleChange("aboutAudioTitle", e.target.value)}
                placeholder="Featured Track"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
              />
            </div>
            <UrlFieldRow
              label="Cover Art"
              settingKey="aboutAudioCover"
              settings={settings}
              handleChange={handleChange}
              accept="image/*"
            />
            <UrlFieldRow
              label="Audio File"
              settingKey="aboutAudioUrl"
              settings={settings}
              handleChange={handleChange}
              accept="audio/*"
            />
          </div>
        )}
      </div>

      {/* ── Text & Content ─────────────────────────────── */}
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

      {/* ── Section Backgrounds ────────────────────────── */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400/80 border-b border-white/5 pb-2">
            Section Backgrounds
          </h3>
          <p className="text-white/25 text-xs mt-2">Upload a wallpaper or image for any section. Leave empty to keep the default dark theme.</p>
        </div>

        {SECTION_BGS.map(({ key, label, hint }) => (
          <div key={key} className="p-4 bg-white/3 rounded-lg border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm font-medium">{label}</span>
              {settings[key] && (
                <span className="text-emerald-400 text-[10px] font-mono uppercase">● Custom</span>
              )}
            </div>
            <UrlFieldRow
              label={`${label} Background`}
              hint={hint}
              settingKey={key}
              settings={settings}
              handleChange={handleChange}
              accept="image/*"
            />
          </div>
        ))}

        {/* Hero video (separate from static bg) */}
        <div className="p-4 bg-white/3 rounded-lg border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Hero — Background Video</span>
            {settings.introVideoUrl && (
              <span className="text-emerald-400 text-[10px] font-mono uppercase">● Active</span>
            )}
          </div>
          <p className="text-white/25 text-xs">Video takes priority over a static image. Plays looped and muted.</p>
          <UrlFieldRow
            label="Video URL"
            settingKey="introVideoUrl"
            settings={settings}
            handleChange={handleChange}
            accept="video/*"
          />
        </div>
      </div>

      {/* ── Save ───────────────────────────────────────── */}
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

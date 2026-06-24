import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ExternalLink, Music2, Volume2, VolumeX, SkipBack, SkipForward, X, Pin, Link2, Check, type LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAudioTracks, usePortfolioItems, useSiteSettings } from "@/hooks/useSiteData";
import { type AudioTrack, type PortfolioItem, storageUrl } from "@/lib/api";
import { GENRE_ICON_MAP } from "@/lib/genreIcons";

const WAVEFORM_HEIGHTS = Array.from({ length: 32 }, (_, i) => Math.max(10, ((i * 37 + 13) % 90) + 10));

// ── Web Audio API analyser — singleton so createMediaElementSource is called once ──
let _audioCtx: AudioContext | null = null;
let _analyser: AnalyserNode | null = null;
let _srcConnected = false;

function ensureAnalyser(): AnalyserNode | null {
  try {
    if (!_audioCtx) {
      _audioCtx = new AudioContext();
      _analyser = _audioCtx.createAnalyser();
      _analyser.fftSize = 64;
      _analyser.smoothingTimeConstant = 0.75;
    }
    if (_audioCtx.state === "suspended") void _audioCtx.resume();
    if (!_srcConnected && _analyser && _audioCtx) {
      const src = _audioCtx.createMediaElementSource(sharedAudio);
      src.connect(_analyser);
      _analyser.connect(_audioCtx.destination);
      _srcConnected = true;
    }
    return _analyser;
  } catch {
    return null;
  }
}

function useAudioBars(playing: boolean, count = 32): number[] {
  const [bars, setBars] = useState<number[]>(() => Array(count).fill(0));
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!playing) { setBars(Array(count).fill(0)); return; }
    const analyser = ensureAnalyser();
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const step = Math.max(1, Math.floor(data.length / count));
    function tick() {
      analyser!.getByteFrequencyData(data);
      setBars(Array.from({ length: count }, (_, i) => data[Math.min(i * step, data.length - 1)] / 255));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, count]);
  return bars;
}

// ── Shared audio element (singleton) ─────────────────────────────────────────
const sharedAudio = new Audio();

// ── Mini waveform bars ────────────────────────────────────────────────────────
function MiniWave({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
        <div key={i} className={`w-[2px] bg-primary rounded-full ${playing ? "animate-bounce" : "opacity-40"}`}
          style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.7s" }} />
      ))}
    </div>
  );
}

// ── Share button (inline copy-to-clipboard) ───────────────────────────────────
function ShareButton({ track, size = 14 }: { track: AudioTrack; size?: number }) {
  const [copied, setCopied] = useState(false);
  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/?track=${track.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({ title: "Link copied!", description: `Share link for "${track.title}" is ready to paste.` });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({ title: "Copy failed", description: "Could not access clipboard.", variant: "destructive" });
    });
  }
  return (
    <button onClick={handleShare} title="Copy share link"
      className="flex items-center justify-center text-foreground/35 hover:text-white transition-colors">
      {copied ? <Check size={size} className="text-green-400" /> : <Link2 size={size} />}
    </button>
  );
}

// ── Compact card ──────────────────────────────────────────────────────────────
function CompactAudioCard({
  track, isPlaying, onPlay, onStop,
}: { track: AudioTrack; isPlaying: boolean; onPlay: () => void; onStop: () => void }) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const accent = track.accentColor || "#9333ea";
  const iconCol = track.iconColor || null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-sm border transition-all"
      style={{
        borderColor: isPlaying ? `${accent}80` : `${accent}20`,
        background: isPlaying
          ? `linear-gradient(90deg, ${accent}12 0%, rgba(0,0,0,0.6) 100%)`
          : "rgba(0,0,0,0.5)",
      }}
    >
      {/* Icon / cover */}
      <div className="relative flex-shrink-0">
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-9 h-9 rounded object-cover border border-border/40" />
        ) : (
          <div className="w-9 h-9 rounded flex items-center justify-center"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            <Icon size={16} style={{ color: iconCol ?? accent }} />
          </div>
        )}
        {isPlaying && (
          <div className="absolute inset-0 rounded flex items-center justify-center"
            style={{ background: `${accent}55` }}>
            <div className="flex gap-[2px] items-end h-4">
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div key={i} className="w-[2px] bg-white rounded-full animate-bounce"
                  style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.65s" }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title + genre */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate transition-colors"
          style={{ color: isPlaying ? accent : "white" }}>
          {track.title}
          {track.pinned && <Pin size={9} className="inline ml-1 text-yellow-400 mb-0.5" />}
        </p>
        <p className="text-[11px] text-foreground/40 capitalize truncate">{track.genre || "Audio"}</p>
      </div>

      {/* Mini waveform strip */}
      <div className="hidden lg:flex items-end gap-[2px] h-6 flex-shrink-0">
        {[4, 7, 5, 8, 6, 9, 5, 7, 4, 6, 8, 5].map((h, i) => (
          <div key={i} className="w-[2px] rounded-full transition-all duration-300"
            style={{
              height: `${h * 2}px`,
              background: isPlaying
                ? (i % 3 === 0 ? accent : `${accent}70`)
                : "rgba(255,255,255,0.12)",
              animation: isPlaying ? `bounce ${0.5 + (i % 3) * 0.15}s ease-in-out infinite alternate` : "none",
            }} />
        ))}
      </div>

      {/* Share + Play */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ShareButton track={track} size={13} />
        <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-30"
          style={isPlaying ? { background: accent, boxShadow: `0 0 10px ${accent}60` } : { background: "rgba(255,255,255,0.1)" }}>
          {isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="fill-white ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Featured (wide) card ──────────────────────────────────────────────────────
function FeaturedAudioCard({
  track, isPlaying, volume, progress,
  onPlay, onStop, onVolumeChange, onProgressUpdate,
}: {
  track: AudioTrack; isPlaying: boolean; volume: number; progress: number;
  onPlay: () => void; onStop: () => void;
  onVolumeChange: (v: number) => void; onProgressUpdate: (p: number) => void;
}) {
  const [showVolume, setShowVolume] = useState(false);
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const accent = track.accentColor || "#9333ea";
  const iconCol = track.iconColor || null;

  useEffect(() => {
    if (!isPlaying) return;
    function onTime() {
      if (sharedAudio.duration) onProgressUpdate(sharedAudio.currentTime / sharedAudio.duration);
    }
    sharedAudio.addEventListener("timeupdate", onTime);
    return () => sharedAudio.removeEventListener("timeupdate", onTime);
  }, [isPlaying, onProgressUpdate]);

  const liveBars = useAudioBars(isPlaying, WAVEFORM_HEIGHTS.length);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!sharedAudio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    sharedAudio.currentTime = ((e.clientX - rect.left) / rect.width) * sharedAudio.duration;
    if (!isPlaying) onPlay();
  }

  const played = Math.round(progress * WAVEFORM_HEIGHTS.length);

  return (
    <div
      className="border rounded-sm backdrop-blur-sm transition-all relative overflow-hidden flex flex-row h-full min-h-[180px]"
      style={{
        borderColor: isPlaying ? `${accent}99` : `${accent}30`,
        boxShadow: isPlaying ? `0 0 40px ${accent}30` : `0 0 20px ${accent}10`,
        background: `linear-gradient(135deg, ${accent}0a 0%, rgba(0,0,0,0.85) 60%)`,
      }}
    >
      {/* Animated top bar */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
      )}

      {/* Left: large cover / icon art */}
      <div className="relative flex-shrink-0 w-40 sm:w-48">
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title}
            className="w-full h-full object-cover"
            style={{ filter: isPlaying ? "brightness(1)" : "brightness(0.85)" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(ellipse at center, ${accent}22 0%, ${accent}06 100%)` }}>
            <Icon size={56} style={{ color: iconCol ?? accent, filter: `drop-shadow(0 0 16px ${accent}80)` }} />
          </div>
        )}
        {/* Now-playing animated bars overlay */}
        {isPlaying && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[3px] items-end"
            style={{ filter: `drop-shadow(0 0 4px ${accent})` }}>
            {[4, 7, 5, 8, 4, 6, 5].map((h, i) => (
              <div key={i} className="w-[3px] bg-white rounded-full animate-bounce"
                style={{ height: `${h * 2}px`, animationDelay: `${i * 0.08}s`, animationDuration: "0.65s" }} />
            ))}
          </div>
        )}
        {/* Featured badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
          style={{ background: `${accent}33`, border: `1px solid ${accent}60`, color: accent }}>
          ★ Featured
        </div>
        {track.pinned && (
          <div className="absolute top-2 right-2">
            <Pin size={12} className="text-yellow-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Right: info + controls */}
      <div className="flex flex-col flex-1 p-5 min-w-0">
        <div className="mb-3">
          <h4 className="text-xl font-bold truncate mb-0.5 transition-colors"
            style={{ color: isPlaying ? accent : "white" }}>
            {track.title}
          </h4>
          <p className="text-xs text-foreground/50 uppercase tracking-widest">{track.genre || track.description}</p>
          {isPlaying && (
            <p className="text-[10px] font-mono uppercase tracking-widest mt-1 animate-pulse"
              style={{ color: `${accent}b0` }}>Now playing</p>
          )}
        </div>

        {/* Waveform — live frequency bars when playing, static seek bar otherwise */}
        <div className="flex-1 flex items-center mb-4">
          <div className="w-full flex items-end gap-[2px] h-12 cursor-pointer" onClick={handleSeek} title="Click to seek">
            {WAVEFORM_HEIGHTS.map((h, i) => {
              const liveH = isPlaying ? Math.max(12, liveBars[i] * 100) : h;
              return (
                <div key={i} className="flex-1 rounded-full"
                  style={{
                    height: `${liveH}%`,
                    transition: isPlaying ? "height 80ms ease-out" : "height 200ms",
                    background: i < played
                      ? accent
                      : isPlaying
                        ? `${accent}35`
                        : "rgba(255,255,255,0.1)",
                  }} />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: `${accent}20` }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-foreground/35 capitalize">{track.genre || "Audio"}</span>
            <ShareButton track={track} size={13} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowVolume((v) => !v)}
                className="w-7 h-7 flex items-center justify-center text-foreground/40 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              {showVolume && (
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-3 flex flex-col items-center gap-2 z-20 shadow-xl" style={{ width: 36 }}>
                  <input type="range" min={0} max={1} step={0.02} value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="cursor-pointer"
                    style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, width: 6, accentColor: accent } as React.CSSProperties} />
                  <span className="text-[9px] font-mono text-foreground/40">{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>
            <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 shadow-lg"
              style={isPlaying
                ? { background: accent, boxShadow: `0 0 20px ${accent}60` }
                : { background: "white" }}>
              {isPlaying
                ? <Pause size={18} className="fill-white" />
                : <Play size={18} className="fill-black ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Desktop card ──────────────────────────────────────────────────────────────
function DesktopAudioCard({
  track, isPlaying, volume, progress,
  onPlay, onStop, onVolumeChange, onProgressUpdate,
}: {
  track: AudioTrack; isPlaying: boolean; volume: number; progress: number;
  onPlay: () => void; onStop: () => void;
  onVolumeChange: (v: number) => void; onProgressUpdate: (p: number) => void;
}) {
  const [showVolume, setShowVolume] = useState(false);
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const accent = track.accentColor || "#9333ea";
  const iconCol = track.iconColor || null;

  useEffect(() => {
    if (!isPlaying) return;
    function onTime() {
      if (sharedAudio.duration) onProgressUpdate(sharedAudio.currentTime / sharedAudio.duration);
    }
    sharedAudio.addEventListener("timeupdate", onTime);
    return () => sharedAudio.removeEventListener("timeupdate", onTime);
  }, [isPlaying, onProgressUpdate]);

  const liveBars = useAudioBars(isPlaying, WAVEFORM_HEIGHTS.length);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!sharedAudio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    sharedAudio.currentTime = ((e.clientX - rect.left) / rect.width) * sharedAudio.duration;
    if (!isPlaying) onPlay();
  }

  const played = Math.round(progress * WAVEFORM_HEIGHTS.length);

  return (
    <div
      className="bg-background/80 border p-6 rounded-sm backdrop-blur-sm transition-all relative overflow-hidden flex flex-col h-full"
      style={{
        borderColor: isPlaying ? `${accent}99` : `${accent}22`,
        boxShadow: isPlaying ? `0 0 24px ${accent}26` : undefined,
      }}
    >
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
      )}
      {track.pinned && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-400/15 border border-yellow-400/30">
          <Pin size={9} className="text-yellow-400" />
          <span className="text-[9px] font-mono text-yellow-400 uppercase tracking-wider">Pinned</span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-5">
        <div className="relative flex-shrink-0">
          {track.coverUrl ? (
            <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-14 h-14 rounded-sm object-cover border border-border/50" />
          ) : (
            <div className="w-14 h-14 rounded-sm flex items-center justify-center"
              style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
              <Icon size={28} style={{ color: iconCol ?? accent }} />
            </div>
          )}
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 flex gap-[2px] items-end h-4 px-1 py-0.5 rounded-sm"
              style={{ background: accent }}>
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div key={i} className="w-[2px] bg-white rounded-full animate-bounce"
                  style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }} />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold mb-0.5 truncate transition-colors text-white"
            style={isPlaying ? { color: accent } : {}}>
            {track.title}
          </h4>
          <p className="text-xs text-foreground/50 uppercase tracking-widest truncate">{track.genre || track.description}</p>
          {isPlaying && (
            <p className="text-[10px] font-mono uppercase tracking-widest mt-1 animate-pulse" style={{ color: `${accent}b0` }}>
              Now playing
            </p>
          )}
        </div>
      </div>

      {/* Waveform seek bar — live frequency bars when playing */}
      <div className="flex-grow flex items-center py-2 mb-4">
        <div className="w-full flex items-end gap-[2px] h-12 cursor-pointer" onClick={handleSeek} title="Click to seek">
          {WAVEFORM_HEIGHTS.map((h, i) => {
            const liveH = isPlaying ? Math.max(12, liveBars[i] * 100) : h;
            return (
              <div key={i} className="flex-1 rounded-full"
                style={{
                  height: `${liveH}%`,
                  transition: isPlaying ? "height 80ms ease-out" : "height 200ms",
                  background: i < played
                    ? accent
                    : isPlaying
                      ? `${accent}35`
                      : "rgba(255,255,255,0.1)",
                }} />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-foreground/35 capitalize">{track.genre || "Audio"}</span>
          <ShareButton track={track} size={13} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowVolume((v) => !v)}
              className="w-7 h-7 flex items-center justify-center text-foreground/40 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            {showVolume && (
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-3 flex flex-col items-center gap-2 z-20 shadow-xl" style={{ width: 36 }}>
                <input type="range" min={0} max={1} step={0.02} value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-24 cursor-pointer"
                  style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, width: 6, accentColor: accent } as React.CSSProperties} />
                <span className="text-[9px] font-mono text-foreground/40">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>
          <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={isPlaying ? { background: accent } : { background: "white" }}>
            {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-black ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile compact card (row + seekable progress bar) ────────────────────────
function MobileAudioCard({
  track, isPlaying, progress, onPlay, onStop, onProgressUpdate,
}: {
  track: AudioTrack; isPlaying: boolean; progress: number;
  onPlay: () => void; onStop: () => void;
  onProgressUpdate: (p: number) => void;
}) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const accent = track.accentColor || "#9333ea";
  const iconCol = track.iconColor || null;
  const liveBars = useAudioBars(isPlaying, 9);

  useEffect(() => {
    if (!isPlaying) return;
    function onTime() {
      if (sharedAudio.duration) onProgressUpdate(sharedAudio.currentTime / sharedAudio.duration);
    }
    sharedAudio.addEventListener("timeupdate", onTime);
    return () => sharedAudio.removeEventListener("timeupdate", onTime);
  }, [isPlaying, onProgressUpdate]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!sharedAudio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    sharedAudio.currentTime = ((e.clientX - rect.left) / rect.width) * sharedAudio.duration;
    if (!isPlaying) onPlay();
  }

  return (
    <div
      className="flex flex-col rounded-xl border transition-all overflow-hidden"
      style={{
        borderColor: isPlaying ? `${accent}80` : `${accent}22`,
        background: isPlaying ? `${accent}0d` : "rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border/40" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
            <Icon size={18} style={{ color: iconCol ?? accent }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate text-white" style={isPlaying ? { color: accent } : {}}>
              {track.title}
            </p>
            {track.pinned && <Pin size={10} className="text-yellow-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-foreground/40 truncate capitalize">{track.genre || "Audio"}</p>
        </div>
        {/* Live frequency visualizer */}
        {isPlaying && (
          <div className="flex items-end gap-[2px] h-5 flex-shrink-0">
            {liveBars.map((v, i) => (
              <div key={i} className="w-[3px] rounded-full"
                style={{
                  height: `${Math.max(20, v * 100)}%`,
                  transition: "height 80ms ease-out",
                  background: i % 2 === 0 ? accent : `${accent}80`,
                }} />
            ))}
          </div>
        )}
        <ShareButton track={track} size={13} />
        <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
          style={isPlaying ? { background: accent } : { background: "rgba(255,255,255,0.1)" }}>
          {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white ml-0.5" />}
        </button>
      </div>
      {/* Seek bar — tap anywhere to jump */}
      <div
        className="h-1 mx-4 mb-2.5 rounded-full overflow-hidden cursor-pointer"
        style={{ background: "rgba(255,255,255,0.08)" }}
        onClick={handleSeek}
      >
        <div className="h-full rounded-full transition-all duration-150"
          style={{ width: `${(isPlaying ? progress : 0) * 100}%`, background: accent }} />
      </div>
    </div>
  );
}

// ── Portfolio project card ────────────────────────────────────────────────────
function PortfolioCard({ item }: { item: PortfolioItem }) {
  const typeColors: Record<string, string> = {
    youtube: "text-red-400", soundcloud: "text-orange-400", spotify: "text-green-400",
    game: "text-cyan-400", mixing: "text-blue-400", custom: "text-purple-400",
  };
  return (
    <div className="bg-background/80 border border-border/50 p-6 rounded-sm backdrop-blur-sm group-hover:border-primary/40 transition-colors relative overflow-hidden flex flex-col h-full">
      {item.imageUrl && (
        <div className="w-full aspect-video mb-4 rounded-sm overflow-hidden">
          <img src={storageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h4 className="text-base font-bold text-white mb-0.5 group-hover:text-primary transition-colors truncate">{item.title}</h4>
          <p className="text-xs text-foreground/50 leading-relaxed line-clamp-2">{item.description}</p>
        </div>
        <div className={`text-xs font-mono px-2 py-1 bg-card border border-border rounded-sm flex-shrink-0 ${typeColors[item.type] ?? "text-purple-400"}`}>
          {item.type}
        </div>
      </div>
      {(item.embedUrl || item.externalLink) && (
        <div className="mt-auto pt-4 border-t border-border/50">
          <a href={item.embedUrl || item.externalLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-foreground/50 hover:text-primary transition-colors uppercase tracking-wider font-medium">
            <ExternalLink size={12} /> Listen / View
          </a>
        </div>
      )}
    </div>
  );
}

// ── Sticky mini-player ────────────────────────────────────────────────────────
function StickyMiniPlayer({
  track, trackIndex, totalTracks, progress, volume, isPlaying,
  onPlayPause, onClose, onVolumeChange, onNext, onPrev, onSeek,
}: {
  track: AudioTrack; trackIndex: number; totalTracks: number;
  progress: number; volume: number; isPlaying: boolean;
  onPlayPause: () => void; onClose: () => void;
  onVolumeChange: (v: number) => void;
  onNext: () => void; onPrev: () => void;
  onSeek: (p: number) => void;
}) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const hasPrev = trackIndex > 0;
  const hasNext = trackIndex < totalTracks - 1;

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek((e.clientX - rect.left) / rect.width);
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-primary/30 backdrop-blur-md shadow-[0_-4px_30px_rgba(147,51,234,0.2)]"
    >
      {/* Clickable seek bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer group"
        onClick={handleSeekClick}
      >
        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
        <div className="h-full transition-all duration-150"
          style={{ width: `${progress * 100}%`, background: track.accentColor || "#9333ea" }} />
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
        {/* Cover / icon */}
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-8 h-8 sm:w-9 sm:h-9 rounded object-cover flex-shrink-0 border border-primary/30" />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-primary" />
          </div>
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs sm:text-sm font-semibold truncate">{track.title}</p>
          <p className="text-foreground/40 text-[10px] sm:text-xs">{track.genre || "Audio"}</p>
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <Volume2 size={13} className="text-foreground/40" />
          <input type="range" min={0} max={1} step={0.02} value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 accent-primary cursor-pointer" />
        </div>

        {/* Prev / Play-Pause / Next / Close */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button onClick={onPrev} disabled={!hasPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
            <SkipBack size={15} />
          </button>
          <button onClick={onPlayPause}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/80 transition-colors">
            {isPlaying ? <Pause size={15} className="fill-white" /> : <Play size={15} className="fill-white ml-0.5" />}
          </button>
          <button onClick={onNext} disabled={!hasNext}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
            <SkipForward size={15} />
          </button>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors ml-1">
            <X size={13} />
          </button>
          <ShareButton track={track} size={13} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Placeholder tracks (admin hint) ──────────────────────────────────────────
const PLACEHOLDER_TRACKS: AudioTrack[] = [
  { id: -1, title: "Cyberpunk Cityscape", description: "", genre: "Game Soundtrack", audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 0, active: true, pinned: false, accentColor: "", iconColor: "", cardStyle: "default", createdAt: "", updatedAt: "" },
  { id: -2, title: "Void Walker",         description: "", genre: "Metalcore",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 1, active: true, pinned: false, accentColor: "", iconColor: "", cardStyle: "default", createdAt: "", updatedAt: "" },
  { id: -3, title: "Neon Shadows",        description: "", genre: "Synthwave",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 2, active: true, pinned: false, accentColor: "", iconColor: "", cardStyle: "default", createdAt: "", updatedAt: "" },
];

// ── Main Portfolio section ────────────────────────────────────────────────────
export function Portfolio() {
  const { data: tracks = [] } = useAudioTracks();
  const { data: portfolioItems = [] } = usePortfolioItems();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.portfolioBgImage ? storageUrl(settings.portfolioBgImage) : "";

  const [activeId, setActiveId]       = useState<number | null>(null);
  const [playing, setPlaying]         = useState(false);
  const [volume, setVolume]           = useState(0.8);
  const [progress, setProgress]       = useState(0);
  const [sectionVisible, setSectionVisible] = useState(true);

  // Mobile page state for tracks
  const [mobilePage, setMobilePage]   = useState(0);
  const TRACKS_PER_PAGE = 5;

  const sectionRef = useRef<HTMLElement>(null);
  const pendingTrackId = useRef<number | null>(null);

  // Read ?track=<id> on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("track");
    if (tid) pendingTrackId.current = Number(tid);
  }, []);

  const rawTracks = tracks.length > 0 ? tracks : PLACEHOLDER_TRACKS;
  const showTracks = [...rawTracks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const hasRealTracks = tracks.length > 0;
  const activeIdx    = showTracks.findIndex((t) => t.id === activeId);
  const activeTrack  = activeIdx >= 0 ? showTracks[activeIdx] : null;

  // Sync shared audio volume
  useEffect(() => { sharedAudio.volume = volume; }, [volume]);

  // Sync playing state with sharedAudio events
  useEffect(() => {
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    sharedAudio.addEventListener("play", onPlay);
    sharedAudio.addEventListener("pause", onPause);
    return () => {
      sharedAudio.removeEventListener("play", onPlay);
      sharedAudio.removeEventListener("pause", onPause);
    };
  }, []);

  // Play a track
  const playTrack = useCallback((track: AudioTrack) => {
    if (!track.audioUrl) return;
    if (sharedAudio.src !== storageUrl(track.audioUrl)) {
      sharedAudio.src = storageUrl(track.audioUrl);
    }
    sharedAudio.play().catch(() => {});
    setActiveId(track.id);
    setProgress(0);
  }, []);

  const closePlayer = useCallback(() => {
    sharedAudio.pause();
    setActiveId(null);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (sharedAudio.paused) sharedAudio.play().catch(() => {});
    else sharedAudio.pause();
  }, []);

  const handleStickySeek = useCallback((p: number) => {
    if (sharedAudio.duration) {
      sharedAudio.currentTime = p * sharedAudio.duration;
      setProgress(p);
    }
  }, []);

  const stopTrack = closePlayer;

  const playNext = useCallback(() => {
    if (activeIdx < 0 || activeIdx >= showTracks.length - 1) return;
    playTrack(showTracks[activeIdx + 1]);
  }, [activeIdx, showTracks, playTrack]);

  const playPrev = useCallback(() => {
    if (activeIdx <= 0) return;
    playTrack(showTracks[activeIdx - 1]);
  }, [activeIdx, showTracks, playTrack]);

  // Auto-advance on track end
  useEffect(() => {
    function onEnd() {
      const next = activeIdx >= 0 && activeIdx < showTracks.length - 1 ? showTracks[activeIdx + 1] : null;
      if (next) playTrack(next); else stopTrack();
    }
    sharedAudio.addEventListener("ended", onEnd);
    return () => sharedAudio.removeEventListener("ended", onEnd);
  }, [activeIdx, showTracks, playTrack, stopTrack]);

  // Auto-play deep-linked track once real tracks are loaded
  useEffect(() => {
    const id = pendingTrackId.current;
    if (!id || !hasRealTracks) return;
    const target = showTracks.find((t) => t.id === id);
    if (target && target.audioUrl) {
      pendingTrackId.current = null;
      setTimeout(() => {
        playTrack(target);
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  }, [hasRealTracks, showTracks, playTrack]);

  // Track progress
  const handleProgressUpdate = useCallback((p: number) => setProgress(p), []);

  // IntersectionObserver for sticky mini-player
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setSectionVisible(e.isIntersecting), {
      threshold: 0, rootMargin: "0px 0px -100px 0px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const showMiniPlayer = activeTrack && !sectionVisible;

  // Mobile pagination
  const mobilePageCount = Math.ceil(showTracks.length / TRACKS_PER_PAGE);
  const mobilePageTracks = showTracks.slice(mobilePage * TRACKS_PER_PAGE, (mobilePage + 1) * TRACKS_PER_PAGE);

  return (
    <>
      <section id="portfolio" ref={sectionRef} className="py-16 md:py-24 relative bg-background overflow-hidden"
        style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
        {bgImage && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="mb-10 md:mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-bold mb-3 md:mb-4">
              Featured Transmissions.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-foreground/70 text-base md:text-lg font-light">
              A selection of recent productions, mixes, and sound design projects.
            </motion.p>
          </div>

          {showTracks.length > 0 && (
            <div className="mb-12 md:mb-16">
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-mono mb-5 md:mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/50 inline-block" />
                Audio Demos
                {!hasRealTracks && <span className="text-foreground/20 text-xs hidden sm:inline">(placeholders)</span>}
              </h3>

              {/* ── MOBILE: compact paginated list ─────────────────────────── */}
              <div className="md:hidden space-y-2">
                {mobilePageTracks.map((track) => (
                  <MobileAudioCard key={track.id} track={track}
                    isPlaying={activeId === track.id}
                    progress={activeId === track.id ? progress : 0}
                    onPlay={() => playTrack(track)}
                    onStop={stopTrack}
                    onProgressUpdate={handleProgressUpdate} />
                ))}

                {/* Pagination controls */}
                {mobilePageCount > 1 && (
                  <div className="flex items-center justify-between pt-3 px-1">
                    <button onClick={() => setMobilePage((p) => Math.max(0, p - 1))} disabled={mobilePage === 0}
                      className="flex items-center gap-1 text-xs text-foreground/40 hover:text-white disabled:opacity-20 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <div className="flex gap-1.5">
                      {Array.from({ length: mobilePageCount }, (_, i) => (
                        <button key={i} onClick={() => setMobilePage(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === mobilePage ? "bg-primary w-4" : "bg-white/20"}`} />
                      ))}
                    </div>
                    <button onClick={() => setMobilePage((p) => Math.min(mobilePageCount - 1, p + 1))} disabled={mobilePage === mobilePageCount - 1}
                      className="flex items-center gap-1 text-xs text-foreground/40 hover:text-white disabled:opacity-20 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Mobile track counter */}
                <p className="text-center text-foreground/25 text-xs font-mono pt-1">
                  {showTracks.length} track{showTracks.length !== 1 ? "s" : ""}
                  {activeTrack ? ` · playing: ${activeTrack.title}` : ""}
                </p>
              </div>

              {/* ── DESKTOP: card grid ──────────────────────────────────────── */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {showTracks.map((track, index) => {
                  const isFeatured = track.cardStyle === "featured";
                  const isCompact  = track.cardStyle === "compact";
                  const sharedProps = {
                    track,
                    isPlaying: activeId === track.id,
                    volume,
                    progress: activeId === track.id ? progress : 0,
                    onPlay: () => playTrack(track),
                    onStop: stopTrack,
                    onVolumeChange: setVolume,
                    onProgressUpdate: handleProgressUpdate,
                  };
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className={`group ${
                        isFeatured ? "md:col-span-2 lg:col-span-2" :
                        isCompact  ? "col-span-full" : ""
                      }`}
                    >
                      {isFeatured ? (
                        <FeaturedAudioCard {...sharedProps} />
                      ) : isCompact ? (
                        <CompactAudioCard
                          track={track}
                          isPlaying={sharedProps.isPlaying}
                          onPlay={sharedProps.onPlay}
                          onStop={sharedProps.onStop}
                        />
                      ) : (
                        <DesktopAudioCard {...sharedProps} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {portfolioItems.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-mono mb-5 md:mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-accent/50 inline-block" />
                Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {portfolioItems.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
                    <PortfolioCard item={item} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sticky mini-player */}
      <AnimatePresence>
        {showMiniPlayer && (
          <StickyMiniPlayer
            track={activeTrack}
            trackIndex={activeIdx}
            totalTracks={showTracks.length}
            progress={progress}
            volume={volume}
            isPlaying={playing}
            onPlayPause={togglePlayPause}
            onClose={closePlayer}
            onVolumeChange={setVolume}
            onNext={playNext}
            onPrev={playPrev}
            onSeek={handleStickySeek}
          />
        )}
      </AnimatePresence>
    </>
  );
}

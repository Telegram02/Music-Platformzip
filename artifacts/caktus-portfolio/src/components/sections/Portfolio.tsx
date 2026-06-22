import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ExternalLink, Music2, Volume2, VolumeX, type LucideIcon, X } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAudioTracks, usePortfolioItems, useSiteSettings, type AudioTrack, type PortfolioItem } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";
import { GENRE_ICON_MAP } from "@/lib/genreIcons";

const WAVEFORM_HEIGHTS = Array.from({ length: 40 }, (_, i) => Math.max(10, ((i * 37 + 13) % 90) + 10));

interface LiveAudioCardProps {
  track: AudioTrack;
  activeId: number | null;
  volume: number;
  onPlay: (id: number) => void;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
}

function LiveAudioCard({ track, activeId, volume, onPlay, onStop, onVolumeChange }: LiveAudioCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [showVolume, setShowVolume] = useState(false);

  const isPlaying = activeId === track.id;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  function togglePlay() {
    if (!track.audioUrl) return;
    if (isPlaying) onStop();
    else onPlay(track.id);
  }

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  }

  function handleEnded() { onStop(); setProgress(0); }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * el.duration;
    setProgress(ratio);
    if (!isPlaying) onPlay(track.id);
  }

  const played = Math.round(progress * 40);
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;

  return (
    <div className={`bg-background/80 border p-6 rounded-sm backdrop-blur-sm transition-colors relative overflow-hidden flex flex-col h-full ${
      isPlaying ? "border-primary/60 shadow-[0_0_20px_rgba(147,51,234,0.15)]" : "border-border/50 group-hover:border-primary/40"
    }`}>
      {isPlaying && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />}
      {!isPlaying && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}

      {track.audioUrl && (
        <audio
          ref={audioRef}
          src={storageUrl(track.audioUrl)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      <div className="flex items-start gap-4 mb-5">
        <div className="relative flex-shrink-0">
          {track.coverUrl ? (
            <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-14 h-14 rounded-sm object-cover border border-border/50" />
          ) : (
            <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon size={28} className="text-primary" />
            </div>
          )}
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 flex gap-[2px] items-end h-4 px-1 py-0.5 bg-primary rounded-sm">
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div key={i} className="w-[2px] bg-white rounded-full animate-bounce"
                  style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }} />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-bold mb-0.5 truncate transition-colors ${isPlaying ? "text-primary" : "text-white group-hover:text-primary"}`}>
            {track.title}
          </h4>
          <p className="text-xs text-foreground/50 uppercase tracking-widest truncate">{track.genre || track.description}</p>
          {isPlaying && <p className="text-[10px] font-mono text-primary/70 uppercase tracking-widest mt-1 animate-pulse">Now playing</p>}
        </div>
      </div>

      <div className="flex-grow flex items-center py-2 mb-4">
        <div className="w-full flex items-center gap-[2px] h-10 cursor-pointer" onClick={handleSeek} title="Click to seek">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div key={i}
              className={`flex-1 rounded-full transition-colors ${i < played ? "bg-primary" : "bg-foreground/15"} ${isPlaying && i >= played ? "animate-pulse" : ""}`}
              style={{ height: `${h}%`, animationDelay: `${i * 0.03}s` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs font-mono text-foreground/35 capitalize">{track.genre || "Audio"}</span>

        <div className="flex items-center gap-2">
          {/* Volume control */}
          <div className="relative">
            <button
              onClick={() => setShowVolume((v) => !v)}
              className="w-7 h-7 flex items-center justify-center text-foreground/40 hover:text-white transition-colors"
              title="Volume"
            >
              {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            {showVolume && (
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-3 flex flex-col items-center gap-2 z-20 shadow-xl"
                style={{ width: 36 }}>
                <input
                  type="range" min={0} max={1} step={0.02}
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-24 accent-primary cursor-pointer"
                  style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, width: 6 }}
                />
                <span className="text-[9px] font-mono text-foreground/40">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>

          <button
            onClick={togglePlay}
            disabled={!track.audioUrl}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed ${
              isPlaying
                ? "bg-primary text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                : "bg-white text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            }`}
          >
            {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-black ml-0.5" />}
          </button>
        </div>

        <span className="text-xs font-mono text-foreground/35 invisible">—</span>
      </div>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const typeColors: Record<string, string> = {
    youtube: "text-red-400", soundcloud: "text-orange-400", spotify: "text-green-400",
    game: "text-cyan-400", mixing: "text-blue-400", custom: "text-purple-400",
  };
  return (
    <div className="bg-background/80 border border-border/50 p-6 rounded-sm backdrop-blur-sm group-hover:border-primary/40 transition-colors relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

// Sticky mini-player shown when user scrolls past the audio section
interface MiniPlayerProps {
  track: AudioTrack;
  progress: number;
  volume: number;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
}

function StickyMiniPlayer({ track, progress, volume, onStop, onVolumeChange }: MiniPlayerProps) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-primary/30 backdrop-blur-md px-4 py-3 shadow-[0_-4px_30px_rgba(147,51,234,0.2)]"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-[2px] bg-primary transition-all duration-300" style={{ width: `${progress * 100}%` }} />

      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-9 h-9 rounded object-cover flex-shrink-0 border border-primary/30" />
        ) : (
          <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-primary" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{track.title}</p>
          <p className="text-foreground/40 text-xs truncate">{track.genre || "Audio"}</p>
        </div>

        {/* Animated bars */}
        <div className="hidden sm:flex gap-[2px] items-end h-5">
          {[3, 5, 4, 6, 3, 4, 5].map((h, i) => (
            <div key={i} className="w-[2px] bg-primary rounded-full animate-bounce"
              style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.7s" }} />
          ))}
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <Volume2 size={13} className="text-foreground/40" />
          <input type="range" min={0} max={1} step={0.02} value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 accent-primary cursor-pointer" />
        </div>

        <button onClick={onStop}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors flex-shrink-0"
          title="Stop"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

const PLACEHOLDER_TRACKS: AudioTrack[] = [
  { id: -1, title: "Cyberpunk Cityscape", description: "", genre: "Game Soundtrack", audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 0, active: true, createdAt: "", updatedAt: "" },
  { id: -2, title: "Void Walker",         description: "", genre: "Metalcore",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 1, active: true, createdAt: "", updatedAt: "" },
  { id: -3, title: "Neon Shadows",        description: "", genre: "Synthwave",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 2, active: true, createdAt: "", updatedAt: "" },
];

export function Portfolio() {
  const { data: tracks = [] } = useAudioTracks();
  const { data: portfolioItems = [] } = usePortfolioItems();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.portfolioBgImage ? storageUrl(settings.portfolioBgImage) : "";

  const [activeId, setActiveId] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const showTracks = tracks.length > 0 ? tracks : PLACEHOLDER_TRACKS;
  const hasRealTracks = tracks.length > 0;
  const activeTrack = showTracks.find((t) => t.id === activeId) ?? null;

  // Track section visibility for sticky mini-player
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep global progress for mini-player
  const handleProgressUpdate = useCallback((p: number) => setProgress(p), []);

  const showMiniPlayer = activeTrack && !sectionVisible;

  return (
    <>
      <section
        id="portfolio"
        ref={sectionRef}
        className="py-24 relative bg-background overflow-hidden"
        style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {bgImage && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-bold mb-4">
              Featured Transmissions.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-foreground/70 text-lg font-light">
              A selection of recent productions, mixes, and sound design projects.
            </motion.p>
          </div>

          {showTracks.length > 0 && (
            <div className="mb-16">
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-mono mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/50 inline-block" />
                Audio Demos
                {!hasRealTracks && <span className="text-foreground/20 text-xs">(placeholders — add tracks in admin)</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showTracks.map((track, index) => (
                  <motion.div key={track.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
                    <LiveAudioCard
                      track={track}
                      activeId={activeId}
                      volume={volume}
                      onPlay={(id) => { setActiveId(id); setProgress(0); }}
                      onStop={() => setActiveId(null)}
                      onVolumeChange={setVolume}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {portfolioItems.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-mono mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-accent/50 inline-block" />
                Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            progress={progress}
            volume={volume}
            onStop={() => setActiveId(null)}
            onVolumeChange={setVolume}
          />
        )}
      </AnimatePresence>
    </>
  );
}

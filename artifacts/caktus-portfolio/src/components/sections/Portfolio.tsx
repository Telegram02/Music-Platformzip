import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ExternalLink, Music2, Volume2, VolumeX, SkipBack, SkipForward, X, type LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAudioTracks, usePortfolioItems, useSiteSettings } from "@/hooks/useSiteData";
import { type AudioTrack, type PortfolioItem, storageUrl } from "@/lib/api";
import { GENRE_ICON_MAP } from "@/lib/genreIcons";

const WAVEFORM_HEIGHTS = Array.from({ length: 32 }, (_, i) => Math.max(10, ((i * 37 + 13) % 90) + 10));

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

  const played = Math.round(progress * WAVEFORM_HEIGHTS.length);

  return (
    <div className={`bg-background/80 border p-6 rounded-sm backdrop-blur-sm transition-colors relative overflow-hidden flex flex-col h-full ${
      isPlaying ? "border-primary/60 shadow-[0_0_20px_rgba(147,51,234,0.15)]" : "border-border/50 group-hover:border-primary/40"
    }`}>
      {isPlaying && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />}

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

      {/* Waveform seek bar */}
      <div className="flex-grow flex items-center py-2 mb-4">
        <div className="w-full flex items-center gap-[2px] h-10 cursor-pointer" onClick={handleSeek}>
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div key={i} className={`flex-1 rounded-full transition-colors ${i < played ? "bg-primary" : "bg-foreground/15"}`}
              style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs font-mono text-foreground/35 capitalize">{track.genre || "Audio"}</span>
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
                  className="w-24 accent-primary cursor-pointer"
                  style={{ writingMode: "vertical-lr", direction: "rtl", height: 80, width: 6 }} />
                <span className="text-[9px] font-mono text-foreground/40">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>
          <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 ${
              isPlaying ? "bg-primary text-white" : "bg-white text-black"
            }`}>
            {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-black ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile compact card (row style) ──────────────────────────────────────────
function MobileAudioCard({
  track, isPlaying, onPlay, onStop,
}: { track: AudioTrack; isPlaying: boolean; onPlay: () => void; onStop: () => void }) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      isPlaying ? "border-primary/50 bg-primary/5" : "border-border/40 bg-background/60"
    }`}>
      {track.coverUrl ? (
        <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border/40" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isPlaying ? "text-primary" : "text-white"}`}>{track.title}</p>
        <p className="text-xs text-foreground/40 truncate capitalize">{track.genre || "Audio"}</p>
      </div>
      {isPlaying && <MiniWave playing />}
      <button onClick={isPlaying ? onStop : onPlay} disabled={!track.audioUrl}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 ${
          isPlaying ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"
        }`}>
        {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white ml-0.5" />}
      </button>
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
  track, trackIndex, totalTracks, progress, volume,
  onStop, onVolumeChange, onNext, onPrev,
}: {
  track: AudioTrack; trackIndex: number; totalTracks: number;
  progress: number; volume: number;
  onStop: () => void; onVolumeChange: (v: number) => void;
  onNext: () => void; onPrev: () => void;
}) {
  const Icon: LucideIcon = GENRE_ICON_MAP[track.iconName ?? "Music2"] ?? Music2;
  const hasPrev = trackIndex > 0;
  const hasNext = trackIndex < totalTracks - 1;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-primary/30 backdrop-blur-md shadow-[0_-4px_30px_rgba(147,51,234,0.2)]"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-[2px] bg-primary transition-all duration-300" style={{ width: `${progress * 100}%` }} />

      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Cover / icon */}
        {track.coverUrl ? (
          <img src={storageUrl(track.coverUrl)} alt={track.title} className="w-9 h-9 rounded object-cover flex-shrink-0 border border-primary/30" />
        ) : (
          <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-primary" />
          </div>
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{track.title}</p>
          <p className="text-foreground/40 text-xs">{track.genre || "Audio"}</p>
        </div>

        {/* Animated bars — hidden on small screens */}
        <div className="hidden sm:flex gap-[2px] items-end h-5">
          {[3, 5, 4, 6, 3, 4, 5].map((h, i) => (
            <div key={i} className="w-[2px] bg-primary rounded-full animate-bounce"
              style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.7s" }} />
          ))}
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <Volume2 size={13} className="text-foreground/40" />
          <input type="range" min={0} max={1} step={0.02} value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 accent-primary cursor-pointer" />
        </div>

        {/* Prev / Stop / Next */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onPrev} disabled={!hasPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
            <SkipBack size={15} />
          </button>
          <button onClick={onStop}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors">
            <X size={14} />
          </button>
          <button onClick={onNext} disabled={!hasNext}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
            <SkipForward size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Placeholder tracks (admin hint) ──────────────────────────────────────────
const PLACEHOLDER_TRACKS: AudioTrack[] = [
  { id: -1, title: "Cyberpunk Cityscape", description: "", genre: "Game Soundtrack", audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 0, active: true, createdAt: "", updatedAt: "" },
  { id: -2, title: "Void Walker",         description: "", genre: "Metalcore",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 1, active: true, createdAt: "", updatedAt: "" },
  { id: -3, title: "Neon Shadows",        description: "", genre: "Synthwave",       audioUrl: "", coverUrl: "", iconName: "Music2", sortOrder: 2, active: true, createdAt: "", updatedAt: "" },
];

// ── Main Portfolio section ────────────────────────────────────────────────────
export function Portfolio() {
  const { data: tracks = [] } = useAudioTracks();
  const { data: portfolioItems = [] } = usePortfolioItems();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.portfolioBgImage ? storageUrl(settings.portfolioBgImage) : "";

  const [activeId, setActiveId]       = useState<number | null>(null);
  const [volume, setVolume]           = useState(0.8);
  const [progress, setProgress]       = useState(0);
  const [sectionVisible, setSectionVisible] = useState(true);

  // Mobile page state for tracks
  const [mobilePage, setMobilePage]   = useState(0);
  const TRACKS_PER_PAGE = 5;

  const sectionRef = useRef<HTMLElement>(null);
  const showTracks = tracks.length > 0 ? tracks : PLACEHOLDER_TRACKS;
  const hasRealTracks = tracks.length > 0;
  const activeIdx    = showTracks.findIndex((t) => t.id === activeId);
  const activeTrack  = activeIdx >= 0 ? showTracks[activeIdx] : null;

  // Sync shared audio volume
  useEffect(() => { sharedAudio.volume = volume; }, [volume]);

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

  const stopTrack = useCallback(() => {
    sharedAudio.pause();
    setActiveId(null);
  }, []);

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
                    onPlay={() => playTrack(track)}
                    onStop={stopTrack} />
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
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showTracks.map((track, index) => (
                  <motion.div key={track.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
                    <DesktopAudioCard
                      track={track}
                      isPlaying={activeId === track.id}
                      volume={volume}
                      progress={activeId === track.id ? progress : 0}
                      onPlay={() => playTrack(track)}
                      onStop={stopTrack}
                      onVolumeChange={setVolume}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  </motion.div>
                ))}
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
            onStop={stopTrack}
            onVolumeChange={setVolume}
            onNext={playNext}
            onPrev={playPrev}
          />
        )}
      </AnimatePresence>
    </>
  );
}

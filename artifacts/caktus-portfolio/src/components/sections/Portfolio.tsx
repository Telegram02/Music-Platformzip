import { motion } from "framer-motion";
import { Play, Pause, ExternalLink, Music2, Headphones, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useAudioTracks, usePortfolioItems, useSiteSettings, type AudioTrack, type PortfolioItem } from "@/hooks/useSiteData";
import { storageUrl, api } from "@/lib/api";
import { GENRE_ICON_MAP } from "@/lib/genreIcons";

const WAVEFORM_HEIGHTS = Array.from({ length: 40 }, (_, i) => Math.max(10, ((i * 37 + 13) % 90) + 10));

function formatPlays(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function LiveAudioCard({ track }: { track: AudioTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPlays, setLocalPlays] = useState(track.playCount ?? 0);
  const playedOnce = useRef(false);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play();
      if (!playedOnce.current && track.id > 0) {
        playedOnce.current = true;
        setLocalPlays((p) => p + 1);
        api.recordPlay(track.id).catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  }

  function handleEnded() { setIsPlaying(false); setProgress(0); }

  const played = Math.round(progress * 40);

  return (
    <div className="bg-background/80 border border-border/50 p-6 rounded-sm backdrop-blur-sm group-hover:border-primary/40 transition-colors relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

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
        {track.coverUrl ? (
          <img
            src={storageUrl(track.coverUrl)}
            alt={track.title}
            className="w-14 h-14 rounded-sm object-cover flex-shrink-0 border border-border/50"
          />
        ) : (() => {
          const entry = GENRE_ICON_MAP[(track as AudioTrack).iconName ?? "Music2"] ?? GENRE_ICON_MAP["Music2"];
          const Icon: LucideIcon = entry?.icon ?? Music2;
          return (
            <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon size={28} className="text-primary" />
            </div>
          );
        })()}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-white mb-0.5 group-hover:text-primary transition-colors truncate">{track.title}</h4>
          <p className="text-xs text-foreground/50 uppercase tracking-widest truncate">{track.genre || track.description}</p>
        </div>
      </div>

      <div className="flex-grow flex items-center py-2 mb-4">
        <div className="w-full flex items-center gap-[2px] h-10 cursor-pointer" onClick={togglePlay}>
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-colors ${i < played ? "bg-primary" : "bg-foreground/15"} ${isPlaying && i >= played ? "animate-pulse" : ""}`}
              style={{ height: `${h}%`, animationDelay: `${i * 0.03}s` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground/35">
          <Headphones size={11} />
          <span>{formatPlays(localPlays)}</span>
        </div>
        <button
          onClick={togglePlay}
          disabled={!track.audioUrl}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPlaying
            ? <Pause size={16} className="fill-black" />
            : <Play size={16} className="fill-black ml-0.5" />}
        </button>
        <span className="text-xs font-mono text-foreground/35 capitalize">{track.genre || "Audio"}</span>
      </div>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const typeColors: Record<string, string> = {
    youtube: "text-red-400",
    soundcloud: "text-orange-400",
    spotify: "text-green-400",
    game: "text-cyan-400",
    mixing: "text-blue-400",
    custom: "text-purple-400",
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
          <a
            href={item.embedUrl || item.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-foreground/50 hover:text-primary transition-colors uppercase tracking-wider font-medium"
          >
            <ExternalLink size={12} /> Listen / View
          </a>
        </div>
      )}
    </div>
  );
}

const PLACEHOLDER_TRACKS: AudioTrack[] = [
  { id: -1, title: "Cyberpunk Cityscape", description: "", genre: "Game Soundtrack", audioUrl: "", coverUrl: "", iconName: "Music2", playCount: 0, sortOrder: 0, active: true, createdAt: "", updatedAt: "" },
  { id: -2, title: "Void Walker", description: "", genre: "Metalcore", audioUrl: "", coverUrl: "", iconName: "Music2", playCount: 0, sortOrder: 1, active: true, createdAt: "", updatedAt: "" },
  { id: -3, title: "Neon Shadows", description: "", genre: "Synthwave", audioUrl: "", coverUrl: "", iconName: "Music2", playCount: 0, sortOrder: 2, active: true, createdAt: "", updatedAt: "" },
];

export function Portfolio() {
  const { data: tracks = [] } = useAudioTracks();
  const { data: portfolioItems = [] } = usePortfolioItems();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.portfolioBgImage ? storageUrl(settings.portfolioBgImage) : "";

  const showTracks = tracks.length > 0 ? tracks : PLACEHOLDER_TRACKS;
  const hasRealTracks = tracks.length > 0;

  return (
    <section
      id="portfolio"
      className="py-24 relative bg-background overflow-hidden"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-4"
          >
            Featured Transmissions.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70 text-lg font-light"
          >
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
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <LiveAudioCard track={track} />
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
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <PortfolioCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

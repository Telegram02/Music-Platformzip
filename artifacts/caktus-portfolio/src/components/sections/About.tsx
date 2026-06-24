import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { AudioWaveform, Headphones, Mic2, Play, Pause, Music } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";

function AudioWidget({ audioUrl, coverUrl, title }: { audioUrl: string; coverUrl: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  }

  function onTimeUpdate() {
    const el = audioRef.current;
    if (el && el.duration) setProgress(el.currentTime / el.duration);
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onTimeUpdate={onTimeUpdate} onEnded={() => { setPlaying(false); setProgress(0); }} />
      )}
      {coverUrl ? (
        <img src={coverUrl} alt={title}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-sm object-cover border border-border/50 shadow-2xl shadow-black/50" />
      ) : (
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Music size={44} className="text-primary/50" />
        </div>
      )}
      <p className="text-white font-semibold text-sm text-center max-w-[80%] truncate">{title}</p>
      <div className="w-32 flex items-center gap-[2px] h-6">
        {Array.from({ length: 24 }, (_, i) => {
          const h = ((i * 17 + 7) % 70) + 15;
          const filled = i < Math.round(progress * 24);
          return (
            <div key={i}
              className={`flex-1 rounded-full transition-colors ${filled ? "bg-primary" : "bg-white/10"} ${playing && !filled ? "animate-pulse" : ""}`}
              style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }} />
          );
        })}
      </div>
      <button onClick={toggle} disabled={!audioUrl}
        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed">
        {playing ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
      </button>
    </div>
  );
}

export function About() {
  const { data: settings } = useSiteSettings();
  const bio = settings?.bio ?? "I'm Caktus — a music composer and producer with 8 years of experience and a passion for making every project feel exactly the way it should. I work across a wide range of styles: hip-hop, metal, rock, orchestral, horror, ambient, and cinematic. Whatever the sound, I bring the same focus — make it hit, make it feel right.";
  const years = settings?.yearsExperience ?? "10";
  const bgImage = settings?.aboutBgImage ? storageUrl(settings.aboutBgImage) : "";

  const widgetType = (settings?.aboutWidgetType ?? "default") as "default" | "photo" | "video" | "audio";
  const photoUrl = settings?.profilePhotoUrl ? storageUrl(settings.profilePhotoUrl) : "";
  const photoVisible = settings?.profilePhotoVisible !== "false";
  const aboutVideoUrl = settings?.aboutVideoUrl ? storageUrl(settings.aboutVideoUrl) : "";
  const aboutAudioUrl = settings?.aboutAudioUrl ? storageUrl(settings.aboutAudioUrl) : "";
  const aboutAudioCover = settings?.aboutAudioCover ? storageUrl(settings.aboutAudioCover) : "";
  const aboutAudioTitle = settings?.aboutAudioTitle ?? "Featured Track";

  const isPhoto = widgetType === "photo" && photoUrl && photoVisible;

  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden bg-background"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto lg:mx-0 bg-card border border-border/50 rounded-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-50 mix-blend-overlay group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] pointer-events-none z-10" />

                {isPhoto ? (
                  <motion.img
                    key="photo"
                    src={photoUrl}
                    alt="Caktus Productions"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                ) : widgetType === "video" && aboutVideoUrl ? (
                  <video src={aboutVideoUrl} autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover" />
                ) : widgetType === "audio" ? (
                  <AudioWidget audioUrl={aboutAudioUrl} coverUrl={aboutAudioCover} title={aboutAudioTitle} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border border-primary/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                      <div className="w-32 h-32 rounded-full border border-accent/40 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                        <Headphones size={48} className="text-primary/80 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status bar — only shown for non-photo modes */}
                {!isPhoto && (
                  <div className="absolute bottom-4 left-4 right-4 h-12 border-t border-border/50 flex items-end justify-between px-2 pb-2 z-20">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-1 bg-primary/40 animate-pulse"
                          style={{ height: `${(i % 4) * 6 + 5}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-foreground/40 font-mono">
                      {widgetType === "audio"
                        ? aboutAudioTitle.slice(0, 16).toUpperCase()
                        : widgetType === "video"
                        ? "VIDEO.LOOP"
                        : "SYS.ONLINE"}
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10 rounded-full opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 flex flex-col">
              <span className="text-foreground/50 text-sm tracking-[0.2em] uppercase mb-2">The Architect</span>
              Crafting Worlds <br />Through Sound.
            </h2>

            <div className="space-y-5 text-foreground/80 font-light text-lg leading-relaxed">
              {bio.split("\n").filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="flex flex-col gap-2">
                <AudioWaveform className="text-primary" size={24} />
                <span className="font-display font-semibold text-white">{years}+ Years</span>
                <span className="text-xs text-foreground/50 uppercase tracking-wider">Experience</span>
              </div>
              <div className="flex flex-col gap-2">
                <Mic2 className="text-accent" size={24} />
                <span className="font-display font-semibold text-white">AAA Quality</span>
                <span className="text-xs text-foreground/50 uppercase tracking-wider">Production</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

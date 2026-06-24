import { motion } from "framer-motion";
import { Play, ArrowRight, Mail } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";

function availabilityStatus(text: string): { color: string; pulse: string; label: string } {
  const t = text.toLowerCase();
  if (/busy|unavailable|not accept|closed|full/.test(t))
    return { color: "bg-red-500", pulse: "bg-red-500/40", label: "Unavailable" };
  if (/limited|selective|winding|few spots|one spot/.test(t))
    return { color: "bg-amber-400", pulse: "bg-amber-400/40", label: "Limited" };
  return { color: "bg-emerald-400", pulse: "bg-emerald-400/40", label: "Accepting Projects" };
}

export function Hero() {
  const { data: settings } = useSiteSettings();
  const heroBadge = settings?.heroBadge ?? "Music Producer | Composer | Sound Designer";
  const tagline = settings?.tagline ?? "Cinematic soundtracks, game audio, and professional music production for artists and studios. Emotional storytelling through sound.";
  const introVideoUrl = settings?.introVideoUrl ? storageUrl(settings.introVideoUrl) : "";
  const heroImageUrl = settings?.heroImageUrl ? storageUrl(settings.heroImageUrl) : "";
  const availText = settings?.availability ?? "";
  const status = availText ? availabilityStatus(availText) : null;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Shimmer placeholder while settings load */}
        {!settings && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/6 animate-pulse" />
        )}
        {/* Static image background */}
        {heroImageUrl && !introVideoUrl && (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        {/* Video background */}
        {introVideoUrl && (
          <video
            src={introVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        {/* Dark overlay when custom bg is set */}
        {(heroImageUrl || introVideoUrl) && (
          <div className="absolute inset-0 bg-background/50" />
        )}
        {/* Ambient glows — always shown, slightly reduced when custom bg is active */}
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-float ${heroImageUrl || introVideoUrl ? "opacity-60" : ""}`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[150px] mix-blend-screen animate-float ${heroImageUrl || introVideoUrl ? "opacity-60" : ""}`}
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-medium tracking-widest uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(147,51,234,0.15)]">
              {heroBadge}
            </div>
            {status && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulse} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${status.color}`} />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">{status.label}</span>
              </div>
            )}
          </div>

          <h1
            className="text-[3.5rem] sm:text-[5.5rem] md:text-[8rem] lg:text-[10rem] text-white mb-6 leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
          >
            <span className="block drop-shadow-[0_0_30px_rgba(147,51,234,0.3)]">CAKTUS</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">PRODUCTIONS</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a
              href="#portfolio"
              onClick={(e) => scrollToSection(e, "#portfolio")}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:-translate-y-1 w-full sm:w-auto"
            >
              <Play size={18} className="fill-white" />
              Listen to My Work
            </a>
            <a
              href="#services"
              onClick={(e) => scrollToSection(e, "#services")}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-white rounded-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-card/80 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:-translate-y-1 w-full sm:w-auto"
            >
              View Services
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "#contact")}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/10 text-white rounded-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-white/5 hover:border-white/30 w-full sm:w-auto"
            >
              <Mail size={18} />
              Hire Me
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-0 pointer-events-none hidden sm:flex"
      >
        <span className="text-xs text-foreground/50 uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/50 to-transparent" />
      </motion.div>
    </section>
  );
}

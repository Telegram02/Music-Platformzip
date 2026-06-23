import { motion } from "framer-motion";
import {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Star, Layers, Cpu, Waves,
  Disc3, BookOpen, Drum, Podcast, Guitar, type LucideIcon
} from "lucide-react";
import { useServices, useSiteSettings } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";

export const ICON_MAP: Record<string, LucideIcon> = {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Star, Layers, Cpu, Waves,
  Disc3, BookOpen, Drum, Podcast, Guitar,
};

const FALLBACK_SERVICES = [
  { id: -1, iconName: "Music2", title: "Music Production", description: "Full-scale track production from concept to completion. Specializing in electronic, rock, metal, hip-hop, and industrial genres.", colorClass: "from-purple-500/20 to-primary/5", sortOrder: 1, active: true },
  { id: -2, iconName: "Gamepad2", title: "Game Soundtracks", description: "Adaptive, dynamic, and immersive musical scores tailored for indie developers and AAA game studios.", colorClass: "from-blue-500/20 to-accent/5", sortOrder: 2, active: true },
  { id: -3, iconName: "Radio", title: "Sound Design & FX", description: "Bespoke sound effects, foley, and synthesis for UI, environments, characters, and cinematic sequences.", colorClass: "from-pink-500/20 to-pink-900/5", sortOrder: 3, active: true },
  { id: -4, iconName: "SlidersHorizontal", title: "Mixing & Mastering", description: "Industry-standard audio engineering to ensure your tracks hit hard, sound wide, and translate across all playback systems.", colorClass: "from-emerald-500/20 to-emerald-900/5", sortOrder: 4, active: true },
  { id: -5, iconName: "Film", title: "Trailer & Cinematic", description: "Massive, orchestral-hybrid compositions designed for film, animation, and promotional trailers.", colorClass: "from-orange-500/20 to-orange-900/5", sortOrder: 5, active: true },
  { id: -6, iconName: "Speaker", title: "Commercial Audio", description: "Striking audio branding, sonic logos, and high-impact background tracks for brands and agencies.", colorClass: "from-cyan-500/20 to-cyan-900/5", sortOrder: 6, active: true },
];

export function Services() {
  const { data: services, isLoading } = useServices();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.servicesBgImage ? storageUrl(settings.servicesBgImage) : "";
  const displayServices = services && services.length > 0 ? services : FALLBACK_SERVICES;

  if (settings && settings.servicesVisible === "false") return null;

  return (
    <section
      id="services"
      className="py-24 relative bg-card/30 border-y border-border/30 overflow-hidden"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-6"
          >
            Sonic Arsenal.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70 text-lg font-light"
          >
            Comprehensive audio solutions engineered for maximum impact.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-card border border-border/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => {
              const Icon = ICON_MAP[service.iconName] ?? Music2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative p-8 bg-card border border-border/50 rounded-sm hover:border-primary/50 transition-colors duration-500 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-background border border-border rounded-sm flex items-center justify-center mb-6 text-foreground group-hover:text-primary group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                      <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-3 tracking-wide">
                      {service.title}
                    </h3>
                    <p className="text-foreground/60 font-light leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

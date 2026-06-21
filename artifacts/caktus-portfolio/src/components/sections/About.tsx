import { motion } from "framer-motion";
import { AudioWaveform, Headphones, Mic2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";

export function About() {
  const { data: settings } = useSiteSettings();
  const bio = settings?.bio ?? "Music producer and sound designer with experience across hip-hop, rock, metal, metalcore, electronic, industrial, ambient, horror, cinematic, and video game music. Focused on emotional storytelling through sound.";
  const years = settings?.yearsExperience ?? "10";

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-background">
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
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-50 mix-blend-overlay group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] pointer-events-none" />
                
                {/* Abstract graphic representing the producer */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-primary/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                    <div className="w-32 h-32 rounded-full border border-accent/40 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                      <Headphones size={48} className="text-primary/80 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute bottom-4 left-4 right-4 h-12 border-t border-border/50 flex items-end justify-between px-2 pb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="w-1 bg-primary/40 animate-pulse" style={{ height: `${Math.random() * 20 + 5}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-foreground/40 font-mono">SYS.ONLINE</span>
                </div>
              </div>
              
              {/* Glow behind the box */}
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
              Crafting Worlds <br/>Through Sound.
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

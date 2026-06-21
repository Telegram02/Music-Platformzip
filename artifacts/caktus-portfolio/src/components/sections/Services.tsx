import { motion } from "framer-motion";
import { Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker } from "lucide-react";

const services = [
  {
    icon: <Music2 size={32} />,
    title: "Music Production",
    desc: "Full-scale track production from concept to completion. Specializing in electronic, rock, metal, hip-hop, and industrial genres.",
    color: "from-purple-500/20 to-primary/5"
  },
  {
    icon: <Gamepad2 size={32} />,
    title: "Game Soundtracks",
    desc: "Adaptive, dynamic, and immersive musical scores tailored for indie developers and AAA game studios.",
    color: "from-blue-500/20 to-accent/5"
  },
  {
    icon: <Radio size={32} />,
    title: "Sound Design & FX",
    desc: "Bespoke sound effects, foley, and synthesis for UI, environments, characters, and cinematic sequences.",
    color: "from-pink-500/20 to-pink-900/5"
  },
  {
    icon: <SlidersHorizontal size={32} />,
    title: "Mixing & Mastering",
    desc: "Industry-standard audio engineering to ensure your tracks hit hard, sound wide, and translate across all playback systems.",
    color: "from-emerald-500/20 to-emerald-900/5"
  },
  {
    icon: <Film size={32} />,
    title: "Trailer & Cinematic",
    desc: "Massive, orchestral-hybrid compositions designed for film, animation, and promotional trailers.",
    color: "from-orange-500/20 to-orange-900/5"
  },
  {
    icon: <Speaker size={32} />,
    title: "Commercial Audio",
    desc: "Striking audio branding, sonic logos, and high-impact background tracks for brands and agencies.",
    color: "from-cyan-500/20 to-cyan-900/5"
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 relative bg-card/30 border-y border-border/30">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 bg-card border border-border/50 rounded-sm hover:border-primary/50 transition-colors duration-500 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 bg-background border border-border rounded-sm flex items-center justify-center mb-6 text-foreground group-hover:text-primary group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-[0_0_0_rgba(0,0,0,0)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-display font-bold text-white mb-3 tracking-wide">
                  {service.title}
                </h3>
                
                <p className="text-foreground/60 font-light leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

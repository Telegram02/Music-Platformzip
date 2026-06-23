import { motion } from "framer-motion";
import { Monitor, Smartphone, Mic2, Clapperboard, Video, Building2, Briefcase, Zap } from "lucide-react";

const industries = [
  { icon: <Monitor size={24} />, name: "Game Studios" },
  { icon: <Smartphone size={24} />, name: "Indie Developers" },
  { icon: <Mic2 size={24} />, name: "Artists & Rappers" },
  { icon: <Clapperboard size={24} />, name: "Film Makers" },
  { icon: <Video size={24} />, name: "Content Creators" },
  { icon: <Zap size={24} />, name: "Brands" },
  { icon: <Briefcase size={24} />, name: "Agencies" },
  { icon: <Building2 size={24} />, name: "Corporate Clients" },
];

export function Industries() {
  return (
    <section className="py-24 border-y border-border/30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] relative">
      <div className="absolute inset-0 bg-background/90" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-mono text-primary uppercase tracking-[0.3em] mb-4">Collaborators</h2>
          <h3 className="text-3xl font-display font-bold text-white">Audio tailored for every medium.</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {industries.map((ind, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex flex-col items-center justify-center p-8 bg-card border border-border/40 rounded-sm hover:bg-card/80 hover:border-primary/30 group transition-all"
            >
              <div className="text-foreground/40 group-hover:text-primary transition-colors duration-300 mb-4 group-hover:scale-110 transform">
                {ind.icon}
              </div>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-white text-center">
                {ind.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

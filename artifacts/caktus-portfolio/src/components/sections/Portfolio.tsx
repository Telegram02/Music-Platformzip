import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";

const portfolioItems = [
  {
    id: 1,
    title: "Cyberpunk Cityscape",
    category: "Game Soundtrack",
    type: "Electronic / Industrial",
    color: "text-cyan-400"
  },
  {
    id: 2,
    title: "Void Walker",
    category: "Artist Production",
    type: "Metalcore",
    color: "text-red-500"
  },
  {
    id: 3,
    title: "Neon Shadows",
    category: "Commercial Audio",
    type: "Synthwave",
    color: "text-purple-500"
  },
  {
    id: 4,
    title: "Abyssal Horror",
    category: "Sound Design",
    type: "Ambient / Drone",
    color: "text-emerald-500"
  },
  {
    id: 5,
    title: "The Uprising",
    category: "Cinematic Trailer",
    type: "Orchestral Hybrid",
    color: "text-orange-500"
  },
  {
    id: 6,
    title: "Midnight Drive",
    category: "Mixing & Mastering",
    type: "Hip-Hop",
    color: "text-blue-500"
  }
];

function AudioPlayerMockup({ item }: { item: typeof portfolioItems[0] }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-background/80 border border-border/50 p-6 rounded-sm backdrop-blur-sm group-hover:border-primary/40 transition-colors relative overflow-hidden flex flex-col h-full">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
          <p className="text-xs text-foreground/50 uppercase tracking-widest">{item.category}</p>
        </div>
        <div className={`text-xs font-mono px-2 py-1 bg-card border border-border rounded-sm ${item.color}`}>
          {item.type}
        </div>
      </div>

      {/* Fake Waveform */}
      <div className="flex-grow flex items-center justify-center py-4 mb-4">
        <div className="w-full flex items-center gap-[2px] h-12">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = Math.random() * 100;
            const isPlayed = i < 15;
            return (
              <div 
                key={i}
                className={`flex-1 rounded-full ${
                  isPlayed ? 'bg-primary' : 'bg-foreground/20'
                } ${isPlaying && !isPlayed ? 'animate-pulse' : ''}`}
                style={{ 
                  height: `${Math.max(10, height)}%`,
                  opacity: isPlayed ? 1 : 0.5,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs font-mono text-foreground/50">01:24</span>
        
        <div className="flex items-center gap-4">
          <button className="text-foreground/50 hover:text-white transition-colors">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
          </button>
          <button className="text-foreground/50 hover:text-white transition-colors">
            <SkipForward size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-foreground/50">
          <Volume2 size={14} />
          <div className="w-12 h-1 bg-foreground/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-foreground/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-bold mb-6"
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
              A selection of recent productions, mixes, and sound design projects across various media.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-2"
          >
            {/* Filter pills placeholder */}
            {['All', 'Music', 'Games', 'Sound Design'].map((filter, i) => (
              <button 
                key={filter}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm border transition-colors ${
                  i === 0 ? 'bg-primary border-primary text-white' : 'bg-transparent border-border text-foreground/60 hover:text-white hover:border-foreground/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>

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
              <AudioPlayerMockup item={item} />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-8 py-4 border border-border bg-card hover:bg-card/80 hover:border-primary/50 text-white font-medium uppercase tracking-widest text-sm rounded-sm transition-all duration-300">
            Load More Projects
          </button>
        </div>
      </div>
    </section>
  );
}

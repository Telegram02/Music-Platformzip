import { motion } from "framer-motion";
import { Music2, Users, ArrowRight, Sparkles } from "lucide-react";

const opportunities = [
  {
    icon: <Music2 size={32} />,
    tag: "Open To",
    title: "Production & Composition",
    description:
      "Available for any project that needs a strong musical identity — artist releases, film and game scores, trailers, commercial audio, or experimental work. If you have a vision that needs sound, let's build it.",
    highlights: ["Artists & independent releases", "Film, game & trailer scoring", "Full production or composition only", "Any genre or tone"],
    accent: "from-primary/20 to-primary/5",
    border: "border-primary/30 hover:border-primary/60",
    glow: "group-hover:shadow-[0_0_40px_rgba(147,51,234,0.15)]",
    tagColor: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: <Users size={32} />,
    tag: "Open To",
    title: "Creative Collaboration",
    description:
      "Looking for long-term creative partners — whether that's a band, a studio, or a team where music is central. Metal, rock, experimental — I'm open to the conversation and ready to build something together.",
    highlights: ["Bands & ensembles", "Studios & creative teams", "Remote or in-person", "Long-term partnership"],
    accent: "from-accent/20 to-accent/5",
    border: "border-accent/30 hover:border-accent/60",
    glow: "group-hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]",
    tagColor: "text-accent bg-accent/10 border-accent/20",
  },
];

export function LookingFor() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle gradient bleed from hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Open to Opportunities</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            What I'm looking for
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            8 years of production and still hungry for the right collaborations. Here's exactly where I want to be.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {opportunities.map((opp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`group relative bg-gradient-to-br ${opp.accent} bg-card border ${opp.border} rounded-sm p-8 transition-all duration-300 ${opp.glow}`}
            >
              {/* Tag */}
              <span className={`inline-block text-xs font-mono px-3 py-1 rounded-full border mb-6 ${opp.tagColor}`}>
                {opp.tag}
              </span>

              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-5">
                <div className="text-foreground/30 group-hover:text-white/70 transition-colors duration-300 mt-0.5 shrink-0">
                  {opp.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-white leading-tight">{opp.title}</h3>
              </div>

              {/* Description */}
              <p className="text-foreground/60 text-sm leading-relaxed mb-6">{opp.description}</p>

              {/* Highlights */}
              <ul className="space-y-2">
                {opp.highlights.map((h, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-foreground/50">
                    <span className="w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#contact"
            onClick={scrollToContact}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-medium shadow-[0_0_24px_rgba(147,51,234,0.35)] hover:shadow-[0_0_36px_rgba(147,51,234,0.55)] hover:-translate-y-0.5 hover:bg-primary/90 transition-all duration-300 group"
          >
            Let's talk
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          <p className="text-foreground/30 text-xs mt-4 font-mono">
            madebycaktus@gmail.com
          </p>
        </motion.div>
      </div>
    </section>
  );
}

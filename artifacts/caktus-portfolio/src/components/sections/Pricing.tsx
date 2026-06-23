import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Layers, Cpu, Waves,
  Disc3, Drum, Guitar, Skull, Flame, Compass, type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type PricingItem } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteData";

const ICON_MAP: Record<string, LucideIcon> = {
  Music2, Gamepad2, Radio, SlidersHorizontal, Film, Speaker,
  Headphones, Mic, Volume2, Zap, Layers, Cpu, Waves,
  Disc3, Drum, Guitar, Skull, Flame, Compass,
};

function parsedFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split("\n").map((l) => l.trim()).filter(Boolean);
  }
}

interface PricingProps {
  onRequestCommission: (packageTitle?: string) => void;
}

export function Pricing({ onRequestCommission }: PricingProps) {
  const { data: items } = useQuery<PricingItem[]>({
    queryKey: ["pricing"],
    queryFn: () => api.getPricing(),
    staleTime: 30_000,
  });
  const { data: settings } = useSiteSettings();

  if (settings && settings.pricingVisible === "false") return null;
  if (!items || items.length === 0) return null;

  return (
    <section id="pricing" className="py-24 relative bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-primary font-mono mb-3"
          >
            Rates
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-display font-bold mb-4"
          >
            Transparent Pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/60 text-lg font-light"
          >
            No surprises. Every project starts with a free consultation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.iconName] ?? Music2;
            const features = parsedFeatures(item.features);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col p-8 rounded-sm border transition-all duration-300 ${
                  item.popular
                    ? "border-primary/50 bg-card shadow-[0_0_40px_rgba(147,51,234,0.15)]"
                    : "border-border/50 bg-card hover:border-primary/30"
                }`}
              >
                {item.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                      <Star size={10} className="fill-white" /> Most Popular
                    </span>
                  </div>
                )}

                <div className={`absolute inset-0 rounded-sm bg-gradient-to-br ${item.colorClass} opacity-40 pointer-events-none`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-sm border flex items-center justify-center ${
                      item.popular
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-background border-border/50 text-foreground/70"
                    }`}>
                      <Icon size={24} />
                    </div>
                    {item.subtitle && (
                      <span className="text-xs text-foreground/40 font-mono uppercase tracking-wider pt-1">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-foreground/55 text-sm font-light mb-6 leading-relaxed">{item.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold text-white">{item.price}</span>
                    {item.priceUnit && (
                      <span className="text-foreground/40 text-sm font-mono ml-2">{item.priceUnit}</span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/70">
                          <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => onRequestCommission(item.title)}
                    className={`mt-auto w-full flex items-center justify-center py-3 rounded-sm font-medium text-sm uppercase tracking-wider transition-all duration-300 ${
                      item.popular
                        ? "bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                        : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    Request This
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-foreground/30 text-sm font-mono mt-10"
        >
          All prices are starting rates. Final quote depends on scope, length, and revision rounds.
        </motion.p>
      </div>
    </section>
  );
}

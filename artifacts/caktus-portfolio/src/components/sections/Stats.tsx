import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteData";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const STATS = [
  { label: "Years Producing", key: "yearsExperience", fallback: 10, suffix: "+" },
  { label: "Genres Mastered", key: null, fallback: 12, suffix: "+" },
  { label: "Projects Delivered", key: null, fallback: 80, suffix: "+" },
  { label: "Satisfied Clients", key: null, fallback: 50, suffix: "+" },
];

export function Stats() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="py-12 bg-card/40 border-y border-border/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border/30">
          {STATS.map((stat, i) => {
            const value = stat.key && settings?.[stat.key]
              ? parseInt(settings[stat.key], 10) || stat.fallback
              : stat.fallback;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex flex-col items-center justify-center py-6 px-4 text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  <AnimatedNumber target={value} suffix={stat.suffix} />
                </p>
                <p className="text-xs uppercase tracking-widest text-foreground/40 font-mono">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

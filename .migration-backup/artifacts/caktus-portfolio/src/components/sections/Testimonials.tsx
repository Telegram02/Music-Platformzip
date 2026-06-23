import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTestimonials, useSiteSettings, type Testimonial } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-primary text-primary" : "fill-transparent text-foreground/20"}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  const avatarUrl = item.authorAvatar ? storageUrl(item.authorAvatar) : "";
  const initials = item.authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex flex-col p-8 bg-card border border-border/50 rounded-sm hover:border-primary/30 transition-colors duration-500 group overflow-hidden"
    >
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Quote icon */}
      <div className="mb-5">
        <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Quote size={18} className="text-primary fill-primary/20" />
        </div>
      </div>

      {/* Stars */}
      <div className="mb-4">
        <StarRating rating={item.rating} />
      </div>

      {/* Quote text */}
      <blockquote className="flex-grow text-foreground/80 font-light leading-relaxed text-base italic mb-8">
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4 pt-6 border-t border-border/40">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={item.authorName}
            className="w-11 h-11 rounded-full object-cover border-2 border-border/50 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold tracking-wider">{initials}</span>
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">{item.authorName}</p>
          {item.authorTitle && (
            <p className="text-foreground/40 text-xs mt-0.5 uppercase tracking-wider">{item.authorTitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.testimonialsBgImage ? storageUrl(settings.testimonialsBgImage) : "";

  if (settings && settings.testimonialsVisible === "false") return null;
  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="py-24 relative bg-card/30 border-y border-border/30 overflow-hidden"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />}

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-xs font-mono uppercase tracking-[0.3em] mb-4"
          >
            Client Feedback
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-display font-bold mb-6"
          >
            What They Say.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/60 text-lg font-light"
          >
            Real words from artists, developers, and studios.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-card border border-border/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <TestimonialCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { FaYoutube, FaInstagram, FaSoundcloud, FaDiscord, FaTiktok, FaTwitter, FaSpotify, FaTwitch } from "react-icons/fa";
import { useSiteSettings, useSocialLinks } from "@/hooks/useSiteData";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <FaYoutube size={20} />,
  instagram: <FaInstagram size={20} />,
  soundcloud: <FaSoundcloud size={20} />,
  discord: <FaDiscord size={20} />,
  tiktok: <FaTiktok size={20} />,
  twitter: <FaTwitter size={20} />,
  spotify: <FaSpotify size={20} />,
  twitch: <FaTwitch size={20} />,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "hover:text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/5",
  instagram: "hover:text-[#E1306C] hover:border-[#E1306C] hover:bg-[#E1306C]/5",
  soundcloud: "hover:text-[#FF5500] hover:border-[#FF5500] hover:bg-[#FF5500]/5",
  discord: "hover:text-[#5865F2] hover:border-[#5865F2] hover:bg-[#5865F2]/5",
  tiktok: "hover:text-white hover:border-white hover:bg-white/5",
  twitter: "hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5",
  spotify: "hover:text-[#1DB954] hover:border-[#1DB954] hover:bg-[#1DB954]/5",
  twitch: "hover:text-[#9146FF] hover:border-[#9146FF] hover:bg-[#9146FF]/5",
};

export function Contact() {
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useSocialLinks();

  const email = settings?.contactEmail ?? "caktusaudio@gmail.com";
  const discord = settings?.discord ?? "caktus";

  const discordLink = socialLinks.find((l) => l.platform === "discord");
  const otherLinks = socialLinks.filter((l) => l.platform !== "discord" && l.url);

  return (
    <section id="contact" className="py-32 relative bg-card border-t border-border/30 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-t-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
              Let's build something <span className="text-primary italic">massive.</span>
            </h2>
            <p className="text-xl text-foreground/70 font-light mb-12 max-w-2xl mx-auto">
              Currently accepting projects for Q4. Reach out to discuss your vision, rates, and availability.
            </p>
            
            <a 
              href={`mailto:${email}`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-sm hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:-translate-y-1 group mb-16"
            >
              <Mail size={20} />
              {email}
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </motion.div>
          
          <div className="w-full h-[1px] bg-border/50 mb-12" />
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="flex items-center gap-2 text-foreground/60 font-mono text-sm">
              <FaDiscord size={20} className="text-[#5865F2]" />
              <span>Discord: {discordLink?.url || discord}</span>
            </div>
            
            <div className="flex gap-4 flex-wrap justify-center md:justify-end">
              {otherLinks.length > 0
                ? otherLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground transition-all ${PLATFORM_COLORS[link.platform] ?? "hover:text-white hover:border-white hover:bg-white/5"}`}
                    >
                      {PLATFORM_ICONS[link.platform] ?? <span className="text-xs capitalize">{link.platform[0]}</span>}
                    </a>
                  ))
                : (
                  <>
                    <a href="#" className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground hover:text-[#FF5500] hover:border-[#FF5500] transition-all">
                      <FaSoundcloud size={20} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground hover:text-[#E1306C] hover:border-[#E1306C] transition-all">
                      <FaInstagram size={20} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground hover:text-[#FF0000] hover:border-[#FF0000] transition-all">
                      <FaYoutube size={20} />
                    </a>
                  </>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Mail, ArrowRight, Send, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { FaYoutube, FaInstagram, FaSoundcloud, FaDiscord, FaTiktok, FaTwitter, FaSpotify, FaTwitch } from "react-icons/fa";
import { useSiteSettings, useSocialLinks } from "@/hooks/useSiteData";
import { api } from "@/lib/api";

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

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", _hp: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const email = settings?.contactEmail ?? "caktusaudio@gmail.com";
  const discord = settings?.discord ?? "caktus";
  const availability = settings?.availability ?? "Currently accepting projects for Q4. Reach out to discuss your vision, rates, and availability.";

  const [copied, setCopied] = useState(false);
  function copyEmail() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const discordLink = socialLinks.find((l) => l.platform === "discord");
  const otherLinks = socialLinks.filter((l) => l.platform !== "discord" && l.url);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setError("");
    try {
      await api.submitContact(form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "", _hp: "" });
    } catch (err) {
      setError((err as Error).message ?? "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-20 sm:py-32 relative bg-card border-t border-border/30 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-t-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-6">
              Let's build something <span className="text-primary italic">massive.</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground/70 font-light max-w-2xl mx-auto">
              {availability}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-12 mb-16">
            {/* Direct contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-mono">Direct Contact</p>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-sm hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:-translate-y-1 group flex-1 justify-center text-sm sm:text-base"
                  >
                    <Mail size={18} />
                    <span className="truncate">{email}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform flex-shrink-0" />
                  </a>
                  <button
                    onClick={copyEmail}
                    title="Copy email"
                    className={`flex-shrink-0 w-14 rounded-sm border transition-all duration-200 flex items-center justify-center ${
                      copied
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-white/20 bg-white/5 text-white/50 hover:text-white hover:border-white/40"
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-background/50 border border-border/30 rounded-sm">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-mono">Discord</p>
                <div className="flex items-center gap-2 text-foreground/80 font-mono">
                  <FaDiscord size={20} className="text-[#5865F2]" />
                  <span>{discordLink?.url || discord}</span>
                </div>
              </div>

              {otherLinks.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-mono">Find Me Online</p>
                  <div className="flex gap-3 flex-wrap">
                    {otherLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground transition-all ${PLATFORM_COLORS[link.platform] ?? "hover:text-white hover:border-white hover:bg-white/5"}`}
                      >
                        {PLATFORM_ICONS[link.platform] ?? <span className="text-xs capitalize">{link.platform[0]}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-mono">Send a Message</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 h-64 text-center p-8 border border-emerald-500/30 rounded-sm bg-emerald-500/5">
                  <CheckCircle size={40} className="text-emerald-400" />
                  <div>
                    <p className="text-white font-semibold text-lg">Message sent!</p>
                    <p className="text-white/50 text-sm mt-1">I'll get back to you as soon as possible.</p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-white/40 hover:text-white underline transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot — hidden from real users, bots fill it in */}
                  <input
                    name="_hp"
                    value={form._hp}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute opacity-0 pointer-events-none -z-10 w-0 h-0"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name *"
                      required
                      maxLength={100}
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Your email *"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    />
                  </div>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject (optional)"
                    maxLength={300}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project *"
                    required
                    rows={5}
                    maxLength={5000}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none"
                  />
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          <div className="w-full h-[1px] bg-border/50" />
        </div>
      </div>
    </section>
  );
}

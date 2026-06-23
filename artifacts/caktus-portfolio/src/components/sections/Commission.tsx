import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { GENRE_ICON_GROUPS } from "@/lib/genreIcons";
import { api } from "@/lib/api";

const PROJECT_TYPES = [
  { id: "game",       label: "Game Soundtrack" },
  { id: "film",       label: "Film / TV Score" },
  { id: "track",      label: "Track Production" },
  { id: "sound",      label: "Sound Design" },
  { id: "mixing",     label: "Mixing & Mastering" },
  { id: "horror",     label: "Horror Score" },
  { id: "commercial", label: "Commercial / Ad" },
  { id: "other",      label: "Other" },
];

const BUDGETS = [
  { id: "sub200",    label: "Under $200" },
  { id: "200-500",   label: "$200 – $500" },
  { id: "500-1000",  label: "$500 – $1,000" },
  { id: "1000-2500", label: "$1,000 – $2,500" },
  { id: "2500plus",  label: "$2,500+" },
  { id: "discuss",   label: "Let's Discuss" },
];

const DEADLINES = [
  { id: "asap",      label: "ASAP" },
  { id: "1month",    label: "Within 1 month" },
  { id: "1-3months", label: "1 – 3 months" },
  { id: "3-6months", label: "3 – 6 months" },
  { id: "6plus",     label: "6+ months" },
  { id: "flexible",  label: "No deadline" },
];

interface FormState {
  name: string; email: string; projectType: string; genre: string;
  budget: string; deadline: string; description: string; references: string; _hp: string;
}

const EMPTY: FormState = {
  name: "", email: "", projectType: "", genre: "",
  budget: "", deadline: "", description: "", references: "", _hp: "",
};

export function Commission() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function toggle(key: "projectType" | "genre" | "budget" | "deadline", value: string) {
    setForm((p) => ({ ...p, [key]: p[key] === value ? "" : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.projectType || !form.description) return;
    setSubmitting(true);
    setError("");

    const genreGroup = GENRE_ICON_GROUPS.find((g) => g.icons.some((i) => i.name === form.genre));
    const budgetEntry  = BUDGETS.find((b) => b.id === form.budget);
    const deadlineEntry = DEADLINES.find((d) => d.id === form.deadline);
    const projectEntry  = PROJECT_TYPES.find((p) => p.id === form.projectType);

    const subject = `[Commission Request] ${projectEntry?.label ?? form.projectType}`;
    const message = [
      `PROJECT TYPE: ${projectEntry?.label ?? form.projectType}`,
      form.genre   ? `GENRE: ${genreGroup?.label ?? form.genre} (icon: ${form.genre})`    : null,
      form.budget  ? `BUDGET: ${budgetEntry?.label ?? form.budget}`   : null,
      form.deadline? `TIMELINE: ${deadlineEntry?.label ?? form.deadline}` : null,
      ``,
      `DESCRIPTION:`,
      form.description,
      form.references ? `\nREFERENCE LINKS:\n${form.references}` : null,
    ].filter((l) => l !== null).join("\n");

    try {
      await api.submitContact({ name: form.name, email: form.email, subject, message, _hp: form._hp });
      setSubmitted(true);
      setForm(EMPTY);
    } catch (err) {
      setError((err as Error).message ?? "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = form.name && form.email && form.projectType && form.description.length >= 10;

  return (
    <section id="commission" className="py-24 relative bg-card/20 border-y border-border/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-mono mb-3">Commission Request</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Request a Track.</h2>
            <p className="text-foreground/60 text-lg font-light">
              Fill out the form below and I'll get back to you with availability, rates, and timeline.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-6 py-20 text-center border border-emerald-500/30 rounded-sm bg-emerald-500/5">
              <CheckCircle size={52} className="text-emerald-400" />
              <div>
                <p className="text-white font-bold text-2xl font-display mb-2">Request received.</p>
                <p className="text-white/50 font-light">I'll review your project and reach out within 24–48 hours.</p>
              </div>
              <button onClick={() => setSubmitted(false)} className="text-sm text-white/40 hover:text-white underline transition-colors">
                Submit another request
              </button>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-8">
              {/* Honeypot */}
              <input name="_hp" value={form._hp} onChange={(e) => set("_hp", e.target.value)}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
                className="absolute opacity-0 pointer-events-none -z-10 w-0 h-0" />

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">Your Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="Full name" required maxLength={100}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm" />
                </div>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">Project Type *</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button key={pt.id} type="button" onClick={() => toggle("projectType", pt.id)}
                      className={`px-4 py-2 rounded-sm border text-sm font-medium transition-all ${
                        form.projectType === pt.id
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                      }`}>
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre — grouped icon picker */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                  Genre <span className="text-white/25 normal-case">(optional)</span>
                </label>
                <div className="space-y-2">
                  {GENRE_ICON_GROUPS.map((group) => (
                    <div key={group.label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${group.borderColor} ${group.bgColor}`}>
                      <span className={`text-[10px] font-mono uppercase tracking-wider w-20 flex-shrink-0 ${group.textColor}`}>
                        {group.label}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {group.icons.map(({ name, icon: Icon }) => (
                          <button key={name} type="button" title={name}
                            onClick={() => toggle("genre", name)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
                              form.genre === name
                                ? `${group.activeBorder} ${group.activeBg} ${group.textColor}`
                                : "border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white"
                            }`}>
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                    Budget <span className="text-white/25 normal-case">(optional)</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {BUDGETS.map((b) => (
                      <button key={b.id} type="button" onClick={() => toggle("budget", b.id)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-sm border text-sm transition-all ${
                          form.budget === b.id
                            ? "border-primary bg-primary/10 text-white"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                        }`}>
                        {b.label}
                        {form.budget === b.id && <ChevronRight size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                    Timeline <span className="text-white/25 normal-case">(optional)</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {DEADLINES.map((d) => (
                      <button key={d.id} type="button" onClick={() => toggle("deadline", d.id)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-sm border text-sm transition-all ${
                          form.deadline === d.id
                            ? "border-accent bg-accent/10 text-white"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                        }`}>
                        {d.label}
                        {form.deadline === d.id && <ChevronRight size={14} className="text-accent" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">Project Description *</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe your project in detail — mood, setting, inspirations, and any specific requirements..."
                  required rows={5} maxLength={5000}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none" />
                <p className="text-white/20 text-xs mt-1 text-right">{form.description.length} / 5000</p>
              </div>

              {/* Reference Links */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">
                  Reference Tracks / Links <span className="text-white/25 normal-case">(optional)</span>
                </label>
                <textarea value={form.references} onChange={(e) => set("references", e.target.value)}
                  placeholder="YouTube, Spotify, SoundCloud links — anything that gives a feel for what you're going for..."
                  rows={3} maxLength={2000}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button type="submit" disabled={submitting || !isValid}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                {submitting ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <><Send size={16} /> Submit Commission Request</>
                )}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}

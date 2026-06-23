import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle, X } from "lucide-react";
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
  { id: "sub200",    label: "< $200" },
  { id: "200-500",   label: "$200–$500" },
  { id: "500-1000",  label: "$500–$1k" },
  { id: "1000-2500", label: "$1k–$2.5k" },
  { id: "2500plus",  label: "$2.5k+" },
  { id: "discuss",   label: "Discuss" },
];

const DEADLINES = [
  { id: "asap",      label: "ASAP" },
  { id: "1month",    label: "1 month" },
  { id: "1-3months", label: "1–3 mo" },
  { id: "3-6months", label: "3–6 mo" },
  { id: "6plus",     label: "6+ mo" },
  { id: "flexible",  label: "Flexible" },
];

interface FormState {
  name: string; email: string; projectType: string;
  budget: string; deadline: string; description: string; references: string; _hp: string;
}

const EMPTY: FormState = {
  name: "", email: "", projectType: "",
  budget: "", deadline: "", description: "", references: "", _hp: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedPackage?: string;
}

export function CommissionModal({ open, onClose, preselectedPackage }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setSubmitted(false);
      setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set(key: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function toggle(key: "projectType" | "budget" | "deadline", value: string) {
    setForm((p) => ({ ...p, [key]: p[key] === value ? "" : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.projectType || !form.description) return;
    setSubmitting(true);
    setError("");

    const budgetEntry   = BUDGETS.find((b) => b.id === form.budget);
    const deadlineEntry = DEADLINES.find((d) => d.id === form.deadline);
    const projectEntry  = PROJECT_TYPES.find((p) => p.id === form.projectType);

    const subject = `[Commission] ${preselectedPackage ? `${preselectedPackage} — ` : ""}${projectEntry?.label ?? form.projectType}`;
    const message = [
      preselectedPackage ? `PACKAGE: ${preselectedPackage}` : null,
      `PROJECT TYPE: ${projectEntry?.label ?? form.projectType}`,
      form.budget   ? `BUDGET: ${budgetEntry?.label ?? form.budget}`     : null,
      form.deadline ? `TIMELINE: ${deadlineEntry?.label ?? form.deadline}` : null,
      ``,
      `DESCRIPTION:`,
      form.description,
      form.references ? `\nREFERENCE LINKS:\n${form.references}` : null,
    ].filter((l) => l !== null).join("\n");

    try {
      await api.submitContact({ name: form.name, email: form.email, subject, message, _hp: form._hp });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = form.name && form.email && form.projectType && form.description.length >= 10;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border/50 rounded-sm shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center gap-6 py-16 text-center"
                  >
                    <CheckCircle size={52} className="text-emerald-400" />
                    <div>
                      <p className="text-white font-bold text-2xl font-display mb-2">Request received.</p>
                      <p className="text-white/50 font-light">I'll review your project and reach out within 24–48 hours.</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-widest text-primary font-mono mb-2">Commission Request</p>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                        {preselectedPackage ? `Request — ${preselectedPackage}` : "Request a Track"}
                      </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <input name="_hp" value={form._hp} onChange={(e) => set("_hp", e.target.value)}
                        tabIndex={-1} autoComplete="off" aria-hidden="true"
                        className="absolute opacity-0 pointer-events-none -z-10 w-0 h-0" />

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

                      <div>
                        <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">Project Type *</label>
                        <div className="flex flex-wrap gap-2">
                          {PROJECT_TYPES.map((pt) => (
                            <button key={pt.id} type="button" onClick={() => toggle("projectType", pt.id)}
                              className={`px-3 py-1.5 rounded-sm border text-xs font-medium transition-all ${
                                form.projectType === pt.id
                                  ? "border-primary bg-primary/20 text-primary"
                                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                              }`}>
                              {pt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                            Budget <span className="text-white/25 normal-case">(optional)</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {BUDGETS.map((b) => (
                              <button key={b.id} type="button" onClick={() => toggle("budget", b.id)}
                                className={`px-3 py-1.5 rounded-sm border text-xs transition-all ${
                                  form.budget === b.id
                                    ? "border-primary bg-primary/10 text-white"
                                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                                }`}>
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                            Timeline <span className="text-white/25 normal-case">(optional)</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {DEADLINES.map((d) => (
                              <button key={d.id} type="button" onClick={() => toggle("deadline", d.id)}
                                className={`px-3 py-1.5 rounded-sm border text-xs transition-all ${
                                  form.deadline === d.id
                                    ? "border-accent bg-accent/10 text-white"
                                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                                }`}>
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">Project Description *</label>
                        <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                          placeholder="Describe your project — mood, setting, inspirations, specific requirements..."
                          required rows={4} maxLength={5000}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none" />
                        <p className="text-white/20 text-xs mt-1 text-right">{form.description.length} / 5000</p>
                      </div>

                      <div>
                        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-mono">
                          Reference Tracks <span className="text-white/25 normal-case">(optional)</span>
                        </label>
                        <textarea value={form.references} onChange={(e) => set("references", e.target.value)}
                          placeholder="YouTube, Spotify, SoundCloud links..."
                          rows={2} maxLength={2000}
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
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

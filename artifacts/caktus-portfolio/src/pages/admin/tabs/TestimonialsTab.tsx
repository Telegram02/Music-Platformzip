import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Testimonial } from "@/lib/api";
import { FileUploader } from "../components/FileUploader";
import { storageUrl } from "@/lib/api";
import { Plus, Pencil, Trash2, Star, X, Check, ChevronUp, ChevronDown, Eye, EyeOff, User } from "lucide-react";

const EMPTY_FORM = {
  quote: "", authorName: "", authorTitle: "", authorAvatar: "",
  rating: 5, sortOrder: 0, active: true,
};

type FormState = typeof EMPTY_FORM;

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={i < (hover || value)
              ? "fill-primary text-primary"
              : "fill-transparent text-white/20"}
          />
        </button>
      ))}
    </div>
  );
}

function TestimonialForm({
  initial, onSave, onCancel, saving,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function set(key: keyof FormState, value: string | number | boolean) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const avatarUrl = form.authorAvatar ? storageUrl(form.authorAvatar) : "";

  return (
    <div className="space-y-4 p-5 bg-white/3 rounded-xl border border-white/8">
      {/* Quote */}
      <div>
        <label className="block text-white/60 text-sm mb-1.5 font-medium">Quote *</label>
        <textarea
          value={form.quote}
          onChange={(e) => set("quote", e.target.value)}
          placeholder="What they said about your work..."
          rows={3}
          maxLength={1000}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none text-sm"
        />
        <p className="text-white/20 text-xs mt-1 text-right">{form.quote.length}/1000</p>
      </div>

      {/* Name + Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1.5 font-medium">Author Name *</label>
          <input
            value={form.authorName}
            onChange={(e) => set("authorName", e.target.value)}
            placeholder="Alex Johnson"
            maxLength={100}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1.5 font-medium">Title / Role</label>
          <input
            value={form.authorTitle}
            onChange={(e) => set("authorTitle", e.target.value)}
            placeholder="Indie Game Developer"
            maxLength={100}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-white/60 text-sm mb-2 font-medium">Rating</label>
        <StarPicker value={form.rating} onChange={(n) => set("rating", n)} />
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-white/60 text-sm mb-1.5 font-medium">Avatar Photo (optional)</label>
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : <User size={20} className="text-white/20" />}
          </div>
          <div className="flex-1 space-y-2">
            <input
              value={form.authorAvatar}
              onChange={(e) => set("authorAvatar", e.target.value)}
              placeholder="/objects/... or https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
            />
            <FileUploader
              accept="image/*"
              label="Upload avatar"
              onUploaded={(path) => set("authorAvatar", path)}
            />
          </div>
        </div>
      </div>

      {/* Sort order */}
      <div>
        <label className="block text-white/60 text-sm mb-1.5 font-medium">Sort Order</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value))}
          className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-all text-sm"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set("active", !form.active)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            form.active
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          {form.active ? <Eye size={14} /> : <EyeOff size={14} />}
          {form.active ? "Visible on site" : "Hidden from site"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.quote.trim() || !form.authorName.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Check size={15} />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 rounded-lg text-sm font-medium transition-colors"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TestimonialsTab() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials-admin"],
    queryFn: () => api.getTestimonials(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormState) => api.createTestimonial(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials-admin"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); setCreating(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormState }) => api.updateTestimonial(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials-admin"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTestimonial(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials-admin"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
  });

  const toggleActive = (t: Testimonial) =>
    updateMutation.mutate({ id: t.id, data: { ...t, active: !t.active } });

  const moveSort = (t: Testimonial, dir: -1 | 1) =>
    updateMutation.mutate({ id: t.id, data: { ...t, sortOrder: t.sortOrder + dir } });

  function toForm(t: Testimonial): FormState {
    return { quote: t.quote, authorName: t.authorName, authorTitle: t.authorTitle, authorAvatar: t.authorAvatar, rating: t.rating, sortOrder: t.sortOrder, active: t.active };
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Testimonials</h2>
          <p className="text-white/40 text-sm">Client quotes shown on your portfolio. Only visible to the public when at least one testimonial is active.</p>
        </div>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setEditingId(null); }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <TestimonialForm
          initial={{ ...EMPTY_FORM, sortOrder: testimonials.length }}
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setCreating(false)}
          saving={createMutation.isPending}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : testimonials.length === 0 && !creating ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
          <p className="text-white/20 text-sm">No testimonials yet — add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
              {editingId === t.id ? (
                <div className="p-4">
                  <TestimonialForm
                    initial={toForm(t)}
                    onSave={(data) => updateMutation.mutate({ id: t.id, data })}
                    onCancel={() => setEditingId(null)}
                    saving={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
                    {t.authorAvatar
                      ? <img src={storageUrl(t.authorAvatar)} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white text-xs font-bold">{t.authorName.slice(0, 2).toUpperCase()}</span>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium truncate">{t.authorName}</span>
                      {t.authorTitle && <span className="text-white/30 text-xs truncate">· {t.authorTitle}</span>}
                      <div className="flex gap-0.5 ml-auto flex-shrink-0">
                        {Array.from({ length: t.rating }, (_, i) => <Star key={i} size={10} className="fill-primary text-primary" />)}
                      </div>
                    </div>
                    <p className="text-white/40 text-xs line-clamp-2 italic">"{t.quote}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveSort(t, -1)}
                      className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSort(t, 1)}
                      className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive(t)}
                      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${t.active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/20 hover:text-white/60 hover:bg-white/10"}`}
                      title={t.active ? "Hide" : "Show"}
                    >
                      {t.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => { setEditingId(t.id); setCreating(false); }}
                      className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this testimonial?")) deleteMutation.mutate(t.id); }}
                      className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

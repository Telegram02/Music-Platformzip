import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, MailOpen, MailCheck, RefreshCw, Star, CheckCircle } from "lucide-react";
import { useMessages } from "@/hooks/useSiteData";
import { api, type ContactMessage } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ContactTab() {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, refetch } = useMessages();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [testimonialSent, setTestimonialSent] = useState<Set<number>>(new Set());
  const [sendingTestimonial, setSendingTestimonial] = useState(false);
  const [testimonialError, setTestimonialError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const unread = messages.filter((m) => !m.read).length;

  async function handleRequestTestimonial(id: number) {
    setSendingTestimonial(true);
    setTestimonialError("");
    try {
      await api.requestTestimonial(id);
      setTestimonialSent((prev) => new Set(prev).add(id));
    } catch (err) {
      setTestimonialError((err as Error).message ?? "Failed to send. Is email configured?");
    } finally {
      setSendingTestimonial(false);
    }
  }

  async function markRead(msg: ContactMessage, read: boolean) {
    await api.markMessageRead(msg.id, read);
    queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    if (selected?.id === msg.id) setSelected({ ...msg, read });
  }

  async function handleDelete(id: number) {
    await api.deleteMessage(id);
    setConfirmId(null);
    queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    if (selected?.id === id) setSelected(null);
  }

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.read) {
      await markRead(msg, true);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">
            Messages
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                {unread} new
              </span>
            )}
          </h2>
          <p className="text-white/40 text-sm">Contact form submissions from your portfolio.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-white/5 rounded-xl">
          <Mail size={32} className="text-white/20" />
          <p className="text-white/30 text-sm">No messages yet.</p>
          <p className="text-white/20 text-xs">Messages sent via the contact form will appear here.</p>
        </div>
      ) : selected ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelected(null)}
            className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Back to inbox
          </button>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-lg">{selected.name}</p>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-purple-400 text-sm hover:underline"
                >
                  {selected.email}
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white/30 text-xs font-mono">{timeAgo(selected.createdAt)}</span>
                <button
                  onClick={() => markRead(selected, !selected.read)}
                  className="p-1.5 text-white/30 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                  title={selected.read ? "Mark unread" : "Mark read"}
                >
                  {selected.read ? <MailOpen size={14} /> : <MailCheck size={14} />}
                </button>
                {confirmId === selected.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(selected.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium">
                      Delete
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(selected.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {selected.subject && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-1">Subject</p>
                <p className="text-white/80 text-sm font-medium">{selected.subject}</p>
              </div>
            )}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-2">Message</p>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Your message")}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-sm transition-colors"
              >
                <Mail size={14} />
                Reply via Email
              </a>

              {testimonialSent.has(selected.id) ? (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm">
                  <CheckCircle size={14} />
                  Testimonial Request Sent
                </span>
              ) : (
                <button
                  onClick={() => handleRequestTestimonial(selected.id)}
                  disabled={sendingTestimonial}
                  title="Send this person an email asking for a testimonial"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {sendingTestimonial
                    ? <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    : <Star size={14} />
                  }
                  Request Testimonial
                </button>
              )}

              {testimonialError && (
                <p className="w-full text-red-400 text-xs mt-1">{testimonialError}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:border-purple-500/30 hover:bg-white/8 ${
                msg.read ? "bg-white/3 border-white/5 opacity-70" : "bg-white/8 border-white/15"
              }`}
            >
              {!msg.read && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
              {msg.read && <div className="w-2 h-2 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${msg.read ? "text-white/60" : "text-white"}`}>
                    {msg.name}
                  </span>
                  {msg.subject && (
                    <span className="text-white/30 text-xs truncate">— {msg.subject}</span>
                  )}
                </div>
                <p className="text-white/30 text-xs truncate">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white/25 text-xs font-mono">{timeAgo(msg.createdAt)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                  className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

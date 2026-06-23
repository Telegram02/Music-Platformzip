import { useState } from "react";
import { useLocation } from "wouter";
import {
  Settings, Clapperboard, Film, Music, Link2, Inbox,
  LayoutDashboard, EyeOff, ChevronRight, Pencil
} from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

const SECTIONS = [
  { label: "Site", tab: "site", icon: <Settings size={11} />, section: "#home" },
  { label: "Services", tab: "services", icon: <Clapperboard size={11} />, section: "#services" },
  { label: "Portfolio", tab: "portfolio", icon: <Film size={11} />, section: "#portfolio" },
  { label: "Tracks", tab: "tracks", icon: <Music size={11} />, section: "#portfolio" },
  { label: "Social", tab: "social", icon: <Link2 size={11} />, section: "#contact" },
  { label: "Messages", tab: "messages", icon: <Inbox size={11} />, section: "#contact" },
];

export function AdminBar() {
  const { isAdmin } = useAdminStatus();
  const [, navigate] = useLocation();
  const [hidden, setHidden] = useState(false);

  if (!isAdmin || hidden) return null;

  function goToTab(tab: string) {
    navigate(`/admin?tab=${tab}`);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-10 bg-[#0d0d14] border-b border-purple-500/30 flex items-center px-4 gap-3 shadow-[0_2px_20px_rgba(147,51,234,0.15)]">
      {/* Brand */}
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
      >
        <LayoutDashboard size={13} />
        <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
          Admin
        </span>
      </button>

      <div className="w-px h-4 bg-white/10 flex-shrink-0" />

      {/* Edit shortcut label */}
      <div className="flex items-center gap-1 text-white/25 flex-shrink-0">
        <Pencil size={10} />
        <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:block">Edit</span>
      </div>

      {/* Section buttons */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
        {SECTIONS.map((s) => (
          <button
            key={s.tab}
            onClick={() => goToTab(s.tab)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all whitespace-nowrap flex-shrink-0 border border-transparent hover:border-white/10"
          >
            <span className="text-white/30">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <button
          onClick={() => navigate("/admin")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded text-[11px] font-medium transition-all"
        >
          Dashboard
          <ChevronRight size={11} />
        </button>
        <button
          onClick={() => setHidden(true)}
          className="p-1.5 text-white/20 hover:text-white/60 hover:bg-white/5 rounded transition-all"
          title="Hide admin bar"
        >
          <EyeOff size={12} />
        </button>
      </div>
    </div>
  );
}

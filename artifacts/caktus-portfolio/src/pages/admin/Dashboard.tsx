import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { LogOut, Settings, Music, Film, Link2, Image, Home, UserCog } from "lucide-react";
import SiteTab from "./tabs/SiteTab";
import TracksTab from "./tabs/TracksTab";
import PortfolioTab from "./tabs/PortfolioTab";
import SocialTab from "./tabs/SocialTab";
import MediaTab from "./tabs/MediaTab";
import AccountTab from "./tabs/AccountTab";

type Tab = "site" | "tracks" | "portfolio" | "social" | "media" | "account";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "site", label: "Site Settings", icon: <Settings size={16} /> },
  { id: "tracks", label: "Audio Tracks", icon: <Music size={16} /> },
  { id: "portfolio", label: "Portfolio", icon: <Film size={16} /> },
  { id: "social", label: "Social Links", icon: <Link2 size={16} /> },
  { id: "media", label: "Media Library", icon: <Image size={16} /> },
  { id: "account", label: "Account", icon: <UserCog size={16} /> },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("site");

  useEffect(() => {
    api.me()
      .then(() => setChecking(false))
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  async function handleLogout() {
    await api.logout();
    navigate("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xl text-purple-400"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              CAKTUS ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Home size={15} /> View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/50 hover:text-red-400 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className={tab === t.id ? "text-purple-400" : "text-white/30"}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {tab === "site" && <SiteTab />}
          {tab === "tracks" && <TracksTab />}
          {tab === "portfolio" && <PortfolioTab />}
          {tab === "social" && <SocialTab />}
          {tab === "media" && <MediaTab />}
          {tab === "account" && <AccountTab />}
        </main>
      </div>
    </div>
  );
}

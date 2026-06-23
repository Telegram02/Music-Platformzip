import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LogOut, Settings, Music, Film, Link2, Image, UserCog, Clapperboard, Inbox, ShieldCheck, ExternalLink, Menu, X, Star, DollarSign, BarChart2 } from "lucide-react";
import SiteTab from "./tabs/SiteTab";
import TracksTab from "./tabs/TracksTab";
import PortfolioTab from "./tabs/PortfolioTab";
import SocialTab from "./tabs/SocialTab";
import MediaTab from "./tabs/MediaTab";
import AccountTab from "./tabs/AccountTab";
import ServicesTab from "./tabs/ServicesTab";
import ContactTab from "./tabs/ContactTab";
import ActivityTab from "./tabs/ActivityTab";
import TestimonialsTab from "./tabs/TestimonialsTab";
import PricingTab from "./tabs/PricingTab";
import TrafficTab from "./tabs/TrafficTab";

type Tab = "site" | "tracks" | "portfolio" | "services" | "pricing" | "social" | "media" | "testimonials" | "messages" | "traffic" | "activity" | "account";

const VALID_TABS: Tab[] = ["site", "tracks", "portfolio", "services", "pricing", "social", "media", "testimonials", "messages", "traffic", "activity", "account"];

const TABS: { id: Tab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: "site", label: "Site Settings", icon: <Settings size={16} />, group: "Content" },
  { id: "services", label: "Services", icon: <Clapperboard size={16} />, group: "Content" },
  { id: "tracks", label: "Audio Tracks", icon: <Music size={16} />, group: "Content" },
  { id: "portfolio", label: "Portfolio", icon: <Film size={16} />, group: "Content" },
  { id: "pricing", label: "Pricing", icon: <DollarSign size={16} />, group: "Content" },
  { id: "testimonials", label: "Testimonials", icon: <Star size={16} />, group: "Content" },
  { id: "social", label: "Social Links", icon: <Link2 size={16} />, group: "Content" },
  { id: "media", label: "Media Library", icon: <Image size={16} />, group: "Content" },
  { id: "messages", label: "Messages", icon: <Inbox size={16} />, group: "Inbox" },
  { id: "traffic",  label: "Traffic",       icon: <BarChart2 size={16} />, group: "Analytics" },
  { id: "activity", label: "Login Activity", icon: <ShieldCheck size={16} />, group: "Security" },
  { id: "account",  label: "Account",        icon: <UserCog size={16} />, group: "Security" },
];

const GROUPS = ["Content", "Inbox", "Analytics", "Security"];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initialTab = (() => {
    const params = new URLSearchParams(search);
    const t = params.get("tab") as Tab | null;
    return t && VALID_TABS.includes(t) ? t : "site";
  })();

  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    api.me()
      .then(() => setChecking(false))
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: api.getUnreadCount,
    refetchInterval: 60_000,
    enabled: !checking,
  });
  const unreadCount = unreadData?.count ?? 0;

  function switchTab(t: Tab) {
    setTab(t);
    window.history.replaceState(null, "", `/admin?tab=${t}`);
    setSidebarOpen(false);
  }

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

  const currentTabLabel = TABS.find((t) => t.id === tab)?.label ?? "";

  const SidebarContent = () => (
    <nav className="space-y-5">
      {GROUPS.map((group) => {
        const groupTabs = TABS.filter((t) => t.group === group);
        return (
          <div key={group}>
            <p className="text-white/25 text-[10px] font-mono uppercase tracking-widest px-4 mb-1.5">
              {group}
            </p>
            <div className="space-y-0.5">
              {groupTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className={tab === t.id ? "text-purple-400" : "text-white/30"}>
                    {t.icon}
                  </span>
                  <span className="flex-1 text-left">{t.label}</span>
                  {t.id === "messages" && unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-xl text-purple-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CAKTUS ADMIN
            </span>
            <span className="lg:hidden text-white/30 text-sm truncate max-w-[120px]">
              / {currentTabLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/50 hover:text-red-400 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-[#0d0d15] border-r border-white/10 overflow-y-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-white/60 text-xs font-mono uppercase tracking-widest">Navigation</span>
          <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <SidebarContent />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:flex lg:gap-8">
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <SidebarContent />
          </div>
        </aside>

        <main className="flex-1 min-w-0 mt-2 lg:mt-0">
          {tab === "site" && <SiteTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "tracks" && <TracksTab />}
          {tab === "portfolio" && <PortfolioTab />}
          {tab === "pricing" && <PricingTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "social" && <SocialTab />}
          {tab === "media" && <MediaTab />}
          {tab === "messages" && <ContactTab />}
          {tab === "traffic"  && <TrafficTab />}
          {tab === "activity" && <ActivityTab />}
          {tab === "account" && <AccountTab />}
        </main>
      </div>
    </div>
  );
}

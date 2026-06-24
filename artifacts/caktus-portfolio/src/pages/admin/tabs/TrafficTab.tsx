import { useEffect, useState } from "react";
import { TrendingUp, Users, Eye, Calendar, Globe, RefreshCw } from "lucide-react";

interface DailyPoint { day: string; count: number }
interface PageCount  { path: string; count: number }

interface Analytics {
  total: number;
  last30Days: number;
  last7Days: number;
  today: number;
  uniqueVisitors30: number;
  topPages: PageCount[];
  daily: DailyPoint[];
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs mb-0.5">{label}</p>
        <p className="text-white font-bold text-xl leading-none">{value.toLocaleString()}</p>
        {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return <div className="text-white/20 text-sm text-center py-8">No data yet</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const date = new Date(d.day + "T12:00:00");
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group" title={`${label}: ${d.count} visits`}>
            <div
              className="w-full bg-purple-500/60 group-hover:bg-purple-400 rounded-t transition-colors"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function TrafficTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 text-sm">{error ?? "No data"}</p>
        <button onClick={() => load()} className="mt-4 text-white/40 hover:text-white text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Site Traffic</h2>
          <p className="text-white/40 text-sm">Visitor analytics for your portfolio site.</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard icon={<Eye size={18} />}       label="All-time visits"     value={data.total} />
        <StatCard icon={<Users size={18} />}     label="Unique visitors"     value={data.uniqueVisitors30} sub="last 30 days (by IP)" />
        <StatCard icon={<Calendar size={18} />}  label="Visits last 7 days"  value={data.last7Days} />
        <StatCard icon={<TrendingUp size={18} />} label="Today"              value={data.today} />
      </div>

      {/* Daily chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white/60 text-sm font-medium mb-4">Last 14 days</h3>
        <MiniBarChart data={data.daily} />
        {data.daily.length > 0 && (
          <div className="flex justify-between mt-2">
            <span className="text-white/20 text-xs">
              {new Date(data.daily[0].day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-white/20 text-xs">
              {new Date(data.daily[data.daily.length - 1].day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Top pages */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white/60 text-sm font-medium mb-4 flex items-center gap-2">
          <Globe size={14} /> Top Pages
        </h3>
        {data.topPages.length === 0 ? (
          <p className="text-white/20 text-sm">No page data yet</p>
        ) : (
          <div className="space-y-3">
            {data.topPages.map((p) => {
              const pct = data.total > 0 ? (p.count / data.total) * 100 : 0;
              return (
                <div key={p.path}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm font-mono truncate max-w-[60%]">{p.path || "/"}</span>
                    <span className="text-white/40 text-xs">{p.count.toLocaleString()} visits</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs">
        Visits are tracked anonymously. IP addresses are hashed and not stored directly. Unique visitor counts reset daily.
      </p>
    </div>
  );
}

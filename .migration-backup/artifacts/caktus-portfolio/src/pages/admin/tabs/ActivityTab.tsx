import { CheckCircle, XCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useActivity } from "@/hooks/useSiteData";

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ActivityTab() {
  const { data: activity = [], isLoading, refetch } = useActivity();

  const successCount = activity.filter((a) => a.success).length;
  const failureCount = activity.filter((a) => !a.success).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Login Activity</h2>
          <p className="text-white/40 text-sm">Recent authentication attempts to your admin panel.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {activity.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-white">{activity.length}</p>
            <p className="text-white/40 text-xs mt-1">Total Attempts</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-400">{successCount}</p>
            <p className="text-emerald-400/60 text-xs mt-1">Successful</p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-400">{failureCount}</p>
            <p className="text-red-400/60 text-xs mt-1">Failed</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-white/5 rounded-xl">
          <ShieldCheck size={32} className="text-white/20" />
          <p className="text-white/30 text-sm">No login attempts recorded yet.</p>
          <p className="text-white/20 text-xs">Activity is logged each time someone tries to log in.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activity.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                entry.success
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : "bg-red-500/5 border-red-500/15"
              }`}
            >
              {entry.success ? (
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono font-medium ${entry.success ? "text-emerald-300" : "text-red-300"}`}>
                    {entry.username}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.success
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {entry.success ? "Success" : "Failed"}
                  </span>
                </div>
                {entry.ipAddress && (
                  <p className="text-white/30 text-xs font-mono mt-0.5">
                    IP: {entry.ipAddress}
                  </p>
                )}
              </div>
              <span className="text-white/25 text-xs font-mono flex-shrink-0">
                {timeAgo(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {failureCount >= 5 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3">
          <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-semibold">Security Alert</p>
            <p className="text-red-400/70 text-xs mt-0.5">
              {failureCount} failed login attempts detected. Consider changing your password if you don't recognize these.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

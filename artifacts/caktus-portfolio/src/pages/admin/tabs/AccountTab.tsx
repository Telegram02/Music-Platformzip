import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, KeyRound } from "lucide-react";

type Step = "password" | "otp" | "done";

async function apiPost(path: string, body: Record<string, string>) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) ?? "Request failed");
  return data;
}

export default function AccountTab() {
  const [step, setStep] = useState<Step>("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("New passwords do not match"); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await apiPost("credentials/request-otp", { currentPassword });
      setSentTo((res.sentTo as string) ?? "your email");
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("credentials/verify-otp", { code: otp, newPassword, newEmail });
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("password");
    setCurrentPassword("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setSentTo("");
    setError("");
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-white mb-1">Account Credentials</h2>
      <p className="text-white/40 text-sm mb-8">
        Change your admin password. A 6-digit code will be emailed to verify it's you.
      </p>

      {step === "password" && (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div>
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Your current password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">New Email (optional)</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? "Sending code…" : "Send verification code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-4 text-sm text-purple-200">
            <p className="font-medium mb-1">Check your email</p>
            <p className="text-purple-300/70">A 6-digit code was sent to <span className="text-white font-mono">{sentTo}</span>. It expires in 10 minutes.</p>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">6-Digit Code</label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 font-mono text-xl tracking-[0.5em]"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? "Verifying…" : "Confirm change"}
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-5 py-6 text-center">
            <ShieldCheck size={32} className="text-green-400 mx-auto mb-3" />
            <p className="text-green-300 font-semibold text-lg mb-1">Credentials updated!</p>
            <p className="text-green-400/60 text-sm">Your new password is active. You'll need it on your next login.</p>
          </div>
          <button
            onClick={reset}
            className="w-full py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm"
          >
            Change again
          </button>
        </div>
      )}
    </div>
  );
}

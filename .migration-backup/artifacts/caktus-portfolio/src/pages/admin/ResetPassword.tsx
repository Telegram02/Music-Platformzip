import { useState } from "react";
import { useLocation } from "wouter";
import { KeyRound, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, User } from "lucide-react";

type Step = "request" | "confirm" | "done";

async function apiPost(path: string, body: Record<string, string>) {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) ?? "Request failed");
  return data;
}

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("request");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiPost("request-reset", {});
      setSentTo((res.sentTo as string) ?? "your email");
      setStep("confirm");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await apiPost("confirm-reset", { code, newPassword, newUsername });
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-4xl text-white mb-1"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CAKTUS PRODUCTIONS
          </h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">
            Reset Credentials
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-5">
          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={20} className="text-purple-400" />
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  A 6-digit reset code will be sent to your registered admin email. You can then update your username and/or password.
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                {loading ? "Sending code…" : "Send reset code"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <ArrowLeft size={14} />
                Back to login
              </button>
            </form>
          )}

          {step === "confirm" && (
            <form onSubmit={handleConfirmReset} className="space-y-5">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-4 text-sm text-purple-200">
                <p className="font-medium mb-1">Check your email</p>
                <p className="text-purple-300/70">
                  A 6-digit code was sent to{" "}
                  <span className="text-white font-mono">{sentTo}</span>. It
                  expires in 10 minutes.
                </p>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  Reset Code
                </label>
                <div className="relative">
                  <KeyRound
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 font-mono text-xl tracking-[0.5em]"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <p className="text-white/30 text-xs uppercase tracking-wider">New credentials (leave blank to keep current)</p>

                <div>
                  <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                    New Username
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Leave blank to keep current"
                      autoComplete="username"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setCode("");
                    setError("");
                  }}
                  className="flex-1 py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {loading ? "Saving…" : "Save credentials"}
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={20} className="text-green-400" />
                </div>
                <p className="text-green-300 font-semibold text-lg mb-1">
                  Credentials updated!
                </p>
                <p className="text-white/40 text-sm">
                  Your new login details are active.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/login")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Go to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    api.needsSetup()
      .then(({ needsSetup }) => setSetupMode(needsSetup))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (setupMode) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setLoading(true);
      try {
        await api.setup(username, password);
        await api.login(username, password, false);
        navigate("/admin");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Setup failed. Try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      await api.login(username, password, rememberMe);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
            {setupMode ? "First-Time Setup" : "Admin Panel"}
          </p>
        </div>

        {setupMode && (
          <div className="mb-4 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-sm text-center">
            No admin account found. Create one to get started.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-5"
        >
          <div>
            <label className="block text-white/70 text-sm mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={setupMode ? "Choose a username" : "Enter username"}
              autoFocus
              autoComplete="username"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={setupMode ? "Choose a password (min 8 chars)" : "Enter password"}
              autoComplete={setupMode ? "new-password" : "current-password"}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {setupMode && (
            <div>
              <label className="block text-white/70 text-sm mb-2 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
          )}

          {!setupMode && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border transition-colors ${
                    rememberMe
                      ? "bg-purple-600 border-purple-600"
                      : "bg-white/5 border-white/20"
                  } flex items-center justify-center`}
                >
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-white/50 text-sm">Remember me for 30 days</span>
            </label>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password || (setupMode && !confirmPassword)}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading
              ? (setupMode ? "Creating account..." : "Logging in...")
              : (setupMode ? "Create Admin Account" : "Login")}
          </button>

          {!setupMode && (
            <div className="text-center pt-1">
              <Link
                href="/admin/reset-password"
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                Forgot username or password?
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

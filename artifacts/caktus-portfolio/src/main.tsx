import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Kick off a warm-up ping immediately — before React renders anything.
// Uses /api/ping (no DB query, <5ms response) so the Vercel serverless function
// starts waking up as early as possible. Retries every 3s for up to 90s so it
// keeps nudging the function until it's actually alive.
// This runs in the background — React renders immediately and React Query's
// own retry logic handles the data fetches while the API wakes up.
(function warmUpApi() {
  let attempts = 0;
  const maxAttempts = 30; // 30 × 3s = 90s max

  function ping() {
    if (attempts >= maxAttempts) return;
    attempts++;
    fetch("/api/ping", { method: "GET", credentials: "omit", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("not ready");
        // API is alive — no further pings needed
      })
      .catch(() => {
        // API not ready yet — retry after 3s
        setTimeout(ping, 3000);
      });
  }

  ping();
})();

createRoot(document.getElementById("root")!).render(<App />);

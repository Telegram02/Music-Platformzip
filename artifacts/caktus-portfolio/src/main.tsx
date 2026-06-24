import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fire a warm-up ping immediately — before React renders anything.
// On Vercel serverless, this starts the cold-start wake-up process as early
// as possible so the API is ready by the time components fetch data.
fetch("/api/healthz", { method: "GET", credentials: "omit" }).catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);

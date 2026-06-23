import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center px-6 relative z-10"
      >
        <p className="text-primary text-sm font-mono uppercase tracking-[0.3em] mb-4">Signal Lost</p>

        <h1
          className="text-[8rem] sm:text-[12rem] text-white leading-none mb-2 select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
            404
          </span>
        </h1>

        <p className="text-foreground/60 text-lg font-light mb-10 max-w-sm mx-auto leading-relaxed">
          This frequency doesn't exist. The page you're looking for has gone silent.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-sm font-medium uppercase tracking-wider hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3 border border-white/10 text-white/60 rounded-sm font-medium uppercase tracking-wider hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <p className="mt-12 text-foreground/20 text-xs font-mono tracking-widest">
          CAKTUS PRODUCTIONS — SYS.404
        </p>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 500); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollUp() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollUp}
          aria-label="Scroll to top"
          className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-card border border-border/50 text-foreground/50 hover:text-primary hover:border-primary/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useSiteSettings } from "@/hooks/useSiteData";

interface NavbarProps {
  onCommissionOpen: () => void;
}

const NAVBAR_HEIGHT = 72; // px — matches the tallest state of the nav

function scrollToId(id: string, isAdmin: boolean) {
  const el = document.getElementById(id === "#home" ? "home" : id.replace("#", ""));
  if (!el) return;
  const adminBarHeight = isAdmin ? 40 : 0;
  const offset = NAVBAR_HEIGHT + adminBarHeight;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function Navbar({ onCommissionOpen }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { isAdmin } = useAdminStatus();
  const { data: settings } = useSiteSettings();
  const pricingVisible      = settings?.pricingVisible      !== "false";
  const servicesVisible     = settings?.servicesVisible     !== "false";

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section detection via scroll position (more accurate than IntersectionObserver)
  const updateActive = useCallback(() => {
    const sectionIds = ["home", "about", "services", "portfolio", "workflow", "pricing", "contact"];
    const adminBarHeight = isAdmin ? 40 : 0;
    const offset = NAVBAR_HEIGHT + adminBarHeight + 16; // small extra buffer

    let current = "home";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= offset) current = id;
    }
    setActiveSection(current);
  }, [isAdmin]);

  useEffect(() => {
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const navLinks = [
    { name: "About",     href: "#about",     id: "about"     },
    ...(servicesVisible ? [{ name: "Services", href: "#services", id: "services" }] : []),
    { name: "Portfolio", href: "#portfolio", id: "portfolio" },
    { name: "Workflow",  href: "#workflow",  id: "workflow"  },
    ...(pricingVisible  ? [{ name: "Pricing",  href: "#pricing",  id: "pricing"  }] : []),
    { name: "Contact",   href: "#contact",   id: "contact"   },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToId(href, isAdmin);
    setIsMobileMenuOpen(false);
  };

  const topOffset = isAdmin ? "top-10" : "top-0";

  return (
    <nav
      className={`fixed ${topOffset} left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-4 shadow-lg shadow-black/50"
          : "bg-transparent py-6"
      }`}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent origin-left z-10"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-6 flex items-center justify-between">
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="text-2xl font-display font-bold tracking-widest text-white hover:text-primary transition-colors"
        >
          CAKTUS
        </a>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-sm uppercase tracking-wider font-medium transition-colors relative group ${
                activeSection === link.id ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.name}
              {activeSection === link.id && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                />
              )}
            </a>
          ))}
          <button
            type="button"
            onClick={() => { onCommissionOpen(); setIsMobileMenuOpen(false); }}
            className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]"
          >
            Commission
          </button>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]"
          >
            Hire Me
          </a>
        </div>

        <button
          className="md:hidden p-1 text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-2xl py-6 px-6 flex flex-col space-y-1"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-base uppercase tracking-wider font-medium py-3 border-b border-border/20 last:border-0 transition-colors flex items-center justify-between ${
                activeSection === link.id ? "text-primary" : "text-foreground/90 hover:text-primary"
              }`}
            >
              {link.name}
              {activeSection === link.id && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { onCommissionOpen(); setIsMobileMenuOpen(false); }}
              className="block text-center px-6 py-3 border border-primary/40 text-primary rounded-sm font-medium uppercase tracking-wider text-sm hover:bg-primary/10 transition-colors"
            >
              Commission
            </button>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="block text-center px-6 py-3 bg-primary text-white rounded-sm font-medium uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
            >
              Hire Me
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

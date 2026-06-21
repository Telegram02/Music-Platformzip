import { Navbar } from "@/components/layout/Navbar";
import { AdminBar } from "@/components/AdminBar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Industries } from "@/components/sections/Industries";
import { Workflow } from "@/components/sections/Workflow";
import { Contact } from "@/components/sections/Contact";
import { Mail } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export default function Home() {
  const { isAdmin } = useAdminStatus();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white flex flex-col">
      <AdminBar />
      <Navbar />

      <main className={`flex-grow${isAdmin ? " pt-10" : ""}`}>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Industries />
        <Workflow />
        <Contact />
      </main>

      <footer className="py-8 bg-background border-t border-border/20 text-center">
        <p className="text-foreground/40 text-sm font-mono">
          &copy; {new Date().getFullYear()} Caktus Productions. All rights reserved.
        </p>
      </footer>

      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:-translate-y-1 hover:bg-primary/90 transition-all duration-300"
      >
        <Mail size={18} />
        <span className="hidden sm:inline">Hire Me</span>
      </a>
    </div>
  );
}

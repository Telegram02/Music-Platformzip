import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteData";
import { storageUrl } from "@/lib/api";

const steps = [
  { num: "01", title: "Discovery", desc: "Understanding the project vision, emotional goals, and technical requirements." },
  { num: "02", title: "Planning", desc: "Establishing sonic palettes, reference tracks, and a clear timeline." },
  { num: "03", title: "Production", desc: "Composing, sound designing, recording, and building the core assets." },
  { num: "04", title: "Feedback", desc: "Iterative review process to ensure the audio perfectly aligns with your vision." },
  { num: "05", title: "Delivery", desc: "Final mixing, mastering, and delivering properly formatted stems and masters." }
];

export function Workflow() {
  const { data: settings } = useSiteSettings();
  const bgImage = settings?.workflowBgImage ? storageUrl(settings.workflowBgImage) : "";

  return (
    <section
      id="workflow"
      className="py-32 relative bg-background overflow-hidden"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-xl mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-6"
          >
            The Process.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70 text-lg font-light"
          >
            A streamlined, transparent workflow designed to eliminate friction and focus entirely on creative excellence.
          </motion.p>
        </div>

        <div className="relative">
          <div className="absolute top-[30px] left-[30px] lg:left-[45px] right-0 h-[1px] bg-border/50 hidden lg:block" />
          <div className="absolute top-0 bottom-0 left-[30px] w-[1px] bg-border/50 lg:hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-16 lg:pl-0"
              >
                <div className="absolute left-0 lg:static lg:mb-6 w-[60px] h-[60px] lg:w-[90px] lg:h-[90px] rounded-full bg-card border border-border flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <span className="text-xl lg:text-2xl font-display font-bold text-foreground/40">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{step.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

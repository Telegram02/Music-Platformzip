import bcrypt from "bcryptjs";
import { db, siteSettingsTable, socialLinksTable, adminCredentialsTable, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const DEFAULT_SETTINGS: Record<string, string> = {
  bio: "Music producer and sound designer with experience across hip-hop, rock, metal, metalcore, electronic, industrial, ambient, horror, cinematic, and video game music. Focused on emotional storytelling through sound with high-quality production, mixing, and mastering.",
  tagline: "Cinematic soundtracks, game audio, and professional music production for artists and studios. Emotional storytelling through sound.",
  yearsExperience: "10",
  contactEmail: "caktusaudio@gmail.com",
  discord: "caktus",
  introVideoUrl: "",
  heroImageUrl: "",
  heroBadge: "Music Producer | Composer | Sound Designer",
  availability: "Currently accepting projects for Q4. Reach out to discuss your vision, rates, and availability.",
  siteMetaTitle: "Caktus Productions — Music Producer & Composer",
  siteMetaDescription: "Cinematic soundtracks, game audio, and professional music production for artists and studios.",
};

const DEFAULT_SOCIAL: Array<{ platform: string; url: string; sortOrder: number }> = [
  { platform: "youtube", url: "", sortOrder: 1 },
  { platform: "instagram", url: "", sortOrder: 2 },
  { platform: "soundcloud", url: "", sortOrder: 3 },
];

const DEFAULT_SERVICES = [
  { iconName: "Music2", title: "Music Production", description: "Full-scale track production from concept to completion. Specializing in electronic, rock, metal, hip-hop, and industrial genres.", colorClass: "from-purple-500/20 to-primary/5", sortOrder: 1 },
  { iconName: "Gamepad2", title: "Game Soundtracks", description: "Adaptive, dynamic, and immersive musical scores tailored for indie developers and AAA game studios.", colorClass: "from-blue-500/20 to-accent/5", sortOrder: 2 },
  { iconName: "Radio", title: "Sound Design & FX", description: "Bespoke sound effects, foley, and synthesis for UI, environments, characters, and cinematic sequences.", colorClass: "from-pink-500/20 to-pink-900/5", sortOrder: 3 },
  { iconName: "SlidersHorizontal", title: "Mixing & Mastering", description: "Industry-standard audio engineering to ensure your tracks hit hard, sound wide, and translate across all playback systems.", colorClass: "from-emerald-500/20 to-emerald-900/5", sortOrder: 4 },
  { iconName: "Film", title: "Trailer & Cinematic", description: "Massive, orchestral-hybrid compositions designed for film, animation, and promotional trailers.", colorClass: "from-orange-500/20 to-orange-900/5", sortOrder: 5 },
  { iconName: "Speaker", title: "Commercial Audio", description: "Striking audio branding, sonic logos, and high-impact background tracks for brands and agencies.", colorClass: "from-cyan-500/20 to-cyan-900/5", sortOrder: 6 },
];

export async function seedDefaults() {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
      if (existing.length === 0) {
        await db.insert(siteSettingsTable).values({ key, value });
      }
    }

    const existingSocial = await db.select().from(socialLinksTable);
    if (existingSocial.length === 0) {
      for (const link of DEFAULT_SOCIAL) {
        await db.insert(socialLinksTable).values(link);
      }
    }

    const existingServices = await db.select().from(servicesTable);
    if (existingServices.length === 0) {
      for (const svc of DEFAULT_SERVICES) {
        await db.insert(servicesTable).values({ ...svc, active: true });
      }
      logger.info("Default services seeded");
    }

    const existingAdmin = await db.select().from(adminCredentialsTable).limit(1);
    if (existingAdmin.length === 0) {
      const email = process.env.ADMIN_EMAIL ?? "eric2277@icloud.com";
      const username = process.env.ADMIN_USERNAME ?? "admin";
      const rawPassword = process.env.ADMIN_PASSWORD;
      if (rawPassword) {
        const passwordHash = await bcrypt.hash(rawPassword, 12);
        await db.insert(adminCredentialsTable).values({ email, username, passwordHash });
        logger.info({ email, username }, "Admin credentials seeded");
      } else {
        logger.warn("ADMIN_PASSWORD secret not set — skipping admin credential seed");
      }
    }

    logger.info("Default seed complete");
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
}

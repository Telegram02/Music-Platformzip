import { db, siteSettingsTable, socialLinksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const DEFAULT_SETTINGS: Record<string, string> = {
  bio: "Music producer and sound designer with experience across hip-hop, rock, metal, metalcore, electronic, industrial, ambient, horror, cinematic, and video game music. Focused on emotional storytelling through sound with high-quality production, mixing, and mastering.",
  tagline: "Cinematic soundtracks, game audio, and professional music production for artists and studios.",
  yearsExperience: "10",
  contactEmail: "caktusaudio@gmail.com",
  discord: "caktus",
  introVideoUrl: "",
  heroImageUrl: "",
};

const DEFAULT_SOCIAL: Array<{ platform: string; url: string; sortOrder: number }> = [
  { platform: "youtube", url: "", sortOrder: 1 },
  { platform: "instagram", url: "", sortOrder: 2 },
  { platform: "soundcloud", url: "", sortOrder: 3 },
];

export async function seedDefaults() {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await db
        .select()
        .from(siteSettingsTable)
        .where(eq(siteSettingsTable.key, key));
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

    logger.info("Default seed complete");
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
}

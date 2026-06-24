import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const siteVisitsTable = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  path: varchar("path", { length: 500 }).notNull().default("/"),
  referrer: text("referrer").default(""),
  userAgent: text("user_agent").default(""),
  ipHash: varchar("ip_hash", { length: 64 }).default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

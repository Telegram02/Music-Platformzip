import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const loginActivityTable = pgTable("login_activity", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  success: boolean("success").notNull().default(false),
  ipAddress: text("ip_address").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

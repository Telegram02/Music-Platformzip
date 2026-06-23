import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const pricingTable = pgTable("pricing", {
  id: serial("id").primaryKey(),
  iconName: text("icon_name").notNull().default("Music2"),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  price: text("price").notNull().default(""),
  priceUnit: text("price_unit").notNull().default(""),
  description: text("description").notNull().default(""),
  features: text("features").notNull().default("[]"),
  colorClass: text("color_class").notNull().default("from-purple-500/20 to-primary/5"),
  popular: boolean("popular").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type PricingItem = typeof pricingTable.$inferSelect;

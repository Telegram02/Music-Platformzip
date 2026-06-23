import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  iconName: text("icon_name").notNull().default("Music2"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  colorClass: text("color_class").notNull().default("from-purple-500/20 to-primary/5"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

import { pgTable, text, serial, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  isAnonymous: boolean("is_anonymous").notNull(),
  contactInfo: text("contact_info"),
  hasWitnesses: boolean("has_witnesses").notNull(),
  witnessInfo: text("witness_info"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const safetyPoints = pgTable("safety_points", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // hospital, police_station
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true });
export const insertSafetyPointSchema = createInsertSchema(safetyPoints).omit({ id: true });

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type SafetyPoint = typeof safetyPoints.$inferSelect;
export type InsertSafetyPoint = z.infer<typeof insertSafetyPointSchema>;

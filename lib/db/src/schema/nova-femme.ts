import { pgTable, text, serial, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";

export const affirmationsTable = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull().default("femininity"),
  author: text("author"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ritualsTable = pgTable("rituals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("__legacy__"),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("✨"),
  completedDates: jsonb("completed_dates").notNull().default([]).$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dreamsTable = pgTable("dreams", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("__legacy__"),
  date: date("date").notNull(),
  description: text("description").notNull(),
  feeling: text("feeling").notNull().default("✨"),
  tags: jsonb("tags").notNull().default([]).$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journalEntriesTable = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("__legacy__"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Affirmation = typeof affirmationsTable.$inferSelect;
export type Ritual = typeof ritualsTable.$inferSelect;
export type Dream = typeof dreamsTable.$inferSelect;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;

import { Router } from "express";
import { db, affirmationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const toAffirmation = (row: typeof affirmationsTable.$inferSelect) => ({
  id: row.id,
  text: row.text,
  category: row.category,
  author: row.author ?? null,
});

router.get("/affirmations/today", async (_req, res) => {
  try {
    const all = await db.select().from(affirmationsTable);
    if (all.length === 0) {
      return res.status(404).json({ error: "Brak afirmacji w bazie." });
    }
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % all.length;
    res.json(toAffirmation(all[dayIndex]));
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.get("/affirmations/random", async (_req, res) => {
  try {
    const all = await db.select().from(affirmationsTable);
    if (all.length === 0) {
      return res.status(404).json({ error: "Brak afirmacji w bazie." });
    }
    const idx = Math.floor(Math.random() * all.length);
    res.json(toAffirmation(all[idx]));
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

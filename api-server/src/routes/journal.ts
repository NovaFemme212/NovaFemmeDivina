import { Router } from "express";
import { db, journalEntriesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const toEntry = (row: typeof journalEntriesTable.$inferSelect) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  mood: row.mood ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

router.get("/journal", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await db
      .select()
      .from(journalEntriesTable)
      .where(eq(journalEntriesTable.userId, userId))
      .orderBy(desc(journalEntriesTable.createdAt));
    res.json(rows.map(toEntry));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/journal", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { title, content, mood } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Tytuł i treść są wymagane." });
    }
    const [row] = await db
      .insert(journalEntriesTable)
      .values({ userId, title: title.trim(), content, mood: mood || null })
      .returning();
    res.status(201).json(toEntry(row));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.patch("/journal/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(journalEntriesTable)
      .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, userId)));
    if (!existing) return res.status(404).json({ error: "Wpis nie znaleziony." });

    const updates: Partial<typeof journalEntriesTable.$inferInsert> = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.content !== undefined) updates.content = req.body.content;
    if (req.body.mood !== undefined) updates.mood = req.body.mood;

    const [updated] = await db
      .update(journalEntriesTable)
      .set(updates)
      .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, userId)))
      .returning();

    res.json(toEntry(updated));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.delete("/journal/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    await db
      .delete(journalEntriesTable)
      .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, userId)));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

import { Router } from "express";
import { db, dreamsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const toDream = (row: typeof dreamsTable.$inferSelect) => ({
  id: row.id,
  date: row.date,
  description: row.description,
  feeling: row.feeling,
  tags: Array.isArray(row.tags) ? row.tags : [],
  createdAt: row.createdAt.toISOString(),
});

router.get("/dreams", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await db
      .select()
      .from(dreamsTable)
      .where(eq(dreamsTable.userId, userId))
      .orderBy(desc(dreamsTable.createdAt));
    res.json(rows.map(toDream));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/dreams", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { date, description, feeling, tags } = req.body;
    if (!date || !description || !feeling) {
      return res.status(400).json({ error: "Data, opis i emocja są wymagane." });
    }
    const [row] = await db
      .insert(dreamsTable)
      .values({ userId, date, description, feeling, tags: tags || [] })
      .returning();
    res.status(201).json(toDream(row));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.patch("/dreams/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(dreamsTable)
      .where(and(eq(dreamsTable.id, id), eq(dreamsTable.userId, userId)));
    if (!existing) return res.status(404).json({ error: "Sen nie znaleziony." });

    const updates: Partial<typeof dreamsTable.$inferInsert> = {};
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.feeling !== undefined) updates.feeling = req.body.feeling;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;

    const [updated] = await db
      .update(dreamsTable)
      .set(updates)
      .where(and(eq(dreamsTable.id, id), eq(dreamsTable.userId, userId)))
      .returning();

    res.json(toDream(updated));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.delete("/dreams/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    await db
      .delete(dreamsTable)
      .where(and(eq(dreamsTable.id, id), eq(dreamsTable.userId, userId)));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

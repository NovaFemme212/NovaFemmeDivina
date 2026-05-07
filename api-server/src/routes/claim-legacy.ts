import { Router } from "express";
import { db, journalEntriesTable, dreamsTable, ritualsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/claim-legacy", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const [journals, dreams, rituals] = await Promise.all([
      db
        .update(journalEntriesTable)
        .set({ userId })
        .where(eq(journalEntriesTable.userId, "__legacy__"))
        .returning({ id: journalEntriesTable.id }),
      db
        .update(dreamsTable)
        .set({ userId })
        .where(eq(dreamsTable.userId, "__legacy__"))
        .returning({ id: dreamsTable.id }),
      db
        .update(ritualsTable)
        .set({ userId })
        .where(eq(ritualsTable.userId, "__legacy__"))
        .returning({ id: ritualsTable.id }),
    ]);

    res.json({
      claimed: {
        journals: journals.length,
        dreams: dreams.length,
        rituals: rituals.length,
      },
    });
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

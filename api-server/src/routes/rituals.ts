import { Router } from "express";
import { db, ritualsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const today = () => { const d = new Date(); const warsawOffset = 2 * 60 * 60 * 1000; const local = new Date(d.getTime() + warsawOffset); return local.toISOString().split("T")[0]; };

const toRitual = (row: typeof ritualsTable.$inferSelect) => {
  const todayStr = today();
  const completedDates = Array.isArray(row.completedDates) ? row.completedDates : [];
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    completedToday: completedDates.includes(todayStr),
    completedDates,
    createdAt: row.createdAt.toISOString(),
  };
};

router.get("/rituals", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await db
      .select()
      .from(ritualsTable)
      .where(eq(ritualsTable.userId, userId))
      .orderBy(ritualsTable.createdAt);
    res.json(rows.map(toRitual));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/rituals", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, emoji } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Nazwa rytuału jest wymagana." });
    }
    const [row] = await db
      .insert(ritualsTable)
      .values({ userId, name: name.trim(), emoji: emoji || "✨", completedDates: [] })
      .returning();
    res.status(201).json(toRitual(row));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.patch("/rituals/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(ritualsTable)
      .where(and(eq(ritualsTable.id, id), eq(ritualsTable.userId, userId)));
    if (!existing) return res.status(404).json({ error: "Rytuał nie znaleziony." });

    const todayStr = today();
    let completedDates = Array.isArray(existing.completedDates) ? [...existing.completedDates] : [];

    if (typeof req.body.completedToday === "boolean") {
      if (req.body.completedToday && !completedDates.includes(todayStr)) {
        completedDates.push(todayStr);
      } else if (!req.body.completedToday) {
        completedDates = completedDates.filter((d: string) => d !== todayStr);
      }
    }

    const updates: Partial<typeof ritualsTable.$inferInsert> = { completedDates };
    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.emoji) updates.emoji = req.body.emoji;

    const [updated] = await db
      .update(ritualsTable)
      .set(updates)
      .where(and(eq(ritualsTable.id, id), eq(ritualsTable.userId, userId)))
      .returning();

    res.json(toRitual(updated));
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.delete("/rituals/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    await db
      .delete(ritualsTable)
      .where(and(eq(ritualsTable.id, id), eq(ritualsTable.userId, userId)));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/rituals/seed", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const existing = await db
      .select()
      .from(ritualsTable)
      .where(eq(ritualsTable.userId, userId));
    if (existing.length > 0) {
      return res.json({ seeded: false, count: existing.length });
    }
    const defaults = [
      { userId, name: "Nawodnienie Duszy (8 szklanek wody) – aby dbać o ciało", emoji: "💧", completedDates: [] },
      { userId, name: "Chwila Ciszy (medytacja) – aby dbać o umysł", emoji: "🧘", completedDates: [] },
      { userId, name: "Ruch Bogini (joga, spacer) – aby dbać o energię", emoji: "🌸", completedDates: [] },
    ];
    await db.insert(ritualsTable).values(defaults);
    res.json({ seeded: true });
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.get("/rituals/streak", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await db
      .select()
      .from(ritualsTable)
      .where(eq(ritualsTable.userId, userId));

    const todayStr = today();
    const todayCount = rows.filter(r =>
      Array.isArray(r.completedDates) && r.completedDates.includes(todayStr)
    ).length;
    const todayTotal = rows.length;

    const allDates = new Set<string>();
    for (const r of rows) {
      if (Array.isArray(r.completedDates)) {
        for (const d of r.completedDates) allDates.add(d);
      }
    }
    const sortedDates = Array.from(allDates).sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) { streak = 1; }
      else {
        const a = new Date(sortedDates[i-1]);
        const b = new Date(sortedDates[i]);
        const diffDays = Math.round((a.getTime() - b.getTime()) / 86400000);
        streak = diffDays === 1 ? streak + 1 : 1;
      }
      if (streak > longestStreak) longestStreak = streak;
    }
    currentStreak = sortedDates.length > 0 ? streak : 0;

    res.json({
      currentStreak,
      longestStreak,
      totalCompleted: allDates.size,
      todayCount,
      todayTotal,
    });
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

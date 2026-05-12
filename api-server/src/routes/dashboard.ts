import { Router } from "express";
import { db, affirmationsTable, ritualsTable, dreamsTable, journalEntriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const today = () => { const d = new Date(); const warsawOffset = 2 * 60 * 60 * 1000; const local = new Date(d.getTime() + warsawOffset); return local.toISOString().split("T")[0]; };

const today = () => new Date().toISOString().split("T")[0];

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const todayStr = today();

    const [affirmations, rituals, dreams, journal] = await Promise.all([
      db.select().from(affirmationsTable),
      db.select().from(ritualsTable).where(eq(ritualsTable.userId, userId)),
      db.select().from(dreamsTable).where(eq(dreamsTable.userId, userId)).orderBy(desc(dreamsTable.createdAt)).limit(3),
      db.select().from(journalEntriesTable).where(eq(journalEntriesTable.userId, userId)).orderBy(desc(journalEntriesTable.createdAt)).limit(3),
    ]);

    const todayAff =
      affirmations.length > 0
        ? affirmations[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % affirmations.length]
        : { id: 0, text: "Jesteś wystarczająca.", category: "self-love", author: null };

    const completedRitualsToday = rituals.filter(r =>
      Array.isArray(r.completedDates) && r.completedDates.includes(todayStr)
    ).length;

    const allDates = new Set<string>();
    for (const r of rituals) {
      if (Array.isArray(r.completedDates)) {
        for (const d of r.completedDates) allDates.add(d);
      }
    }
    const sortedDates = Array.from(allDates).sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const d = new Date(dateStr);
      if (prevDate === null) {
        streak = 1;
      } else {
        const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        streak = diff === 1 ? streak + 1 : 1;
      }
      prevDate = d;
      if (streak > longestStreak) longestStreak = streak;
      if (dateStr === sortedDates[0]) currentStreak = streak;
    }
    if (sortedDates[0] !== todayStr) currentStreak = 0;

    res.json({
      todayAffirmation: {
        id: todayAff.id,
        text: todayAff.text,
        category: todayAff.category,
        author: todayAff.author ?? null,
      },
      streak: {
        currentStreak,
        longestStreak,
        totalCompleted: allDates.size,
        todayCount: completedRitualsToday,
        todayTotal: rituals.length,
      },
      recentDreams: dreams.map(d => ({
        id: d.id,
        date: d.date,
        description: d.description,
        feeling: d.feeling,
        tags: Array.isArray(d.tags) ? d.tags : [],
        createdAt: d.createdAt.toISOString(),
      })),
      recentJournal: journal.map(j => ({
        id: j.id,
        title: j.title,
        content: j.content,
        mood: j.mood ?? null,
        createdAt: j.createdAt.toISOString(),
        updatedAt: j.updatedAt.toISOString(),
      })),
      completedRitualsToday,
      totalRituals: rituals.length,
    });
  } catch {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

export default router;

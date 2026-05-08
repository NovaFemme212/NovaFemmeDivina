import { useState, useEffect, useCallback, useRef } from "react";
import {
  useListRituals,
  useCreateRitual,
  useUpdateRitual,
  useDeleteRitual,
  getListRitualsQueryKey,
  getGetRitualStreakQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Layout } from "@/components/layout";
import { Plus, Trash2, CheckCircle2, Circle, Flame } from "lucide-react";
import { useBellSound } from "@/hooks/use-bell-sound";

const EMOJI_OPTIONS = ["🧘", "💧", "🌸", "📖", "🕯️", "🫖", "🌿", "🛁", "🎨", "🌙", "🏃", "💆", "🌺", "✍️", "🍵", "🧴", "🪞", "🌅"];

const MESSAGES = [
  "Twoje ciało Ci dziękuje.",
  "Promieniejesz spokojem.",
  "Z każdym krokiem jesteś bliżej siebie.",
];

const FULL_CIRCLE_MESSAGE = "Dzisiejszy krąg rytuałów został domknięty. Jesteś pełnią.";


// ─── Mystic Toast ───────────────────────────────────────────────────────────

interface ToastData {
  id: number;
  message: string;
  isSpecial?: boolean;
}

function MysticToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center pointer-events-none" style={{ width: "min(92vw, 420px)" }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="mystic-toast pointer-events-auto"
          style={t.isSpecial ? { borderColor: "#D4AF37", background: "linear-gradient(135deg, #FFFBF0, #FDF6DC, #FAF0CA)" } : {}}
          onClick={() => onDismiss(t.id)}
          data-testid="mystic-toast"
        >
          {t.isSpecial && (
            <div className="flex justify-center gap-2 mb-1">
              <span className="oracle-sparkle text-xs">✦</span>
              <span className="oracle-sparkle text-xs" style={{ animationDelay: "0.5s" }}>✧</span>
              <span className="oracle-sparkle text-xs" style={{ animationDelay: "1s" }}>✦</span>
            </div>
          )}
          <p className="font-serif italic text-center leading-snug" style={{ color: t.isSpecial ? "#8B6914" : "#6B3A10", fontSize: t.isSpecial ? "1rem" : "0.9rem" }}>
            {t.message}
          </p>
          {t.isSpecial && (
            <div className="flex justify-center gap-2 mt-1">
              <span style={{ color: "#D4AF37", fontSize: "0.55rem", opacity: 0.7, letterSpacing: "0.4em" }}>✾ · ⁕ · ✾</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sparkle Burst ──────────────────────────────────────────────────────────

interface Sparkle { id: number; x: number; y: number; angle: number; distance: number; size: number; delay: number; symbol: string; }

const SPARKLE_SYMBOLS = ["✦", "✧", "⋆", "★", "✶", "⁕"];

function SparkleCanvas({ bursts }: { bursts: { id: number; x: number; y: number }[] }) {
  const [particles, setParticles] = useState<(Sparkle & { burstId: number })[]>([]);

  useEffect(() => {
    if (bursts.length === 0) return;
    const latest = bursts[bursts.length - 1];
    const newOnes = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      burstId: latest.id,
      x: latest.x,
      y: latest.y,
      angle: (360 / 14) * i + Math.random() * 20 - 10,
      distance: 38 + Math.random() * 36,
      size: 0.65 + Math.random() * 0.55,
      delay: Math.random() * 0.1,
      symbol: SPARKLE_SYMBOLS[Math.floor(Math.random() * SPARKLE_SYMBOLS.length)],
    }));
    setParticles((p) => [...p, ...newOnes]);
    setTimeout(() => {
      setParticles((p) => p.filter((s) => s.burstId !== latest.id));
    }, 1100);
  }, [bursts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden>
      {particles.map((s) => (
        <span
          key={s.id}
          className="sparkle-particle"
          style={{
            left: s.x,
            top: s.y,
            "--angle": `${s.angle}deg`,
            "--dist": `${s.distance}px`,
            "--size": s.size,
            animationDelay: `${s.delay}s`,
          } as React.CSSProperties}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  );
}

// ─── Ritual Name — split on " – " and style subtitle softly ────────────────

function RitualName({ name, done }: { name: string; done: boolean }) {
  let main = name;
  let sub: string | null = null;

  const dashIdx = name.indexOf(" – ");
  if (dashIdx !== -1) {
    main = name.slice(0, dashIdx);
    sub = name.slice(dashIdx + 3);
  } else {
    const parenMatch = name.match(/^(.+?)\s+(\(.+\))$/);
    if (parenMatch) {
      main = parenMatch[1];
      sub = parenMatch[2];
    }
  }

  if (!sub) {
    return (
      <span className={`flex-1 font-sans font-medium leading-snug ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {name}
      </span>
    );
  }
  return (
    <span className={`flex-1 leading-snug ${done ? "line-through" : ""}`}>
      <span className={`font-sans font-medium ${done ? "text-muted-foreground" : "text-foreground"}`}>
        {main}
      </span>
      <span
        className="font-serif italic"
        style={{
          fontSize: "0.72rem",
          color: done ? "rgba(107,58,16,0.45)" : "rgba(180,145,60,0.85)",
          marginTop: "1px",
          display: "block",
        }}
      >
        {sub}
      </span>
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

let toastIdCounter = 0;

export default function RitualsPage() {
  const queryClient = useQueryClient();
  const { userId, getToken } = useAuth();
  const { data: rituals = [], isLoading } = useListRituals();
  const createRitual = useCreateRitual();
  const updateRitual = useUpdateRitual();
  const deleteRitual = useDeleteRitual();
  const bell = useBellSound(`${import.meta.env.BASE_URL}campana.mp3`);

  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [showForm, setShowForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const seededRef = useRef(false);
  const toggleRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // ── Auto-seed 3 default rituals for brand-new users ──────────────────────
  // Calls the backend /api/rituals/seed which only inserts when user has 0 rituals.
  // A ref prevents double-calls during React StrictMode double-invoke.
  useEffect(() => {
    if (isLoading || !userId || seededRef.current) return;

    seededRef.current = true;
    setIsSeeding(true);

    (async () => {
      try {
        const token = await getToken();
        await fetch("/api/rituals/seed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        queryClient.invalidateQueries({ queryKey: getListRitualsQueryKey() });
      } catch {
        /* non-critical — seeding failure doesn't break the page */
      } finally {
        setIsSeeding(false);
      }
    })();
  }, [isLoading, userId]);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = rituals.filter(r => Array.isArray(r.completedDates) && r.completedDates.includes(today)).length;
  const progressPct = rituals.length > 0 ? Math.round((completedToday / rituals.length) * 100) : 0;

  const showToast = useCallback((message: string, isSpecial = false) => {
    const id = ++toastIdCounter;
    setToasts((t) => [...t, { id, message, isSpecial }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), isSpecial ? 5000 : 3800);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const fireBurst = useCallback((ritualId: number) => {
    const btn = toggleRefs.current.get(ritualId);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setBursts((b) => [...b, { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createRitual.mutate(
      { data: { name: newName.trim(), emoji: newEmoji } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRitualsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRitualStreakQueryKey() });
          setNewName("");
          setNewEmoji("✨");
          setShowForm(false);
          showToast("Nowy rytuał został dodany do Twojego kręgu.");
        },
      }
    );
  };

  const handleToggle = (id: number, isDone: boolean) => {
    const completing = !isDone;

    if (completing) {
      bell.play();
      fireBurst(id);
    }

    updateRitual.mutate(
      { id, data: { completedToday: completing } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRitualsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRitualStreakQueryKey() });

          if (completing) {
            const newCompleted = completedToday + 1;
            if (newCompleted === rituals.length && rituals.length > 0) {
              setTimeout(() => showToast(FULL_CIRCLE_MESSAGE, true), 400);
            } else {
              const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
              showToast(msg);
            }
          }
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteRitual.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRitualsQueryKey() }) }
    );
  };

  return (
    <Layout>
      <SparkleCanvas bursts={bursts} />
      <MysticToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-semibold text-primary" data-testid="heading-rituals">
            Rytuały
          </h1>
          <p className="text-muted-foreground font-sans text-sm italic">
            Twoje codzienne praktyki troski o siebie
          </p>
        </div>

        {/* Progress bar — mystic gold */}
        {rituals.length > 0 && (
          <div className="gold-card space-y-3" data-testid="card-progress">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: "#D4AF37" }} />
                <span className="font-serif font-semibold" style={{ color: completedToday === rituals.length && rituals.length > 0 ? "#C9952A" : "inherit" }}>
                  {completedToday === rituals.length && rituals.length > 0
                    ? "Krąg domknięty ✦"
                    : `Dzisiaj: ${completedToday}/${rituals.length}`}
                </span>
              </div>
              <span className="text-sm font-sans text-muted-foreground">{progressPct}%</span>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "rgba(212,175,55,0.15)" }}>
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? "linear-gradient(90deg, #C9952A, #F0D980, #D4AF37, #F0D980, #C9952A)"
                    : "linear-gradient(90deg, hsl(345,100%,25%), #D4AF37)",
                  backgroundSize: progressPct === 100 ? "200% auto" : "auto",
                  animation: progressPct === 100 ? "shimmer-gold 2.5s linear infinite" : "none",
                }}
              />
            </div>
          </div>
        )}

        {/* Add ritual button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm font-medium border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          data-testid="button-add-ritual"
        >
          <Plus className="w-4 h-4" />
          Dodaj rytuał
        </button>

        {/* New ritual form */}
        {showForm && (
          <div className="gold-card space-y-4" data-testid="form-new-ritual">
            <h2 className="font-serif font-semibold text-foreground">Nowy rytuał</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-3xl w-12 h-12 rounded-xl border flex items-center justify-center hover:border-primary transition-colors"
                style={{ borderColor: "rgba(212,175,55,0.5)" }}
                data-testid="button-emoji-picker"
              >
                {newEmoji}
              </button>
              <input
                type="text"
                placeholder="Nazwa rytuału (np. Poranna medytacja)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-ritual-name"
              />
            </div>
            {showEmojiPicker && (
              <div className="grid grid-cols-9 gap-2 p-3 bg-muted rounded-xl" data-testid="grid-emoji-picker">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { setNewEmoji(emoji); setShowEmojiPicker(false); }}
                    className="text-2xl hover:scale-125 transition-transform"
                    data-testid={`emoji-option-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createRitual.isPending}
                className="px-6 py-2 rounded-full font-sans text-sm font-medium text-primary-foreground transition-all duration-300 disabled:opacity-50"
                style={{ background: "hsl(345,100%,25%)" }}
                data-testid="button-save-ritual"
              >
                {createRitual.isPending ? "Zapisuję..." : "Zapisz rytuał"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-full font-sans text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-cancel-ritual"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Rituals list */}
        {isLoading || isSeeding ? (
          <div className="text-center py-12 text-muted-foreground font-serif italic">
            {isSeeding ? "Przygotowuję Twoją przestrzeń rytuałów..." : "Ładowanie rytuałów..."}
          </div>
        ) : rituals.length === 0 ? (
          <div className="text-center py-16 space-y-3" data-testid="empty-rituals">
            <p className="text-2xl opacity-50">🌿</p>
            <p className="font-serif text-muted-foreground italic text-base">
              Twoja ścieżka czeka na pierwsze kroki.
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="list-rituals">
            {rituals.map(ritual => {
              const done = Array.isArray(ritual.completedDates) && ritual.completedDates.includes(today);
              return (
                <div
                  key={ritual.id}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-400 ${done ? "ritual-done-card" : "gold-card"}`}
                  data-testid={`card-ritual-${ritual.id}`}
                >
                  <button
                    ref={(el) => {
                      if (el) toggleRefs.current.set(ritual.id, el);
                      else toggleRefs.current.delete(ritual.id);
                    }}
                    onClick={() => handleToggle(ritual.id, done)}
                    className="shrink-0 transition-transform hover:scale-110 active:scale-95"
                    data-testid={`button-toggle-ritual-${ritual.id}`}
                    aria-label={done ? "Oznacz jako nieukończony" : "Oznacz jako ukończony"}
                  >
                    {done
                      ? <CheckCircle2 className="w-7 h-7" style={{ color: "#C9952A" }} />
                      : <Circle className="w-7 h-7 text-muted-foreground" />}
                  </button>

                  <span className="text-2xl">{ritual.emoji}</span>

                  <RitualName name={ritual.name} done={done} />

                  {done && <span style={{ color: "#D4AF37", fontSize: "0.7rem", opacity: 0.7 }}>✦</span>}

                  <button
                    onClick={() => handleDelete(ritual.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    data-testid={`button-delete-ritual-${ritual.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

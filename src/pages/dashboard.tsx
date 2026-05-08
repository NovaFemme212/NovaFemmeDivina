import { useMemo } from "react";
import { useGetDashboard, useGetRitualStreak } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL;

const CARD_IMAGES = [
  "akcept.png", "akceptacja.png", "aute.jpeg", "autentyk.png",
  "boskosc.jpeg", "cykl.png", "czulos.png", "decyzj.png",
  "delik.png", "dobrostan.png", "dzialan.png", "energi.png",
  "granic.png", "harmonia.png", "int.jpeg", "intencj.png",
  "intuicj.png", "jedn.png", "kr.jpeg", "kreacj.png",
  "mag.jpeg", "magi.png", "milosc.png", "moge.png",
  "niezal.png", "nowy.png", "obec.png", "obecna.jpeg",
  "obf.png", "od.jpeg", "odpo.png", "odpuszcz.png",
  "odrodz.png", "odwag.png", "polacz.png", "pom.jpeg",
  "poten.png", "prawd.png", "przel.png", "przeplyw.png",
  "przyciag.png", "rad.png", "rowno.png", "rozwoj.png",
  "sila.png", "speln.png", "spokoj.png", "swiado.jpeg",
  "swiadom.png", "swyb.png", "synchron.png", "uzdrow.png",
  "wdz.png", "wdzieczna.png", "wizje.png", "wybacz.png",
  "wybor.png", "zauf.png", "zaufanie.png", "zmian.png",
  // Czakry
  "czakra1.png", "czakra2.png", "czakra3.png", "czakra4.png",
  "czakra5.png", "czakra6.png", "czakra7.png",
  // Transformacja / Inspiracje
  "milbzwr.png", "nowe.png", "poloc.png", "wsparcie.png", "zmia.png",
].map((f) => `${BASE}cards/${f}`);

// ── Precise lunar phase via synodic period ─────────────────────────────────
// Reference new moon: 6 January 2000 at 18:14 UTC  (JD 2451549.38)
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z");
const SYNODIC_PERIOD = 29.53059; // days

interface LunarPhase {
  icon: string;
  name: string;   // Polish
  fraction: number; // 0–1 within cycle
}

function getLunarPhase(date: Date): LunarPhase {
  const daysSince =
    (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  let phase = ((daysSince % SYNODIC_PERIOD) / SYNODIC_PERIOD + 1) % 1;

  // 8 named phases with generous bands around each cardinal point
  if (phase < 0.025 || phase >= 0.975)
    return { icon: "🌑", name: "Nów Księżyca",           fraction: phase };
  if (phase < 0.245)
    return { icon: "🌒", name: "Sierp Rosnący",          fraction: phase };
  if (phase < 0.255)
    return { icon: "🌓", name: "Pierwsza Kwadra",        fraction: phase };
  if (phase < 0.475)
    return { icon: "🌔", name: "Przybywający Księżyc",   fraction: phase };
  if (phase < 0.525)
    return { icon: "🌕", name: "Pełnia Księżyca",        fraction: phase };
  if (phase < 0.745)
    return { icon: "🌖", name: "Ubywający Księżyc",      fraction: phase };
  if (phase < 0.755)
    return { icon: "🌗", name: "Ostatnia Kwadra",        fraction: phase };
  return   { icon: "🌘", name: "Sierp Malejący",         fraction: phase };
}

// ── Circular ring progress (SVG) ──────────────────────────────────────────
function RingProgress({ pct, done, total }: { pct: number; done: number; total: number }) {
  const r = 26;
  const cx = 32;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center justify-center py-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke="rgba(212,175,55,0.15)"
            strokeWidth="4.5"
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke="url(#goldArc)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)" }}
          />
          <defs>
            <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9952A" />
              <stop offset="50%" stopColor="#F0D980" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
        {/* Centre text */}
        <span
          className="relative font-serif font-semibold text-sm leading-none"
          style={{
            background: "linear-gradient(135deg, #C9952A 0%, #D4AF37 50%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {total > 0 ? `${done}/${total}` : "—"}
        </span>
      </div>
      <p className="text-xs font-sans font-medium text-foreground mt-1.5">Spełnione Rytuały</p>
      <p className="text-xs text-muted-foreground font-sans">Twoja droga do harmonii</p>
    </div>
  );
}

// ── Stat bubble ───────────────────────────────────────────────────────────
function StatBubble({ symbol, label, value, sub, testId, pulsing }: {
  symbol: string; label: string; value: string; sub: string; testId: string; pulsing?: boolean;
}) {
  return (
    <div className="stat-bubble" data-testid={testId}>
      <span className={`stat-symbol${pulsing ? " flame-pulse" : ""}`}>{symbol}</span>
      <p
        className="text-2xl font-serif font-semibold leading-tight"
        style={{
          background: "linear-gradient(135deg, #C9952A 0%, #D4AF37 50%, #B8860B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </p>
      <p className="text-xs font-sans font-medium text-foreground mt-0.5">{label}</p>
      <p className="text-xs text-muted-foreground font-sans">{sub}</p>
    </div>
  );
}

const GREETINGS = [
  "Witaj, Piękna Duszo",
  "Witaj, Bogini",
  "Witaj, Boska Istoto",
  "Witaj w domu, Siostro",
];

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: streak } = useGetRitualStreak();

  // Pick a random oracle card once per mount
  const sacredCard = useMemo(
    () => CARD_IMAGES[Math.floor(Math.random() * CARD_IMAGES.length)],
    []
  );

  // Pick a random greeting once per mount
  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    []
  );

  const now = new Date();
  const lunar = getLunarPhase(now);
  const dateStr = now.toLocaleDateString("pl-PL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="text-4xl animate-pulse" style={{ color: "#D4AF37" }}>✦</div>
            <p className="font-serif italic text-muted-foreground">Przygotowuję Twoją przestrzeń...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const todayCount = dashboard?.completedRitualsToday ?? 0;
  const totalRituals = dashboard?.totalRituals ?? 0;
  const progressPct = totalRituals > 0 ? Math.round((todayCount / totalRituals) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-8 page-section">

        {/* ── Sacred Greeting ───────────────────────────────── */}
        <div className="space-y-1.5 fade-up" style={{ animationDelay: "0ms" }}>
          <div className="flex items-baseline gap-2">
            <span style={{ color: "#D4AF37", fontSize: "1.1rem", opacity: 0.8 }}>✦</span>
            <h1
              className="text-4xl md:text-5xl font-serif font-semibold leading-tight"
              style={{
                background: "linear-gradient(120deg, #8B6000 0%, #C9952A 20%, #F0D980 45%, #D4AF37 60%, #B8860B 80%, #E8C96A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
                animation: "shimmer-gold 8s linear infinite",
              }}
              data-testid="text-greeting"
            >
              {greeting}
            </h1>
            <span style={{ color: "#D4AF37", fontSize: "0.9rem", opacity: 0.6 }}>✧</span>
          </div>
          {/* Date */}
          <p className="text-muted-foreground font-sans text-sm pl-6">{dateStr}</p>

          {/* Lunar phase indicator */}
          <div className="lunar-phase-badge pl-6" data-testid="lunar-phase-indicator">
            <span className="lunar-icon">{lunar.icon}</span>
            <span className="lunar-label">Dzisiaj jest <em>{lunar.name}</em></span>
          </div>
        </div>

        {/* ── Sacred Oracle Card ────────────────────────────── */}
        <div className="fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex flex-col items-center gap-5">
            {/* Ornament above */}
            <div className="flex items-center gap-3" style={{ color: "#C9952A", fontSize: "0.65rem", letterSpacing: "0.4em", opacity: 0.55 }}>
              <span>✦</span>
              <span style={{ fontSize: "0.45rem" }}>❁ · ✿ · ❁</span>
              <span>✦</span>
            </div>

            {/* Card with golden glow */}
            <Link href="/afirmacje">
              <div className="sacred-card-frame" data-testid="card-affirmation-today">
                {/* Filigree corners */}
                <span className="oracle-corner oracle-corner-tl" style={{ fontSize: "0.9rem" }}>❧</span>
                <span className="oracle-corner oracle-corner-tr" style={{ fontSize: "0.9rem", transform: "scaleX(-1)" }}>❧</span>
                <span className="oracle-corner oracle-corner-bl" style={{ fontSize: "0.9rem", transform: "scaleY(-1)" }}>❧</span>
                <span className="oracle-corner oracle-corner-br" style={{ fontSize: "0.9rem", transform: "scale(-1,-1)" }}>❧</span>

                <img
                  src={sacredCard}
                  alt="Karta dnia"
                  className="sacred-card-img"
                  draggable={false}
                />
              </div>
            </Link>

            {/* Caption below card */}
            <p className="font-serif italic text-xs text-center" style={{ color: "#C9952A", opacity: 0.75, letterSpacing: "0.05em" }}>
              Twoja karta na dziś — dotknij, by odkryć więcej
            </p>

            {/* Ornament below */}
            <div className="flex items-center gap-3" style={{ color: "#C9952A", fontSize: "0.65rem", letterSpacing: "0.4em", opacity: 0.55 }}>
              <span>✦</span>
              <span style={{ fontSize: "0.45rem" }}>✾ · ⁕ · ✾</span>
              <span>✦</span>
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────── */}
        <div className="fade-up grid grid-cols-2 md:grid-cols-4 gap-4" style={{ animationDelay: "140ms" }}>
          <StatBubble
            symbol="🔥"
            label="Płomień Intencji"
            value={`${streak?.currentStreak ?? 0}`}
            sub="dni w kręgu"
            testId="stat-streak"
            pulsing={(streak?.currentStreak ?? 0) >= 3}
          />

          {/* Ring progress for rituals */}
          <div className="stat-bubble" data-testid="stat-rituals-today">
            <RingProgress pct={progressPct} done={todayCount} total={totalRituals} />
          </div>

          <StatBubble
            symbol="☽"
            label="Nocne Przesłania"
            value={`${dashboard?.recentDreams?.length ?? 0}`}
            sub="Echo podświadomości"
            testId="stat-dreams"
          />
          <StatBubble
            symbol="❧"
            label="Zapiski Duszy"
            value={`${dashboard?.recentJournal?.length ?? 0}`}
            sub="Mądrość serca"
            testId="stat-journal"
          />
        </div>

        {/* ── Recent dreams ─────────────────────────────────── */}
        {dashboard?.recentDreams && dashboard.recentDreams.length > 0 && (
          <section className="space-y-3 fade-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                <span style={{ color: "#D4AF37" }}>☽</span> Ostatnie sny
              </h2>
              <Link href="/sny">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-sans">
                  Zobacz wszystkie →
                </span>
              </Link>
            </div>
            <div className="grid gap-2.5">
              {dashboard.recentDreams.map((dream) => (
                <div key={dream.id} className="dream-preview-card" data-testid={`card-dream-${dream.id}`}>
                  <span className="text-2xl shrink-0">{dream.feeling}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans mb-0.5" style={{ color: "#C9952A", opacity: 0.8 }}>
                      {new Date(dream.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                    </p>
                    <p className="text-sm font-serif text-foreground leading-snug line-clamp-1">{dream.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent journal ────────────────────────────────── */}
        {dashboard?.recentJournal && dashboard.recentJournal.length > 0 && (
          <section className="space-y-3 fade-up" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                <span style={{ color: "#D4AF37" }}>❧</span> Ostatnie zapiski
              </h2>
              <Link href="/zapiski">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-sans">
                  Zobacz wszystkie →
                </span>
              </Link>
            </div>
            <div className="grid gap-2.5">
              {dashboard.recentJournal.map((entry) => (
                <div key={entry.id} className="journal-preview-card" data-testid={`card-journal-${entry.id}`}>
                  <h3 className="font-serif font-semibold text-foreground text-sm">{entry.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans line-clamp-1 mt-0.5">{entry.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}

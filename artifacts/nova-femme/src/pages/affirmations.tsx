import { useState, useCallback, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";

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
  "milbzwr.png", "nowe.png", "poloc.png", "wsparcie.png", "zmia.png", "ego.png", "czas.png",
].map((f) => `${BASE}cards/${f}`);

type Phase = "idle" | "out" | "glow" | "in";

function pickRandom(current: string): string {
  const pool = CARD_IMAGES.filter((c) => c !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // never block on error
    img.src = src;
  });
}

export default function AffirmationsPage() {
  const [currentCard, setCurrentCard] = useState<string>(
    CARD_IMAGES[Math.floor(Math.random() * CARD_IMAGES.length)]
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");

  // Preload ALL images immediately on mount
  useEffect(() => {
    CARD_IMAGES.forEach((src) => preloadImage(src));
  }, []);

  const handleDiscover = useCallback(async () => {
    if (phaseRef.current !== "idle") return;

    const next = pickRandom(currentCard);

    // Step 1 — flip card OUT immediately (no waiting)
    phaseRef.current = "out";
    setPhase("out");

    // Step 2 — while card is rotating out, ensure next image is ready
    // (will be instant since we preloaded, but guarantees no flicker)
    const [, ] = await Promise.all([
      new Promise<void>((r) => setTimeout(r, 320)), // flip-out duration
      preloadImage(next),                            // ensure loaded
    ]);

    // Step 3 — swap image while card is invisible (mid-flip)
    // Show golden glow placeholder for a single frame before flipping in
    phaseRef.current = "glow";
    setPhase("glow");
    setCurrentCard(next);

    // Step 4 — tiny frame gap so React paints the new src before animating in
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Step 5 — flip IN with the new image already loaded
    phaseRef.current = "in";
    setPhase("in");

    setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
    }, 380);
  }, [currentCard]);

  // Card transform per phase
  const cardStyle: React.CSSProperties = {
    transition:
      phase === "out"
        ? "transform 0.32s cubic-bezier(.55,.05,.25,1), opacity 0.32s ease, box-shadow 0.32s ease"
        : phase === "in"
        ? "transform 0.38s cubic-bezier(.3,.8,.4,1), opacity 0.32s ease"
        : "none",
    transform:
      phase === "out"
        ? "perspective(900px) rotateY(88deg) scale(0.93)"
        : phase === "in"
        ? "perspective(900px) rotateY(-88deg) scale(0.93)"
        : "perspective(900px) rotateY(0deg) scale(1)",
    opacity: phase === "out" || phase === "glow" ? 0 : 1,
    boxShadow:
      phase === "glow"
        ? "0 0 0 8px rgba(212,175,55,0.06), 0 12px 48px -8px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.3)"
        : undefined,
  };

  const isAnimating = phase !== "idle";

  return (
    <Layout>
      <div className="space-y-8">

        {/* Heading */}
        <div className="space-y-2">
          <h1
            className="text-4xl font-serif font-semibold text-primary"
            data-testid="heading-affirmations"
          >
            Karty Afirmacyjne
          </h1>
          <p className="text-muted-foreground font-sans text-sm italic">
            Słowa, które niosą światło dla Twojej duszy
          </p>
        </div>

        {/* Oracle card display */}
        <div className="flex flex-col items-center gap-8">

          {/* Top ornament */}
          <div className="flex items-center gap-3" style={{ color: "#C9952A", fontSize: "0.7rem", letterSpacing: "0.4em", opacity: 0.6 }}>
            <span>✦</span>
            <span style={{ fontSize: "0.5rem" }}>❁ · ✿ · ❁</span>
            <span>✦</span>
          </div>

          {/* Card frame + image */}
          <div
            className="oracle-img-card"
            style={cardStyle}
            data-testid="card-affirmation-main"
          >
            <span className="oracle-corner oracle-corner-tl" style={{ fontSize: "1.1rem" }}>❧</span>
            <span className="oracle-corner oracle-corner-tr" style={{ fontSize: "1.1rem", transform: "scaleX(-1)" }}>❧</span>
            <span className="oracle-corner oracle-corner-bl" style={{ fontSize: "1.1rem", transform: "scaleY(-1)" }}>❧</span>
            <span className="oracle-corner oracle-corner-br" style={{ fontSize: "1.1rem", transform: "scale(-1,-1)" }}>❧</span>

            <img
              src={currentCard}
              alt="Karta afirmacyjna"
              className="oracle-img"
              data-testid="img-oracle-card"
              draggable={false}
            />
          </div>

          {/* Discover button */}
          <button
            onClick={handleDiscover}
            disabled={isAnimating}
            className="oracle-btn"
            data-testid="button-discover-affirmation"
          >
            <span className="oracle-sparkle" style={{ fontSize: "0.85rem" }}>✦</span>
            {isAnimating ? "Odkrywam..." : "Odkryj inną afirmację"}
            <span className="oracle-sparkle" style={{ fontSize: "0.85rem", animationDelay: "0.8s" }}>✦</span>
          </button>

          {/* Bottom ornament */}
          <div className="flex items-center gap-3" style={{ color: "#C9952A", fontSize: "0.7rem", letterSpacing: "0.4em", opacity: 0.6 }}>
            <span>✦</span>
            <span style={{ fontSize: "0.5rem" }}>✾ · ⁕ · ✾</span>
            <span>✦</span>
          </div>

          {/* Guiding phrase */}
          <p
            className="font-serif italic text-center text-sm leading-relaxed"
            style={{ color: "#C9952A", opacity: 0.8, letterSpacing: "0.03em" }}
          >
            Niech ta energia prowadzi Cię dzisiaj...
          </p>
        </div>

      </div>
    </Layout>
  );
}

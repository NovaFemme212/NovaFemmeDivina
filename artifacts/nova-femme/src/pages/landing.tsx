import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* Decorative background orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      <div className="landing-inner">

        {/* ── Logo ── */}
        <div className="landing-logo-block">
          <div className="landing-logo-sparkles">
            <span className="landing-sparkle" style={{ animationDelay: "0s" }}>✦</span>
            <span
              className="landing-logo-text"
              style={{
                background: "linear-gradient(120deg, #8B6000 0%, #C9952A 18%, #F0D980 40%, #D4AF37 58%, #B8860B 80%, #E8C96A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
                animation: "shimmer-gold 6s linear infinite",
              }}
            >
              Nova Femme
            </span>
            <span className="landing-sparkle" style={{ animationDelay: "0.5s" }}>✦</span>
          </div>
          <p className="landing-tagline">· Celebracja Boskiej Kobiecości ·</p>
        </div>

        {/* ── Ornamental divider ── */}
        <div className="landing-divider">
          <div className="landing-divider-line" />
          <span className="landing-divider-gem">✿</span>
          <div className="landing-divider-line" />
        </div>

        {/* ── Sacred card preview ── */}
        <div className="landing-card-glow" aria-hidden="true">
          <div className="landing-card-inner">
            <p style={{ color: "#D4AF37", fontSize: "2.5rem", lineHeight: 1 }}>✦</p>
            <p className="font-serif italic text-sm" style={{ color: "#9A6220", marginTop: "0.5rem" }}>
              Twoja święta przestrzeń czeka
            </p>
          </div>
        </div>

        {/* ── Headline ── */}
        <div className="landing-headline-block">
          <h1 className="landing-headline">
            Witaj w swojej<br />świętej przestrzeni
          </h1>
          <p className="landing-sub">
            Zaloguj się, aby kontynuować swoją podróż.
          </p>
        </div>

        {/* ── CTA buttons ── */}
        <div className="landing-cta-group">
          <Link href="/sign-in">
            <button className="landing-btn-primary" data-testid="button-sign-in">
              Zaloguj się
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="landing-btn-secondary" data-testid="button-sign-up">
              Utwórz konto
            </button>
          </Link>
        </div>

        {/* ── Bottom ornament ── */}
        <div className="landing-footer-ornament">
          <span style={{ color: "#C9952A", fontSize: "0.5rem", letterSpacing: "0.5em", opacity: 0.45 }}>✾ · ⁕ · ✾</span>
        </div>

      </div>
    </div>
  );
}

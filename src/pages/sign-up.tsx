import { useState } from "react";
import { SignUp } from "@clerk/react";
import { Link } from "wouter";
import { isEmailAllowed } from "@/whitelist";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  const [inputEmail, setInputEmail] = useState("");
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const email = inputEmail.toLowerCase().trim();
    if (!email) return;
    if (isEmailAllowed(email)) {
      setCheckedEmail(email);
      setDenied(false);
    } else {
      setDenied(true);
    }
  }

  return (
    <div className="landing-root">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-3" />

      <div className="auth-page-inner">
        {/* Logo */}
        <Link href="/">
          <div className="auth-logo" style={{ cursor: "pointer" }}>
            <span className="landing-sparkle" style={{ fontSize: "0.9rem" }}>✦</span>
            <span
              style={{
                background: "linear-gradient(120deg, #C9952A 0%, #F0D980 40%, #D4AF37 60%, #B8860B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              Nova Femme
            </span>
            <span className="landing-sparkle" style={{ fontSize: "0.9rem" }}>✦</span>
          </div>
        </Link>

        <p className="auth-tagline">Rozpocznij swoją świętą podróż</p>

        {/* ── Step 1: email pre-check ─────────────────────────────────── */}
        {!checkedEmail && (
          <div className="auth-clerk-wrapper">
            <div
              style={{
                background: "linear-gradient(160deg, #FFFDF5, #FBF6E4)",
                border: "1.5px solid rgba(212,175,55,0.45)",
                borderRadius: "1.25rem",
                boxShadow: "0 8px 40px rgba(180,130,20,0.12)",
                padding: "2rem 1.75rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#3D2B1F",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Sprawdź swoje zaproszenie
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
                  color: "#8B6220",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Nova Femme jest przestrzenią tylko dla zaproszonych.
                <br />Podaj swój adres e-mail, aby sprawdzić dostęp.
              </p>

              <form
                onSubmit={handleCheck}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}
              >
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => { setInputEmail(e.target.value); setDenied(false); }}
                  placeholder="Twój adres e-mail"
                  required
                  className="clerk-input"
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "0.75rem",
                    border: denied
                      ? "1.5px solid rgba(139,0,0,0.45)"
                      : "1.5px solid rgba(212,175,55,0.4)",
                    background: "#FDF8EE",
                    color: "#3D2B1F",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />

                {denied && (
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "0.85rem",
                      color: "#8B0000",
                      textAlign: "center",
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    To jest prywatna przestrzeń Nova Femme.
                    <br />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#A07830" }}>
                      Twojego adresu nie ma na liście zaproszonych osób.
                    </span>
                  </p>
                )}

                <button
                  type="submit"
                  className="clerk-btn-primary"
                  style={{
                    width: "100%",
                    padding: "0.72rem 1rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    background: "linear-gradient(135deg, #C9952A 0%, #D4AF37 50%, #B8860B 100%)",
                    color: "#fff",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(180,130,20,0.25)",
                    transition: "opacity 0.2s",
                  }}
                >
                  Sprawdź zaproszenie ✦
                </button>
              </form>

              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#A07830", margin: 0 }}>
                Masz już konto?{" "}
                <Link href="/sign-in" style={{ color: "#C9952A", textDecoration: "underline" }}>
                  Zaloguj się
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Clerk sign-up widget (only for invited email) ─── */}
        {checkedEmail && (
          <div className="auth-clerk-wrapper">
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              initialValues={{ emailAddress: checkedEmail }}
              appearance={{
                variables: {
                  colorPrimary: "#C9952A",
                  colorBackground: "#FFFCF4",
                  colorText: "#3D2B1F",
                  colorTextSecondary: "#8B6220",
                  colorInputBackground: "#FDF8EE",
                  colorInputText: "#3D2B1F",
                  borderRadius: "0.75rem",
                  fontFamily: "Inter, sans-serif",
                },
                elements: {
                  card: "clerk-card",
                  formButtonPrimary: "clerk-btn-primary",
                  formFieldInput: "clerk-input",
                  headerTitle: "clerk-header-title",
                  headerSubtitle: "clerk-header-subtitle",
                  socialButtonsIconButton: "clerk-social-btn",
                  footerActionLink: "clerk-footer-link",
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

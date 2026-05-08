import { SignIn } from "@clerk/react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  return (
    <div className="landing-root">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />

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

        <p className="auth-tagline">Witaj z powrotem, Piękna Duszo</p>

        {/* Clerk Sign-In widget */}
        <div className="auth-clerk-wrapper">
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
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
      </div>
    </div>
  );
}

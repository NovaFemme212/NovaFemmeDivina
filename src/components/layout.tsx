import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Moon, BookHeart, Home, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/react";

interface LayoutProps {
  children: ReactNode;
}

function GoldLogo({ size = "full" }: { size?: "full" | "compact" }) {
  return (
    <div className={`flex flex-col items-center ${size === "full" ? "py-2" : ""}`}>
      <div className="relative flex items-center gap-1.5 select-none">
        <span className="oracle-sparkle text-base">✦</span>
        <span
          className="font-serif font-bold tracking-wider"
          style={{
            background: "linear-gradient(135deg, #C9952A 0%, #E8C96A 35%, #D4AF37 55%, #F0D980 75%, #C9952A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: size === "full" ? "1.6rem" : "1.15rem",
            letterSpacing: "0.12em",
            textShadow: "none",
          }}
        >
          Nova Femme
        </span>
        <span className="oracle-sparkle text-base">✦</span>
      </div>
      {size === "full" && (
        <div className="flex items-center gap-1 mt-0.5">
          <span style={{ color: "#D4AF37", fontSize: "0.55rem", opacity: 0.7 }}>⋆</span>
          <p className="text-xs font-serif italic" style={{ color: "#C9952A", letterSpacing: "0.08em", opacity: 0.85 }}>
            Celebracja Boskiej Kobiecości
          </p>
          <span style={{ color: "#D4AF37", fontSize: "0.55rem", opacity: 0.7 }}>⋆</span>
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  const navigation = [
    { name: "Moja Przestrzeń", href: "/przestrzen", icon: Home, testId: "nav-home", symbol: "⊹" },
    { name: "Karty Afirmacyjne", href: "/afirmacje", icon: null, testId: "nav-affirmations", symbol: "✦" },
    { name: "Rytuały", href: "/rytualy", icon: null, testId: "nav-rituals", symbol: "❁" },
    { name: "Moje Sny", href: "/sny", icon: Moon, testId: "nav-dreams", symbol: "☽" },
    { name: "Zapiski Duszy", href: "/zapiski", icon: BookHeart, testId: "nav-journal", symbol: "❧" },
  ];

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 font-sans text-sm
          ${isActive
            ? "bg-gradient-to-r from-amber-50 to-yellow-50 font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-amber-50/60"}
        `}
        style={isActive ? { color: "#C9952A", borderLeft: "2px solid #D4AF37" } : {}}
        data-testid={item.testId}
      >
        <span
          className="w-5 text-center font-serif"
          style={{ color: isActive ? "#D4AF37" : "hsl(var(--muted-foreground))", fontSize: "1rem" }}
        >
          {item.symbol}
        </span>
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile header */}
      <header
        className="md:hidden flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(212,175,55,0.3)", background: "linear-gradient(to right, #FDF8F2, #FAF3E4)" }}
      >
        <GoldLogo size="compact" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
          style={{ color: "#C9952A" }}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar navigation */}
      <nav
        className={`
          ${isMobileMenuOpen ? "block" : "hidden"}
          md:block w-full md:w-64 shrink-0 border-r
        `}
        style={{
          background: "linear-gradient(180deg, #FDF8F0 0%, #FAF3E4 60%, #FDF8F0 100%)",
          borderColor: "rgba(212,175,55,0.35)",
        }}
      >
        {/* Logo */}
        <div className="hidden md:flex items-center justify-center pt-8 pb-6 px-4 border-b" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
          <GoldLogo size="full" />
        </div>

        {/* Divider ornament */}
        <div className="hidden md:flex items-center justify-center py-3">
          <span style={{ color: "#D4AF37", fontSize: "0.6rem", letterSpacing: "0.4em", opacity: 0.6 }}>⁕ · ⁕ · ⁕</span>
        </div>

        <div className="flex flex-col gap-0.5 px-3 pb-6">
          {navigation.map((item) => <NavItem key={item.href} item={item} />)}
        </div>

        {/* User & sign out */}
        <div
          className="flex flex-col items-center gap-2 px-4 pb-6 pt-3 mt-1 border-t md:border-t-0 md:pt-0 md:mt-0"
          style={{ borderColor: "rgba(212,175,55,0.25)" }}
        >
          {user?.emailAddresses?.[0]?.emailAddress && (
            <p className="text-xs font-sans text-center" style={{ color: "#C9952A", opacity: 0.7 }}>
              {user.emailAddresses[0].emailAddress}
            </p>
          )}
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center gap-1.5 text-xs font-sans px-4 py-2 rounded-full transition-colors active:scale-95"
            style={{ color: "#9A6220", border: "1px solid rgba(212,175,55,0.35)" }}
            data-testid="button-sign-out"
          >
            <LogOut className="w-3 h-3" />
            Wyloguj się
          </button>
        </div>

        {/* Bottom ornament */}
        <div className="hidden md:flex items-center justify-center pb-4">
          <span style={{ color: "#D4AF37", fontSize: "0.55rem", letterSpacing: "0.5em", opacity: 0.4 }}>✦ ✧ ✦</span>
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

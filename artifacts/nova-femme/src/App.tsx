import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk, useAuth, useUser } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import DashboardPage from "@/pages/dashboard";
import AffirmationsPage from "@/pages/affirmations";
import RitualsPage from "@/pages/rituals";
import DreamsPage from "@/pages/dreams";
import JournalPage from "@/pages/journal";
import { isEmailAllowed } from "@/whitelist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// Clears query cache when the signed-in user changes
function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    return addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== id) {
        qc.clear();
      }
      prevRef.current = id;
    });
  }, [addListener, qc]);

  return null;
}

// Migrates __legacy__ rows to the signed-in user's real Clerk ID (runs once per login)
function LegacyClaimer() {
  const { userId, getToken } = useAuth();
  const qc = useQueryClient();
  const claimedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || claimedRef.current === userId) return;
    claimedRef.current = userId;
    getToken().then(token => {
      if (!token) return;
      return fetch((import.meta.env.VITE_API_URL ?? "") + "/api/claim-legacy", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }).then(res => {
      if (res && res.ok) qc.invalidateQueries();
    }).catch(() => {});
  }, [userId, getToken, qc]);

  return null;
}

// Checks the signed-in user's email against the whitelist.
// If not allowed: signs them out and shows the rejection screen.
function WhitelistGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const signedOutRef = useRef(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const blocked = isLoaded && !!email && !isEmailAllowed(email);

  useEffect(() => {
    if (blocked && !signedOutRef.current) {
      signedOutRef.current = true;
      signOut();
    }
  }, [blocked, signOut]);

  if (blocked) {
    return (
      <div className="landing-root">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="auth-page-inner" style={{ maxWidth: 480, textAlign: "center", gap: "2rem" }}>
          {/* Logo */}
          <div className="auth-logo" style={{ justifyContent: "center" }}>
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

          {/* Rejection card */}
          <div
            style={{
              background: "linear-gradient(160deg, #FFFDF5, #FBF6E4)",
              border: "1.5px solid rgba(212,175,55,0.45)",
              borderRadius: "1.25rem",
              boxShadow: "0 8px 40px rgba(180,130,20,0.12)",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div style={{ fontSize: "2rem", opacity: 0.7 }}>🌙</div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "#3D2B1F",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              To jest prywatna przestrzeń Nova Femme.
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                color: "#8B6220",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Twojego adresu nie ma na liście zaproszonych osób.
            </p>
            <div
              style={{
                width: 48,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
              }}
            />
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.78rem",
                color: "#A07830",
                fontStyle: "italic",
                margin: 0,
                opacity: 0.8,
              }}
            >
              Trwa wylogowywanie...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/przestrzen" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/przestrzen" component={() => <ProtectedRoute component={DashboardPage} />} />
      <Route path="/afirmacje" component={() => <ProtectedRoute component={AffirmationsPage} />} />
      <Route path="/rytualy" component={() => <ProtectedRoute component={RitualsPage} />} />
      <Route path="/sny" component={() => <ProtectedRoute component={DreamsPage} />} />
      <Route path="/zapiski" component={() => <ProtectedRoute component={JournalPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      localization={{
        signIn: {
          start: {
            title: "Zaloguj się do Nova Femme",
            subtitle: "Witaj z powrotem, Piękna Duszo",
          },
        },
        signUp: {
          start: {
            title: "Dołącz do Nova Femme",
            subtitle: "Rozpocznij swoją duchową podróż",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkCacheInvalidator />
        <LegacyClaimer />
        <TooltipProvider>
          <WhitelistGuard>
            <Router />
          </WhitelistGuard>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;

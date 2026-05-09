import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

setBaseUrl(import.meta.env.VITE_API_URL ?? "");

// Token getter - używa Clerk session token
setAuthTokenGetter(async () => {
  try {
    // Czekaj aż Clerk się załaduje
    let attempts = 0;
    while (attempts < 20) {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        return await clerk.session.getToken();
      }
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }
  } catch {}
  return null;
});

createRoot(document.getElementById("root")!).render(<App />);

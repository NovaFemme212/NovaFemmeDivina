import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { Clerk } from "@clerk/clerk-js";

setBaseUrl(import.meta.env.VITE_API_URL ?? "");

setAuthTokenGetter(async () => {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
  } catch {}
  return null;
});

createRoot(document.getElementById("root")!).render(<App />);

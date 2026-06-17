"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackLogin } from "@/lib/client-analytics";
import { recordLoginHistory } from "@/lib/user-history-client";
import styles from "./page.module.css";

type GoogleIdPayload = {
  email?: string;
  name?: string;
  picture?: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void | Promise<void>;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme: "outline" | "filled_blue" | "filled_black";
      size: "large" | "medium" | "small";
      shape: "pill" | "rectangular" | "circle" | "square";
      text: "signin_with" | "signup_with" | "continue_with" | "signin";
      width?: number;
    }
  ) => void;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
};

function parseJwtPayload(token: string): GoogleIdPayload | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as GoogleIdPayload;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const configError = googleClientId
    ? ""
    : "Google Sign-In is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.";

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const googleApi = (window as GoogleWindow).google;
      if (!googleApi?.accounts?.id) {
        setError("Unable to load Google Sign-In.");
        return;
      }

      googleApi.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: GoogleCredentialResponse) => {
          const token = response.credential;
          if (!token) {
            setError("Google Sign-In failed. Please try again.");
            return;
          }

          const payload = parseJwtPayload(token);
          const email = payload?.email?.trim().toLowerCase();
          const name = payload?.name?.trim() || email || "Learner";
          const picture = payload?.picture?.trim() || "";

          if (!email) {
            setError("Google account email is missing.");
            return;
          }

          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", name);
          if (picture) {
            localStorage.setItem("userPicture", picture);
          } else {
            localStorage.removeItem("userPicture");
          }

          trackLogin(email);
          await recordLoginHistory(email, name);
          router.push("/dashboard");
        },
      });

      const renderGoogle = () => {
        if (!googleBtnRef.current) return;
        googleBtnRef.current.innerHTML = "";
        const width = Math.max(280, Math.min(googleBtnRef.current.clientWidth, 420));
        googleApi.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
          width,
        });
      };

      renderGoogle();
      window.addEventListener("resize", renderGoogle);

      setIsGoogleReady(true);

      return () => {
        window.removeEventListener("resize", renderGoogle);
      };
    };
    script.onerror = () => {
      setError("Unable to load Google Sign-In.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId, router]);

  function handleGuestMode() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userPicture");
    }
    router.push("/dashboard");
  }

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>AI STUDY AGENT</p>
        <h1 className={styles.title}>
          Learn AI with
          <span> structured practice and real-world thinking.</span>
        </h1>
        <p className={styles.description}>
          Move from concepts to execution with guided lessons, scenario-based
          case studies, and fast quiz loops.
        </p>

        <div className={styles.metrics}>
          <Metric label="Learning tracks" value="4" />
          <Metric label="Quiz questions" value="20+" />
          <Metric label="Case studies" value="Curated" />
        </div>
      </section>

      <section className={styles.card}>
        <span className={styles.badge}>WELCOME BACK</span>
        <h2 className={styles.cardTitle}>Sign in and continue learning</h2>
        <p className={styles.cardText}>
          Use Google Sign-In to track your quiz answer history and progress.
        </p>

        <div className={styles.googleSlot}>
          <div ref={googleBtnRef} style={{ minHeight: 44 }} />
        </div>

        {!isGoogleReady && !error && !configError && (
          <p className={styles.hint}>Loading Google Sign-In...</p>
        )}
        {(configError || error) && <p className={styles.error}>{configError || error}</p>}

        <button className={styles.secondaryBtn} onClick={handleGuestMode}>
          Continue as Guest
        </button>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <p className={styles.metricValue}>{value}</p>
      <p className={styles.metricLabel}>{label}</p>
    </div>
  );
}

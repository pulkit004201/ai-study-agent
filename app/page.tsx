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

  function goGuest(path: string) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userPicture");
    }
    router.push(path);
  }

  function handleGuestMode() {
    goGuest("/dashboard");
  }

  return (
    <main className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Product Intelligence Journal</p>
        <h1 className={styles.title}>
          Learn AI through <span className={styles.accent}>systems</span>,{" "}
          <span className={styles.accent}>signals</span>, and{" "}
          <span className={styles.accentInk}>practice.</span>
        </h1>
        <p className={styles.description}>
          AI Learn Hub is a focused workspace for execution-minded builders. Move
          from first principles to applied case drills, visual concepts, and fast
          quiz loops — all in one place.
        </p>

        <div className={styles.ctaRow}>
          <div className={styles.googleSlot}>
            <div ref={googleBtnRef} style={{ minHeight: 44 }} />
          </div>
          <button className={styles.guestBtn} onClick={handleGuestMode}>
            Explore as guest <span aria-hidden="true">→</span>
          </button>
        </div>

        {!isGoogleReady && !error && !configError && (
          <p className={styles.hint}>Loading Google Sign-In…</p>
        )}
        {(configError || error) && (
          <p className={styles.error}>{configError || error}</p>
        )}

        <div className={styles.meta}>
          <span>
            <strong>4</strong> learning tracks
          </span>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>
            <strong>20+</strong> quiz drills
          </span>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>
            <strong>Curated</strong> case studies
          </span>
        </div>
      </section>

      <aside className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelCount}>
            <strong>{MODULES.length}</strong>
            <span>/ {MODULES.length} modules</span>
          </div>
          <div className={styles.panelTags}>
            <span className={styles.pill}>Full curriculum</span>
            <span className={styles.live}>
              <span className={styles.liveDot} aria-hidden="true" /> Live
            </span>
          </div>
        </div>

        <div className={styles.panelBar} aria-hidden="true">
          <span />
        </div>

        <ul className={styles.modules}>
          {MODULES.map((module, index) => (
            <li key={module.path}>
              <button
                type="button"
                className={styles.moduleRow}
                onClick={() => goGuest(module.path)}
              >
                <span className={styles.moduleNum}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.moduleBody}>
                  <span className={styles.moduleName}>{module.label}</span>
                  <span className={styles.moduleNote}>{module.note}</span>
                </span>
                <span className={styles.moduleArrow} aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}

const MODULES: { label: string; note: string; path: string }[] = [
  { label: "Guided Lessons", note: "First principles to applied", path: "/learn" },
  { label: "Visual Concepts", note: "See how the ideas connect", path: "/visualize" },
  { label: "Quiz Drills", note: "Fast recall and feedback loops", path: "/quiz" },
  { label: "Case Studies", note: "Real product scenarios", path: "/case-studies" },
  { label: "Movie Agent", note: "A live recommender to study", path: "/movies" },
  { label: "Resources", note: "Guides and playbooks", path: "/resources" },
];

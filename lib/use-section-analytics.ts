"use client";

import { useEffect, useRef } from "react";
import type { AnalyticsModule } from "@/lib/analytics-store";
import { trackModuleAccess, trackModuleSession } from "@/lib/client-analytics";

export function useSectionAnalytics(module: AnalyticsModule) {
  const startedAtRef = useRef<number | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    sentRef.current = false;
    trackModuleAccess(module);

    function flushSession() {
      if (sentRef.current || startedAtRef.current === null) return;
      const duration = Date.now() - startedAtRef.current;
      trackModuleSession(module, duration);
      sentRef.current = true;
    }

    window.addEventListener("pagehide", flushSession);
    return () => {
      flushSession();
      window.removeEventListener("pagehide", flushSession);
    };
  }, [module]);
}

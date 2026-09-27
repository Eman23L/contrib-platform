"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // Installability/offline support is a progressive enhancement;
      // nothing in the app depends on it being available.
    });
  }, []);

  return null;
}

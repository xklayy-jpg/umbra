// monitoring.js
// Lightweight performance + error monitoring hooks for Umbra v3.
// Designed to be easy to wire into tools like Sentry, Vercel Monitoring, or LogRocket.

import { trackEvent } from "./analytics.js";

/**
 * Observes a subset of Core Web Vitals-like metrics using the PerformanceObserver API.
 * In production, you can forward these measurements to your monitoring vendor.
 */
function initWebVitals() {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          trackEvent("web_vital_lcp", { value: entry.startTime });
        } else if (entry.entryType === "first-input") {
          const fi = entry;
          trackEvent("web_vital_fid", { value: fi.processingStart - fi.startTime });
        } else if (entry.entryType === "layout-shift" && !entry.hadRecentInput) {
          const ls = entry;
          trackEvent("web_vital_cls", { value: ls.value });
        }
      }
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });
    observer.observe({ type: "first-input", buffered: true });
    observer.observe({ type: "layout-shift", buffered: true });
  } catch (error) {
    console.error("PerformanceObserver setup failed.", error);
  }
}

/**
 * Global error and unhandled rejection listeners.
 * Replace the console logging with calls to Sentry / LogRocket if desired.
 */
function initErrorLogging() {
  window.addEventListener(
    "error",
    (event) => {
      const payload = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      };
      console.error("Umbra runtime error", payload);
      trackEvent("runtime_error", { message: event.message });
    },
    true
  );

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Umbra unhandled rejection", event.reason);
    trackEvent("runtime_unhandled_rejection", {
      message: String(event.reason || "unknown")
    });
  });
}

/**
 * Public initializer for monitoring hooks.
 */
export function initMonitoring() {
  initWebVitals();
  initErrorLogging();
}


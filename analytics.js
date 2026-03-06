// analytics.js
// Centralized analytics layer for Umbra v3.
// - Wraps Plausible (or any other analytics provider)
// - Tracks basic events, conversions, and scroll engagement
// - Mirrors a subset of data into localStorage for the internal dashboard

const NAMESPACE = "umbra-analytics-v1";

/** @typedef {{ name: string; props?: Record<string, unknown>; ts: number; }} TrackedEvent */

/**
 * Safely reads the analytics buffer from localStorage.
 * This is only used for the lightweight internal dashboard.
 */
function readBuffer() {
  try {
    const raw = window.localStorage.getItem(NAMESPACE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists the analytics buffer back to localStorage.
 */
function writeBuffer(events) {
  try {
    window.localStorage.setItem(NAMESPACE, JSON.stringify(events.slice(-500)));
  } catch {
    // localStorage may be unavailable; fail silently.
  }
}

/**
 * Append a new event to the local buffer used by the internal dashboard.
 * @param {TrackedEvent} event
 */
function recordLocal(event) {
  const buffer = readBuffer();
  buffer.push(event);
  writeBuffer(buffer);
}

/**
 * Public helper for the dashboard page to consume the buffered analytics.
 */
export function getLocalAnalyticsEvents() {
  return readBuffer();
}

/**
 * Core tracking helper. Sends events to Plausible (if present) and logs a
 * privacy-safe copy to the local dashboard buffer.
 */
export function trackEvent(name, props = {}) {
  const ts = Date.now();

  try {
    if (window.plausible) {
      window.plausible(name, { props });
    }
  } catch (error) {
    // Keep console noise minimal; this is non-critical.
    console.error("Analytics tracking failed.", error);
  }

  recordLocal({ name, props, ts });
}

// Scroll depth tracking for engagement metrics and conversions.
const scrollDepthMilestones = [25, 50, 75, 90];
const reachedMilestones = new Set();

/**
 * Called with a scroll progress value 0–1 to record engagement milestones.
 */
export function updateScrollDepthAnalytics(progress) {
  const percent = Math.round(progress * 100);
  scrollDepthMilestones.forEach((milestone) => {
    if (percent >= milestone && !reachedMilestones.has(milestone)) {
      reachedMilestones.add(milestone);
      trackEvent("scroll_depth", { percent: milestone });
    }
  });
}

/**
 * Registers click handlers for key conversion points and portfolio engagement.
 */
export function initAnalyticsClickTracking() {
  const startProject = document.querySelector('[data-analytics="start-project"]');
  if (startProject) {
    startProject.addEventListener("click", () => {
      trackEvent("start_project_click");
    });
  }

  const formSubmitBtn = document.querySelector('[data-analytics="form-submit"]');
  if (formSubmitBtn) {
    formSubmitBtn.addEventListener("click", () => {
      trackEvent("contact_submit_clicked");
    });
  }

  document.querySelectorAll('[data-analytics="portfolio-item"]').forEach((item) => {
    item.addEventListener("click", () => {
      const title = item.querySelector("h3")?.textContent || "Untitled";
      trackEvent("portfolio_interaction", { title });
    });
  });
}


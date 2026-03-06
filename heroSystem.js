// heroSystem.js
// Hero system for Umbra v3.
// - Spline moon hero integration
// - Scroll-based lighting + rotation
// - Visibility-aware performance tuning

import { Application } from "https://unpkg.com/@splinetool/runtime@1.12.67/build/runtime.js";
import { updateScrollDepthAnalytics } from "./analytics.js";

const root = document.documentElement;

// IMPORTANT: Replace with your own Spline .splinecode export URL.
// In Spline: Export → Code → Vanilla JS → copy URL here.
const SPLINE_SCENE_URL =
  "https://prod.spline.design/your-moon-scene/scene.splinecode";

const canvas = document.getElementById("moonCanvas");
const app = canvas ? new Application(canvas) : null;

let moonObject = null;
let keyLight = null;
let splineLoaded = false;

let lastTime = 0;
let scrollProgress = 0;
let isPausedForVisibility = false;

// Basic feature flag for low-power devices to reduce rendering cost.
function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const ua = navigator.userAgent || "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  return isMobile || cores <= 4 || memory <= 4;
}

const LOW_POWER = isLowPowerDevice();

async function initSpline() {
  if (!app || !canvas) return;

  try {
    await app.load(SPLINE_SCENE_URL);

    moonObject = app.findObjectByName("Moon");
    keyLight = app.findObjectByName("KeyLight");

    // On low-power hardware, reduce render size for perf.
    if (LOW_POWER) {
      try {
        const rect = canvas.getBoundingClientRect();
        const scale = 0.7;
        app.setSize(rect.width * scale, rect.height * scale);
      } catch (err) {
        console.error("Failed to adjust Spline size for low-power device.", err);
      }
    }

    splineLoaded = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);

    // Hide static fallback once the 3D scene is ready.
    const fallback = document.querySelector(".moon-fallback");
    if (fallback) {
      fallback.classList.add("is-hidden");
    }
  } catch (error) {
    console.error("Failed to load Spline scene. Check SPLINE_SCENE_URL.", error);
  }
}

// Subtle continuous rotation; main dramatic movement comes from scroll mapping.
function tick(timestamp) {
  if (isPausedForVisibility) {
    requestAnimationFrame(tick);
    return;
  }

  const dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
  lastTime = timestamp;

  if (splineLoaded && moonObject) {
    moonObject.rotation.y += dt * 0.02;
  }

  requestAnimationFrame(tick);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function handleScroll() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const heroHeight = rect.height || viewportHeight;
  const travel = viewportHeight + heroHeight;
  const raw = 1 - (rect.top + heroHeight) / travel;

  scrollProgress = clamp01(raw);

  root.style.setProperty("--scroll-progress", scrollProgress.toFixed(4));

  const logoStart = 0.08;
  const logoEnd = 0.45;
  const logoRaw = (scrollProgress - logoStart) / (logoEnd - logoStart);
  const logoProgress = clamp01(logoRaw);
  root.style.setProperty("--logo-progress", logoProgress.toFixed(4));

  const starsOffset = scrollProgress * 60;
  root.style.setProperty("--stars-offset", `${starsOffset.toFixed(2)}px`);

  if (splineLoaded && moonObject) {
    const baseMoonRotation = -0.35;
    const rangeMoonRotation = 0.7;
    const targetMoonRotation =
      baseMoonRotation + rangeMoonRotation * scrollProgress;
    moonObject.rotation.y = targetMoonRotation;
  }

  if (splineLoaded && keyLight) {
    const baseLightX = 0.35;
    const rangeLightX = 0.6;
    const baseLightY = -0.5;
    const rangeLightY = 0.8;

    keyLight.rotation.x = baseLightX + rangeLightX * scrollProgress;
    keyLight.rotation.y = baseLightY + rangeLightY * scrollProgress;

    const minIntensity = 1.0;
    const maxIntensity = 1.3;
    keyLight.intensity =
      minIntensity + (maxIntensity - minIntensity) * scrollProgress;
  }

  updateScrollDepthAnalytics(scrollProgress);
}

function setupVisibilityHandling() {
  if (!app) return;

  document.addEventListener("visibilitychange", () => {
    const hidden = document.hidden;
    isPausedForVisibility = hidden;
    try {
      if (hidden) {
        app.stop();
      } else {
        app.play();
      }
    } catch (err) {
      console.error("Error toggling Spline visibility state.", err);
    }
  });
}

/**
 * Public entry point for the hero system.
 * Wires scroll handling and lazy-loads the Spline hero.
 */
export function initHeroSystem() {
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);
  handleScroll();

  setupVisibilityHandling();

  const schedule = () => {
    initSpline().catch((error) =>
      console.error("Error initializing Spline application.", error)
    );
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(schedule, { timeout: 2000 });
  } else {
    setTimeout(schedule, 0);
  }
}


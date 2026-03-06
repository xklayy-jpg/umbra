// Umbra v3 main orchestrator.
// This file wires together modular systems without changing the visual output:
// - Hero system (Spline moon, scroll-driven lighting)
// - Animation engine (section reveal)
// - Interaction engine (smooth scroll, magnetic buttons, parallax)
// - Contact + AI lead intelligence
// - Analytics and monitoring hooks

import { initSectionReveal } from "./js/animationEngine.js";
import {
  initSmoothAnchors,
  initMagneticButtons,
  initHeroParallax
} from "./js/interactionEngine.js";
import { initHeroSystem } from "./js/heroSystem.js";
import { initContactForm } from "./js/contactSystem.js";
import { initAiLeadAssistant } from "./js/aiLeadSystem.js";
import { initAnalyticsClickTracking } from "./js/analytics.js";
import { initMonitoring } from "./js/monitoring.js";
import { hydrateCmsContent } from "./js/cmsClient.js";
import { initBlogPreview } from "./js/blogSystem.js";

function initYear() {
  const el = document.getElementById("year");
  if (el) {
    el.textContent = new Date().getFullYear().toString();
  }
}

function init() {
  initYear();

  // Animation + interaction engines.
  initSectionReveal();
  initSmoothAnchors();
  initMagneticButtons();
  initHeroParallax();

  // Systems.
  initHeroSystem();
  initContactForm();
  initAiLeadAssistant();
  initAnalyticsClickTracking();
  initMonitoring();
  initBlogPreview();

  // Optional: hydrate content from a headless CMS if configured.
  hydrateCmsContent().catch((error) =>
    console.error("CMS content hydration failed, falling back to static markup.", error)
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


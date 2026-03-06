// interactionEngine.js
// User interaction primitives for Umbra v3.
// - Smooth scrolling
// - Magnetic button hover
// - Cursor-based parallax wiring for the hero

const root = document.documentElement;

/**
 * Smooth scrolling for intra-page anchor links.
 */
export function initSmoothAnchors() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/**
 * Magnetic hover effect for buttons using transform only (GPU-friendly).
 */
export function initMagneticButtons() {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((btn) => {
    const strength = 18;

    btn.addEventListener("pointermove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const dx = (x / rect.width) * strength;
      const dy = (y / rect.height) * strength;

      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
    });

    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/**
 * Cursor-based parallax driver for the hero section.
 * Updates CSS variables consumed by `style.css`.
 */
export function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    const clampedX = Math.max(-0.5, Math.min(0.5, relX));
    const clampedY = Math.max(-0.5, Math.min(0.5, relY));

    root.style.setProperty("--cursor-x", clampedX.toFixed(3));
    root.style.setProperty("--cursor-y", clampedY.toFixed(3));
  });

  hero.addEventListener("pointerleave", () => {
    root.style.setProperty("--cursor-x", "0");
    root.style.setProperty("--cursor-y", "0");
  });
}


// animationEngine.js
// Shared animation utilities for Umbra v3.
// - Section reveal on scroll
// - Placeholder for future timeline-based effects

/**
 * Applies a simple fade+lift-in animation when sections enter the viewport.
 * The CSS class `.section.is-visible` is already styled in `style.css`.
 */
export function initSectionReveal() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".section").forEach((section) => {
    observer.observe(section);
  });
}


// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero fallback if Spline not loaded
  const canvas = document.getElementById('moonCanvas');
  const fallback = document.querySelector('.moon-fallback');
  if (canvas) console.log('Spline hero would load here');
  if (fallback) fallback.style.display = 'block';

  // Simple scroll reveal (optional)
  const sections = document.querySelectorAll('section');
  sections.forEach((sec) => sec.classList.add('visible'));
});

// contactSystem.js
// Contact + lead capture system for Umbra v3.
// - Client-side validation and sanitization
// - Honeypot support
// - Simple client-side rate limiting
// - Analytics hooks

import { trackEvent } from "./analytics.js";

function sanitizeInput(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

let lastSubmitTs = 0;

/**
 * Bootstraps the contact form, including validation, sanitization,
 * basic rate limiting and analytics tracking.
 */
export function initContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  if (!form || !statusEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTs < 8000) {
      statusEl.textContent = "Please wait a few seconds before submitting again.";
      return;
    }

    const formData = new FormData(form);
    const honeypot = formData.get("website");
    if (honeypot) {
      statusEl.textContent =
        "Thanks — if you are human, please remove any autofilled values and try again.";
      return;
    }

    const name = sanitizeInput(formData.get("name"));
    const email = sanitizeInput(formData.get("email"));
    const company = sanitizeInput(formData.get("company"));
    const budget = sanitizeInput(formData.get("budget"));
    const timeline = sanitizeInput(formData.get("timeline"));
    const message = sanitizeInput(formData.get("message"));
    const aiSummary = sanitizeInput(formData.get("aiSummary"));

    if (!name || !email || !message) {
      statusEl.textContent = "Name, email, and a short message are required.";
      return;
    }

    if (!isValidEmail(email)) {
      statusEl.textContent = "Please provide a valid email address.";
      return;
    }

    if (message.length < 10) {
      statusEl.textContent = "Share at least a sentence or two about your project.";
      return;
    }

    statusEl.textContent = "Sending your inquiry…";

    const payload = {
      name,
      email,
      company,
      budget,
      timeline,
      message,
      aiSummary
    };

    try {
      lastSubmitTs = now;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      statusEl.textContent =
        data && data.message
          ? data.message
          : "Thanks — your request has been received.";

      trackEvent("contact_submitted", { budget, hasAiSummary: !!aiSummary });
      form.reset();
      const aiField = document.getElementById("aiSummaryField");
      if (aiField) aiField.value = "";
      const aiSummaryEl = document.getElementById("ai-summary");
      if (aiSummaryEl) aiSummaryEl.textContent = "";
    } catch (error) {
      console.error("Error submitting contact form.", error);
      statusEl.textContent =
        "Something went wrong sending your request. Please try again in a moment.";
    }
  });
}


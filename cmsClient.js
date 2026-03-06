// cmsClient.js
// Optional headless CMS integration for Umbra v3.
// - When cmsConfig.provider === "none", this is a no-op and static markup is used.
// - When configured, it can hydrate services, portfolio, clients, etc from a CMS.

import { cmsConfig } from "./cmsConfig.js";
import {
  staticServices,
  staticPortfolio,
  staticClients,
  staticTestimonials
} from "./staticContent.js";

async function fetchFromSanity() {
  // Placeholder: document the pattern, but do not hardwire credentials.
  // eslint-disable-next-line no-unused-vars
  const { projectId, dataset } = cmsConfig;
  // Example GROQ queries could be wired here.
  return null;
}

async function fetchFromContentful() {
  // eslint-disable-next-line no-unused-vars
  const { spaceId, environment, accessToken } = cmsConfig;
  return null;
}

async function fetchFromNotion() {
  // eslint-disable-next-line no-unused-vars
  const { notionDatabaseId, notionPublicApiKey } = cmsConfig;
  return null;
}

/**
 * High-level fetcher that returns a structured content object.
 * The shape is intentionally simple so it works across providers.
 */
async function fetchCmsSnapshot() {
  if (cmsConfig.provider === "sanity") {
    return fetchFromSanity();
  }
  if (cmsConfig.provider === "contentful") {
    return fetchFromContentful();
  }
  if (cmsConfig.provider === "notion") {
    return fetchFromNotion();
  }
  return null;
}

/**
 * Hydrates document sections from CMS data where available.
 * If CMS is disabled or unavailable, the static HTML is left untouched.
 */
export async function hydrateCmsContent() {
  const snapshot = await fetchCmsSnapshot();
  if (!snapshot) return;

  const services = snapshot.services || staticServices;
  const portfolio = snapshot.portfolio || staticPortfolio;
  const clients = snapshot.clients || staticClients;
  const testimonials = snapshot.testimonials || staticTestimonials;

  try {
    hydrateServices(services);
    hydratePortfolio(portfolio);
    hydrateClients(clients);
    hydrateTestimonials(testimonials);
  } catch (error) {
    console.error("Error hydrating CMS content.", error);
  }
}

function hydrateServices(services) {
  const cards = Array.from(document.querySelectorAll(".services-grid .service-card"));
  services.slice(0, cards.length).forEach((svc, index) => {
    const card = cards[index];
    const titleEl = card.querySelector("h3");
    const bodyEl = card.querySelector("p");
    const listEl = card.querySelector("ul");

    if (titleEl) titleEl.textContent = svc.title;
    if (bodyEl) bodyEl.textContent = svc.body;
    if (listEl && Array.isArray(svc.bullets)) {
      listEl.innerHTML = "";
      svc.bullets.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });
    }
  });
}

function hydratePortfolio(portfolio) {
  const items = Array.from(
    document.querySelectorAll("#portfolio .portfolio-grid .portfolio-item")
  );
  portfolio.slice(0, items.length).forEach((proj, index) => {
    const card = items[index];
    const titleEl = card.querySelector(".portfolio-meta h3");
    const descEl = card.querySelector(".portfolio-meta p");
    const tagEl = card.querySelector(".tag");

    if (titleEl) titleEl.textContent = proj.title;
    if (descEl) descEl.textContent = proj.description;
    if (tagEl) tagEl.textContent = proj.tag;
  });
}

function hydrateClients(clients) {
  const row = document.querySelector(".client-row");
  if (!row || !Array.isArray(clients) || clients.length === 0) return;

  row.innerHTML = "";
  clients.forEach((client) => {
    const pill = document.createElement("div");
    pill.className = "client-pill";
    pill.textContent = client;
    row.appendChild(pill);
  });
}

function hydrateTestimonials(testimonials) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) return;

  // Placeholder: add a testimonials section just after clients if content exists.
  const clientsSection = document.getElementById("clients");
  if (!clientsSection) return;

  if (document.getElementById("testimonials")) return;

  const section = document.createElement("section");
  section.id = "testimonials";
  section.className = "section";
  section.innerHTML = `
    <div class="section-inner">
      <header class="section-header section-header-center">
        <p class="eyebrow">Testimonials</p>
        <h2 class="section-title">Signals from the field.</h2>
      </header>
      <div class="services-grid">
        ${testimonials
          .map(
            (t) => `
          <article class="service-card">
            <h3>${t.title}</h3>
            <p>${t.quote}</p>
            <ul>
              <li>${t.author}</li>
            </ul>
          </article>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  clientsSection.insertAdjacentElement("afterend", section);
}


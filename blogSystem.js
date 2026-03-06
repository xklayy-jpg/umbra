// blogSystem.js
// Lightweight "Insights" system for Umbra v3.
// - Uses static markdown content by default (see staticContent.js)
// - Renders previews on the landing page
// - Supports shareable URLs in the form ?post=slug#insights
// - Provides basic markdown-to-HTML rendering and reading-time estimation

import { staticInsights } from "./staticContent.js";

function estimateReadingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

// Very small markdown renderer sufficient for internal thought pieces.
function renderMarkdown(md) {
  let html = md;

  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  html = html.replace(/^(?!<h\d|<pre|<ul|<li|<\/)(.+)$/gm, "<p>$1</p>");

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function findInsightBySlug(slug) {
  return staticInsights.find((post) => post.slug === slug);
}

/**
 * Renders a small preview list of insights on the landing page.
 */
export function initBlogPreview() {
  const container = document.getElementById("insights-preview");
  if (!container || staticInsights.length === 0) return;

  const list = document.createElement("div");
  list.className = "portfolio-grid";

  staticInsights.forEach((post) => {
    const minutes = post.minutesToRead || estimateReadingTime(post.markdown || "");
    const item = document.createElement("article");
    item.className = "portfolio-item";
    item.innerHTML = `
      <div class="portfolio-meta">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        <span class="tag">Insight · ${minutes} min read</span>
      </div>
    `;
    item.addEventListener("click", () => {
      const url = new URL(window.location.href);
      url.searchParams.set("post", post.slug);
      url.hash = "insights";
      window.location.href = url.toString();
    });
    list.appendChild(item);
  });

  container.appendChild(list);

  // If a post slug is present in the URL, render it inline.
  const url = new URL(window.location.href);
  const slug = url.searchParams.get("post");
  if (slug) {
    renderInlinePost(slug);
  }
}

function renderInlinePost(slug) {
  const articleShell = document.getElementById("insights-article");
  if (!articleShell) return;

  const post = findInsightBySlug(slug);
  if (!post) {
    articleShell.innerHTML =
      "<p class=\"section-description\">This insight is not available.</p>";
    return;
  }

  const minutes = post.minutesToRead || estimateReadingTime(post.markdown || "");
  const html = renderMarkdown(post.markdown || "");

  articleShell.innerHTML = `
    <header class="section-header">
      <p class="eyebrow">Insights</p>
      <h2 class="section-title">${post.title}</h2>
      <p class="section-description">
        ${post.description} · ${minutes} min read
      </p>
    </header>
    <article class="section-inner">
      ${html}
    </article>
  `;
}


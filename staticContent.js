// staticContent.js
// Static content definitions used when CMS is disabled or unavailable.
// These mirror the existing hard-coded sections in index.html so that
// the site continues to render correctly without JavaScript.

export const staticServices = [
  {
    title: "AI‑Native Web Experiences",
    body:
      "Minimal, cinematic interfaces with realtime personalization, storytelling and motion built directly into the system — not bolted on.",
    bullets: [
      "High-fidelity 3D & motion",
      "Ultra-fast, edge-optimized builds",
      "Analytics-aware experience design"
    ]
  },
  {
    title: "Intelligent Automation",
    body:
      "Invisible workflows that handle qualification, onboarding, and support — seamlessly integrated into your existing stack.",
    bullets: [
      "AI agents & orchestration",
      "CRM & data-layer integration",
      "Hybrid human-in-the-loop flows"
    ]
  },
  {
    title: "Foundational Design Systems",
    body:
      "Cohesive visual languages and component libraries that scale from landing pages to full platforms without visual debt.",
    bullets: [
      "Tokenized design systems",
      "Framer & React libraries",
      "Living documentation & guidelines"
    ]
  }
];

export const staticPortfolio = [
  {
    title: "Neural Research Lab",
    description: "Cinematic brand site with realtime, AI-curated case studies.",
    tag: "Web Experience"
  },
  {
    title: "Silent Fintech",
    description: "Apple-level minimalism for a high-trust financial platform.",
    tag: "Product Marketing"
  },
  {
    title: "Umbra Ops",
    description: "AI operations hub with adaptive layouts driven by telemetry.",
    tag: "Platform Design"
  },
  {
    title: "Quiet Wellness",
    description: "Sensory digital rituals with adaptive, mood-aware visuals.",
    tag: "AI Experience"
  }
];

export const staticClients = [
  "LUNAR SYSTEMS",
  "APEX QUANT",
  "KINETIC CLOUD",
  "PARALLAX LABS"
];

export const staticTestimonials = [];

export const staticInsights = [
  {
    slug: "systems-over-pages",
    title: "Designing Systems, Not Pages",
    description:
      "Why modern studios need to think in composable, AI-assisted systems instead of isolated campaigns.",
    publishedAt: "2026-02-18",
    minutesToRead: 7,
    markdown: `# Designing Systems, Not Pages

Most web teams still ship pages. Umbra ships **systems**.

Systems encode brand, behavior, and the constraints of the business into reusable digital primitives. From there, pages become *instances* of the system rather than one‑off artifacts.

\`\`\`js
// Example: a tiny decision tree for a hero
const state = {
  intent: "launch",
  audience: "founders"
};

const headline = computeHeadline(state);
\`\`\`

Once encoded, these decisions can be reused across sites, apps, and internal tools with almost no additional effort.`
  }
];


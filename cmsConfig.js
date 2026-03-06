// cmsConfig.js
// Configuration for optional headless CMS integration.
// By default, the site runs in static mode and ignores remote CMSs.

export const cmsConfig = {
  // Supported values: "none" | "sanity" | "contentful" | "notion"
  provider: "none",

  // Sanity example:
  // projectId: "your-project-id",
  // dataset: "production",

  // Contentful example:
  // spaceId: "your-space-id",
  // environment: "master",
  // accessToken: "PUBLIC_DELIVERY_TOKEN",

  // Notion example:
  // notionDatabaseId: "your-database-id",
  // notionPublicApiKey: "PUBLIC_API_KEY"
};


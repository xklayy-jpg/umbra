// main.js — Umbra v3 entry point

import { initHero } from './heroSystem.js';
import { initAnimations } from './animationEngine.js';
import { initInteractions } from './interactionEngine.js';
import { initContact } from './contactSystem.js';
import { initAILead } from './aiLeadSystem.js';
import { initAnalytics } from './analytics.js';
import { initMonitoring } from './monitoring.js';
import { initBlog } from './blogSystem.js';
import { initCMS } from './cmsClient.js';
import { cmsConfig } from './cmsConfig.js';
import { staticContent } from './staticContent.js';

function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initHero();
  initAnimations();
  initInteractions();
  initContact();
  initAILead();
  initAnalytics();
  initMonitoring();
  initBlog();
  initCMS(cmsConfig);
  staticContent();
});

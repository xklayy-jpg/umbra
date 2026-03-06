// aiLeadSystem.js
// Lead intelligence layer for Umbra v3.
// - Upgrades the project assistant into a structured lead processor
// - Summarizes context, categorizes lead type, and estimates potential value
// - Writes a machine-readable brief into the hidden `aiSummary` field

/**
 * Lightweight heuristic to categorize the lead based on message content.
 */
function classifyLeadType(goal, budget) {
  const text = `${goal} ${budget}`.toLowerCase();

  if (text.includes("platform") || text.includes("internal tool")) {
    return "platform / systems";
  }
  if (text.includes("brand") || text.includes("landing")) {
    return "marketing site / branding";
  }
  if (text.includes("automation") || text.includes("workflow")) {
    return "automation / ops";
  }
  return "mixed / exploratory";
}

/**
 * Rough value estimate based on the selected budget band.
 */
function estimateValueFromBudget(budget) {
  switch (budget) {
    case "25-50":
      return 37500;
    case "50-100":
      return 75000;
    case "100-250":
      return 175000;
    case "250+":
      return 275000;
    default:
      return 0;
  }
}

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

/**
 * Bootstraps the AI project assistant UI and wires it to the hidden form field.
 */
export function initAiLeadAssistant() {
  const container = document.getElementById("ai-assistant");
  const toggle = container?.querySelector(".ai-toggle");
  const panel = container?.querySelector(".ai-panel");
  const generateBtn = container?.querySelector(".ai-generate");
  const summaryEl = document.getElementById("ai-summary");
  const summaryField = document.getElementById("aiSummaryField");

  if (!container || !toggle || !panel || !generateBtn || !summaryEl || !summaryField) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isHidden = panel.hasAttribute("hidden");
    if (isHidden) {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
    } else {
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  generateBtn.addEventListener("click", () => {
    const goalEl = document.getElementById("ai-goal");
    const audienceEl = document.getElementById("ai-audience");
    const constraintsEl = document.getElementById("ai-constraints");
    const budgetEl = /** @type {HTMLSelectElement | null} */ (
      document.getElementById("budget")
    );
    if (!goalEl || !audienceEl || !constraintsEl) return;

    const goal = sanitize(goalEl.value);
    const audience = sanitize(audienceEl.value);
    const constraints = sanitize(constraintsEl.value);
    const budget = sanitize(budgetEl?.value || "");

    const leadType = classifyLeadType(goal, budget);
    const valueEstimate = estimateValueFromBudget(budget);

    const briefLines = [];

    if (goal) {
      briefLines.push(`Project focus: ${goal}`);
    }
    if (audience) {
      briefLines.push(`Primary audience: ${audience}`);
    }
    if (constraints) {
      briefLines.push(`Constraints & non‑negotiables: ${constraints}`);
    }

    const humanSummary =
      briefLines.length > 0
        ? briefLines.join("\n")
        : "Share a few details above and we’ll condense them into a short project summary.";

    const structuredLead = {
      leadType,
      valueEstimate,
      goal,
      audience,
      constraints,
      humanSummary
    };

    summaryEl.textContent =
      "Umbra project brief\n\n" +
      humanSummary +
      `\n\nLead type: ${leadType}\nEstimated value: ${
        valueEstimate ? `$${valueEstimate.toLocaleString()}` : "TBD"
      }`;

    summaryField.value = JSON.stringify(structuredLead);
  });
}


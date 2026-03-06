// Vercel serverless function for secure contact form handling.
// - Validates and sanitizes incoming data
// - Accepts both JSON and URL-encoded form submissions (for JS-disabled fallback)
// - Applies simple in-memory rate limiting per IP (best-effort, per-instance)
// - Responds with JSON; integrate with email / CRM inside the handler where noted

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10;

/** @type {Map<string, number[]>} */
const requestLog = new Map();

function getClientIp(req) {
  const hdr =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "";
  if (Array.isArray(hdr)) return hdr[0] || "";
  const first = hdr.split(",")[0];
  return first?.trim() || "";
}

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function rateLimited(ip) {
  const now = Date.now();
  const existing = requestLog.get(ip) || [];
  const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const ip = getClientIp(req) || "unknown";
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
  }

  let body = req.body;
  if (!body) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
          data += chunk;
          if (data.length > 1_000_000) {
            reject(new Error("Payload too large"));
          }
        });
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });

      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        body = raw ? JSON.parse(raw) : {};
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams(raw);
        body = Object.fromEntries(params.entries());
      } else {
        body = raw ? JSON.parse(raw) : {};
      }
    } catch (error) {
      console.error("Error parsing request body.", error);
      return res.status(400).json({ error: "Invalid request payload." });
    }
  }

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const company = sanitize(body.company);
  const budget = sanitize(body.budget);
  const timeline = sanitize(body.timeline);
  const message = sanitize(body.message);
  const aiSummaryRaw = body.aiSummary;
  const honeypot = sanitize(body.website);

  // Attempt to parse AI lead intelligence summary if present (JSON from aiLeadSystem.js).
  let aiSummary = "";
  let leadMeta = null;
  if (typeof aiSummaryRaw === "string" && aiSummaryRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(aiSummaryRaw);
      if (parsed && typeof parsed === "object") {
        leadMeta = {
          leadType: sanitize(parsed.leadType),
          valueEstimate: Number(parsed.valueEstimate) || 0,
          goal: sanitize(parsed.goal),
          audience: sanitize(parsed.audience),
          constraints: sanitize(parsed.constraints)
        };
        aiSummary = sanitize(parsed.humanSummary || "");
      }
    } catch {
      aiSummary = sanitize(aiSummaryRaw);
    }
  }

  if (honeypot) {
    // Likely a bot; reply with generic success without doing any work.
    return res.status(200).json({ message: "Thank you." });
  }

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and a short message are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  if (message.length < 10 || message.length > 5000) {
    return res.status(400).json({
      error: "Message length should be between 10 and 5000 characters."
    });
  }

  try {
    // TODO: Integrate with your delivery mechanism here:
    //  - Email provider (Resend, Postmark, SES, etc.)
    //  - CRM or ticketing system
    //  - Database for lead tracking
    //
    // The sanitized, validated payload is:
    const payload = {
      name,
      email,
      company,
      budget,
      timeline,
      message,
      aiSummary,
      leadMeta,
      ip
    };

    console.log("New Umbra inquiry", payload);

    return res.status(200).json({
      message:
        "Thanks — your project brief has been safely received. We’ll follow up shortly."
    });
  } catch (error) {
    console.error("Error processing contact request.", error);
    return res
      .status(500)
      .json({ error: "We couldn’t process your request. Please try again later." });
  }
};


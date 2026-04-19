import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

interface DetectionRule {
  name: string;
  category: string;
  patterns: { regex: RegExp; source: "html" | "header"; confidence: "high" | "medium" | "low" }[];
}

const HTML_RULES: DetectionRule[] = [
  { name: "WordPress", category: "CMS", patterns: [{ regex: /wp-content/i, source: "html", confidence: "high" }, { regex: /wp-includes/i, source: "html", confidence: "high" }] },
  { name: "Shopify", category: "CMS", patterns: [{ regex: /cdn\.shopify\.com/i, source: "html", confidence: "high" }, { regex: /Shopify\.theme/i, source: "html", confidence: "high" }] },
  { name: "Wix", category: "CMS", patterns: [{ regex: /wix\.com/i, source: "html", confidence: "high" }, { regex: /_wix_browser_sess/i, source: "html", confidence: "high" }] },
  { name: "Squarespace", category: "CMS", patterns: [{ regex: /squarespace/i, source: "html", confidence: "high" }, { regex: /static\.squarespace\.com/i, source: "html", confidence: "high" }] },
  { name: "Webflow", category: "CMS", patterns: [{ regex: /webflow/i, source: "html", confidence: "high" }, { regex: /assets\.website-files\.com/i, source: "html", confidence: "high" }] },
  { name: "Drupal", category: "CMS", patterns: [{ regex: /Drupal\.settings/i, source: "html", confidence: "high" }, { regex: /sites\/default\/files/i, source: "html", confidence: "high" }] },
  { name: "React", category: "JS Framework", patterns: [{ regex: /__REACT/i, source: "html", confidence: "high" }, { regex: /data-reactroot/i, source: "html", confidence: "high" }, { regex: /react-dom/i, source: "html", confidence: "medium" }] },
  { name: "Next.js", category: "JS Framework", patterns: [{ regex: /__NEXT_DATA__/i, source: "html", confidence: "high" }, { regex: /_next\//i, source: "html", confidence: "high" }] },
  { name: "Vue.js", category: "JS Framework", patterns: [{ regex: /data-v-[a-f0-9]/i, source: "html", confidence: "high" }, { regex: /vue\.min\.js/i, source: "html", confidence: "high" }] },
  { name: "Nuxt", category: "JS Framework", patterns: [{ regex: /__NUXT__/i, source: "html", confidence: "high" }, { regex: /_nuxt\//i, source: "html", confidence: "high" }] },
  { name: "Angular", category: "JS Framework", patterns: [{ regex: /ng-version/i, source: "html", confidence: "high" }, { regex: /ng-app/i, source: "html", confidence: "high" }] },
  { name: "Svelte", category: "JS Framework", patterns: [{ regex: /\bsvelte-[a-z0-9]+\b/i, source: "html", confidence: "medium" }] },
  { name: "Gatsby", category: "JS Framework", patterns: [{ regex: /___gatsby/i, source: "html", confidence: "high" }] },
  { name: "Remix", category: "JS Framework", patterns: [{ regex: /__remix/i, source: "html", confidence: "high" }] },
  { name: "Tailwind CSS", category: "CSS", patterns: [{ regex: /tailwindcss/i, source: "html", confidence: "high" }] },
  { name: "Bootstrap", category: "CSS", patterns: [{ regex: /bootstrap\.min\.css/i, source: "html", confidence: "high" }, { regex: /bootstrap\.min\.js/i, source: "html", confidence: "high" }] },
  { name: "Google Analytics", category: "Analytics", patterns: [{ regex: /gtag\(/i, source: "html", confidence: "high" }, { regex: /google-analytics\.com/i, source: "html", confidence: "high" }, { regex: /G-[A-Z0-9]{4,}/i, source: "html", confidence: "high" }] },
  { name: "Google Tag Manager", category: "Analytics", patterns: [{ regex: /googletagmanager\.com\/gtm/i, source: "html", confidence: "high" }, { regex: /GTM-[A-Z0-9]+/i, source: "html", confidence: "high" }] },
  { name: "Facebook Pixel", category: "Analytics", patterns: [{ regex: /fbq\(/i, source: "html", confidence: "high" }, { regex: /connect\.facebook\.net/i, source: "html", confidence: "high" }] },
  { name: "Hotjar", category: "Analytics", patterns: [{ regex: /static\.hotjar\.com/i, source: "html", confidence: "high" }] },
  { name: "Mixpanel", category: "Analytics", patterns: [{ regex: /cdn\.mxpnl\.com/i, source: "html", confidence: "high" }] },
  { name: "Segment", category: "Analytics", patterns: [{ regex: /cdn\.segment\.com/i, source: "html", confidence: "high" }] },
  { name: "Plausible", category: "Analytics", patterns: [{ regex: /plausible\.io/i, source: "html", confidence: "high" }] },
  { name: "Vercel", category: "Hosting", patterns: [{ regex: /vercel\.app/i, source: "html", confidence: "high" }] },
  { name: "Netlify", category: "Hosting", patterns: [{ regex: /netlify\.app/i, source: "html", confidence: "high" }] },
  { name: "AWS", category: "Hosting", patterns: [{ regex: /amazonaws\.com/i, source: "html", confidence: "high" }] },
  { name: "jQuery", category: "JavaScript Library", patterns: [{ regex: /jquery\.min\.js/i, source: "html", confidence: "high" }] },
  { name: "Stripe", category: "Payment", patterns: [{ regex: /js\.stripe\.com/i, source: "html", confidence: "high" }] },
  { name: "Intercom", category: "Customer Support", patterns: [{ regex: /widget\.intercom\.io/i, source: "html", confidence: "high" }] },
  { name: "Crisp", category: "Customer Support", patterns: [{ regex: /client\.crisp\.chat/i, source: "html", confidence: "high" }] },
  { name: "HubSpot", category: "Marketing", patterns: [{ regex: /js\.hs-scripts\.com/i, source: "html", confidence: "high" }, { regex: /hbspt/i, source: "html", confidence: "high" }] },
  { name: "Sentry", category: "Error Tracking", patterns: [{ regex: /browser\.sentry-cdn\.com/i, source: "html", confidence: "high" }] },
  { name: "reCAPTCHA", category: "Security", patterns: [{ regex: /google\.com\/recaptcha/i, source: "html", confidence: "high" }] },
];

interface HeaderRule { name: string; category: string; header: string; pattern?: RegExp; confidence: "high" | "medium" | "low" }
const HEADER_RULES: HeaderRule[] = [
  { name: "Cloudflare", category: "CDN", header: "cf-ray", confidence: "high" },
  { name: "Vercel", category: "Hosting", header: "x-vercel-id", confidence: "high" },
  { name: "Netlify", category: "Hosting", header: "x-nf-request-id", confidence: "high" },
  { name: "AWS CloudFront", category: "CDN", header: "x-amz-cf-id", confidence: "high" },
  { name: "Shopify", category: "CMS", header: "x-shopify-stage", confidence: "high" },
];

interface Detection { name: string; category: string; confidence: "high" | "medium" | "low"; evidence: string }

function detect(html: string, headers: Headers): Detection[] {
  const dets: Detection[] = [];
  const seen = new Set<string>();
  const rank = { high: 3, medium: 2, low: 1 };

  for (const rule of HTML_RULES) {
    for (const p of rule.patterns) {
      const m = html.match(p.regex);
      if (m) {
        const key = `${rule.name}-${rule.category}`;
        if (!seen.has(key)) { seen.add(key); dets.push({ name: rule.name, category: rule.category, confidence: p.confidence, evidence: `Found "${m[0]}" in HTML` }); }
        else { const ex = dets.find(d => `${d.name}-${d.category}` === key); if (ex && rank[p.confidence] > rank[ex.confidence]) { ex.confidence = p.confidence; ex.evidence = `Found "${m[0]}" in HTML`; } }
        break;
      }
    }
  }

  const server = headers.get("server");
  if (server) {
    if (/nginx/i.test(server)) dets.push({ name: "Nginx", category: "Web Server", confidence: "high", evidence: `server: ${server}` });
    if (/apache/i.test(server)) dets.push({ name: "Apache", category: "Web Server", confidence: "high", evidence: `server: ${server}` });
    if (/cloudflare/i.test(server)) dets.push({ name: "Cloudflare", category: "CDN", confidence: "high", evidence: `server: ${server}` });
  }
  const poweredBy = headers.get("x-powered-by");
  if (poweredBy) {
    if (/express/i.test(poweredBy)) dets.push({ name: "Express.js", category: "JS Framework", confidence: "high", evidence: `x-powered-by: ${poweredBy}` });
    if (/php/i.test(poweredBy)) dets.push({ name: "PHP", category: "Language", confidence: "high", evidence: `x-powered-by: ${poweredBy}` });
  }
  for (const rule of HEADER_RULES) {
    const v = headers.get(rule.header);
    if (v && (!rule.pattern || rule.pattern.test(v))) {
      const key = `${rule.name}-${rule.category}`;
      if (!seen.has(key)) { seen.add(key); dets.push({ name: rule.name, category: rule.category, confidence: rule.confidence, evidence: `Header ${rule.header}: ${v}` }); }
    }
  }

  dets.sort((a, b) => rank[b.confidence] - rank[a.confidence]);
  return dets;
}

function buildSummary(dets: Detection[]) {
  const find = (cat: string) => dets.find(d => d.category === cat && d.confidence === "high")?.name || dets.find(d => d.category === cat)?.name || null;
  return {
    cms: find("CMS"),
    framework: find("JS Framework"),
    analytics: [...new Set(dets.filter(d => d.category === "Analytics").map(d => d.name))],
    hosting: find("Hosting"),
    cdn: find("CDN"),
    web_server: find("Web Server"),
  };
}

export function registerRoutes(app: Hono) {
  app.get("/api/detect", async (c) => {
    await tryRequirePayment(0.005);
    const url = c.req.query("url");
    if (!url) return c.json({ error: "Missing required parameter: url" }, 400);
    let parsedUrl: URL;
    try { parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`); } catch { return c.json({ error: "Invalid URL" }, 400); }
    const startTime = Date.now();
    try {
      const response = await fetch(parsedUrl.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" },
        signal: AbortSignal.timeout(10_000),
        redirect: "follow",
      });
      const html = await response.text();
      const technologies = detect(html, response.headers);
      return c.json({ url: parsedUrl.toString(), technologies, summary: buildSummary(technologies), scan_time_ms: Date.now() - startTime });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Detection failed";
      return c.json({ error: msg.includes("abort") ? "Request timed out (10s)" : msg, url: parsedUrl.toString(), scan_time_ms: Date.now() - startTime }, 500);
    }
  });
}

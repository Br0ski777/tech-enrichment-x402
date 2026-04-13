import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "tech-enrichment",
  slug: "tech-enrichment",
  description: "Detect 50+ technologies on any website. CMS, JS frameworks, analytics, hosting, CDN, payments. Confidence scores and evidence.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/detect",
      price: "$0.005",
      description: "Detect technologies used on a website",
      toolName: "website_detect_tech_stack",
      toolDescription: `Use this when you need to identify what technologies a website uses. Returns structured JSON with categorized detections, confidence levels, and evidence for each technology found.

1. technologies (array) -- each entry has name, category, confidence, evidence
2. categories detected: CMS (WordPress, Shopify, Wix, Webflow), JS Frameworks (React, Next.js, Vue, Angular, Svelte), CSS (Tailwind, Bootstrap), Analytics (Google Analytics, GTM, Facebook Pixel, Hotjar, Mixpanel), Hosting (Vercel, Netlify, AWS, Railway), CDN (Cloudflare), Payments (Stripe, PayPal), Support (Intercom, Crisp, Zendesk)
3. summary.totalDetected (number) -- count of technologies found
4. summary.categories (object) -- count per category

Example output: {"technologies":[{"name":"React","category":"JS Framework","confidence":"high","evidence":"react-dom in bundle"},{"name":"Tailwind CSS","category":"CSS","confidence":"high","evidence":"tailwind classes in HTML"},{"name":"Vercel","category":"Hosting","confidence":"medium","evidence":"x-vercel-id header"}],"summary":{"totalDetected":8,"categories":{"JS Framework":2,"CSS":1,"Hosting":1,"Analytics":3,"Payments":1}}}

Use this BEFORE sales outreach (to personalize pitch by tech stack), competitive analysis, or security audits. Essential for qualifying leads by technology fit and understanding competitor architecture.

Do NOT use for full company data -- use company_enrich_from_domain instead. Do NOT use for SEO analysis -- use seo_audit_page instead. Do NOT use for website content -- use web_scrape_to_markdown instead.`,
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scan (e.g. https://example.com or example.com)" },
        },
        required: ["url"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "URL analyzed"
            },
            "technologies": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "category": {
                    "type": "string"
                  },
                  "confidence": {
                    "type": "number"
                  }
                }
              }
            },
            "summary": {
              "type": "object",
              "description": "Tech stack summary by category"
            },
            "scan_time_ms": {
              "type": "number",
              "description": "Scan duration in ms"
            }
          },
          "required": [
            "url",
            "technologies"
          ]
        },
    },
  ],
};

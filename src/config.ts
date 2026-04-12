import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "tech-enrichment",
  slug: "tech-enrichment",
  description: "Detect 50+ technologies on any website. CMS, frameworks, analytics, hosting, CDN detection.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/detect",
      price: "$0.005",
      description: "Detect technologies used on a website",
      toolName: "website_detect_tech_stack",
      toolDescription: "Use this when you need to identify what technologies a website uses. Scans HTML source and HTTP headers to detect 50+ technologies: CMS (WordPress, Shopify, Wix, Webflow), JS frameworks (React, Next.js, Vue, Angular, Svelte), CSS (Tailwind, Bootstrap), analytics (Google Analytics, GTM, Facebook Pixel, Hotjar, Mixpanel), hosting (Vercel, Netlify, AWS), CDN (Cloudflare), payments (Stripe), support (Intercom, Crisp). Each detection has confidence level and evidence. Ideal for competitive analysis, sales prospecting, lead enrichment, security audits. Do NOT use for SEO analysis — use seo_audit_page instead.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scan (e.g. https://example.com or example.com)" },
        },
        required: ["url"],
      },
    },
  ],
};

# Technology Stack Detection API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://tech-enrichment.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Detect 50+ technologies on any website. CMS, JS frameworks, analytics, hosting, CDN, payments. Confidence scores and evidence. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "tech-enrichment": {
      "url": "https://tech-enrichment.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl "https://tech-enrichment.api.klymax402.com/api/detect?url=https://example.com"
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `website_detect_tech_stack` | GET | `/api/detect` | $0.005 | Detect technologies used on a website |

### `website_detect_tech_stack`

Use this when you need to identify what technologies a website uses. Returns structured JSON with categorized detections, confidence levels, and evidence for each technology found.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes | URL to scan (e.g. https://example.com or example.com) |

Example response:

```json
{"technologies":[{"name":"React","category":"JS Framework","confidence":"high","evidence":"react-dom in bundle"},{"name":"Tailwind CSS","category":"CSS","confidence":"high","evidence":"tailwind classes in HTML"},{"name":"Vercel","category":"Hosting","confidence":"medium","evidence":"x-vercel-id header"}],"summary":{"totalDetected":8,"categories":{"JS Framework":2,"CSS":1,"Hosting":1,"Analytics":3,"Payments":1}}}
```

**When to use**: sales outreach (to personalize pitch by tech stack), competitive analysis, or security audits. Essential for qualifying leads by technology fit and understanding competitor architecture.

**Not for**: full company data (use `company_enrich_from_domain`), SEO analysis (use `seo_audit_page`), website content (use `web_scrape_to_markdown`).

## Example agent prompts

- "Identify what technologies a website uses"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT

# Proxy & VPN Detector — Built with ipgeolocation.io

An open-source tool that checks whether an IP address is a **VPN, proxy, Tor exit node, relay, or known threat** — with a risk score, provider names, and confidence — all powered by the [ipgeolocation.io IP Security API](https://ipgeolocation.io/documentation/ip-security-api.html).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)
[![Powered by ipgeolocation.io](https://img.shields.io/badge/Powered%20by-ipgeolocation.io-1a73e8)](https://ipgeolocation.io)

<!-- Add a screenshot of the tool running locally at ./public/tool.png and reference it here -->

---

## What It Does

Paste an IP address (or let the home page detect yours) and get an instant security verdict:

- **VPN / Proxy / Tor / Relay detection** — with a clear "detected / not detected" verdict
- **Threat score** (0–100) with a low / medium / high risk band
- **Residential proxy, anonymous, known attacker, bot, and spam** signals
- **Cloud / hosting provider** detection with the provider name
- **Provider names, confidence scores, and last-seen dates** for VPN and proxy hits

Two ways to use it:

- **Home page** — automatically checks your own public IP
- **`/check`** — check any IPv4 or IPv6 address

---

## Requires a paid ipgeolocation.io plan

> ⚠️ The [IP Security API](https://ipgeolocation.io/documentation/ip-security-api.html) is a **paid feature**. With a free API key, requests return `401 — IP Security Lookup is not supported on your current subscription`, and the tool shows a clear "paid plan required" state instead of a verdict. To see live results, use a key from a paid plan. [See ipgeolocation.io plans →](https://ipgeolocation.io/pricing)

---

## Why ipgeolocation.io

Detecting VPNs, proxies, and Tor by hand means maintaining constantly-changing IP lists. The [IP Security API](https://ipgeolocation.io/documentation/ip-security-api.html) returns it all in one call:

- **One call, full risk picture** — VPN, proxy, residential proxy, Tor, relay, anonymity, bot, spam, known-attacker, and cloud-provider flags, plus a threat score.
- **Provider intelligence** — VPN/proxy provider names, confidence scores, and last-seen dates when available.
- **Always current** — the security database is maintained server-side; you never ship an update to keep up.
- **SDKs for everything** — official libraries for JavaScript, Python, Java, Go, PHP, Ruby, Rust, Kotlin, Swift, C#, C++, and more.

> This tool uses a single endpoint ([IP Security API](https://ipgeolocation.io/documentation/ip-security-api.html)). ipgeolocation.io also offers dedicated APIs for [IP Geolocation](https://ipgeolocation.io/documentation/ip-location-api.html), [Timezone](https://ipgeolocation.io/documentation/timezone-api.html), [Astronomy](https://ipgeolocation.io/documentation/astronomy-api.html), [User-Agent parsing](https://ipgeolocation.io/documentation/user-agent-api.html), and [Abuse Contact](https://ipgeolocation.io/documentation/ip-abuse-contact-api.html) lookups.

**[Get your API key →](https://ipgeolocation.io/signup)**

---

## Features

- **Automatic detection** on page load — checks your own public IP
- **Check any IP** — dedicated `/check` page for IPv4 and IPv6
- **Server-side API calls only** — your ipgeolocation.io API key is never exposed to the browser
- **Session-scoped caching** — refreshing the page doesn't burn another API call
- **Clear verdict UI** — color-coded risk hero, threat-score meter, and a signal grid
- **Graceful paid-plan messaging** — a helpful state when the key can't access IP Security
- **Responsive design** — works on desktop, tablet, and mobile
- **SEO-ready** — Open Graph tags, meta description, `robots.txt`, `sitemap.xml`, and favicon included

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Icons | [lucide-react](https://lucide.dev/) |
| Security API | [ipgeolocation.io](https://ipgeolocation.io) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [ipgeolocation.io](https://ipgeolocation.io/signup) API key on a **paid plan** (the IP Security API is not on the free tier)

### Run It Locally

1. Clone the repo:

```bash
git clone https://github.com/Abdullah-Afzal178/proxy-vpn-detector.git
cd proxy-vpn-detector
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
IPGEOLOCATION_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IPGEOLOCATION_API_KEY` | Yes | Your [ipgeolocation.io](https://ipgeolocation.io/signup) API key (paid plan for IP Security) |
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL if you choose to deploy (used for sitemap and OG metadata) |

---

## How It Works

1. You open the page (or submit an IP on `/check`).
2. The server resolves the IP — from request headers (`X-Forwarded-For`, etc.) for your own IP, or from the submitted value.
3. The server calls the [ipgeolocation.io IP Security API](https://ipgeolocation.io/documentation/ip-security-api.html) at `GET /v3/security?ip=…`. The API key stays server-side.
4. ipgeolocation.io returns the security object: threat score, VPN/proxy/Tor/relay flags, provider names, confidence, and more.
5. The result is cached in-memory for the session to avoid duplicate API calls on refresh.
6. The client renders the verdict hero, threat-score meter, detection-signal grid, and details.

---

## Project Structure

```
proxy-vpn-detector/
├── app/                  # Next.js App Router pages and layouts
│   ├── check/            # "Check any IP" page
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page — your own IP
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/           # React components (verdict, signals, cards)
├── lib/                  # Server-side API client, types, session cache
│   └── security.ts       # Calls ipgeolocation.io (key stays server-side)
├── public/               # Static assets
├── .env                  # API key (not committed)
└── README.md
```

---

## Want to Deploy It?

Works out of the box on any platform that supports Next.js:

- **Vercel** — import the repo, add `IPGEOLOCATION_API_KEY`, deploy.
- **Netlify**, **Cloudflare Pages**, **Railway** — similar process.
- **Self-hosted** — `npm run build && npm start`.

---

## What Else Can You Build with ipgeolocation.io?

| Tool idea | API to use |
|---|---|
| What is my IP | [IP Geolocation API](https://ipgeolocation.io/documentation/ip-location-api.html) |
| User-agent parser | [User-Agent API](https://ipgeolocation.io/documentation/user-agent-api.html) |
| Timezone converter | [Timezone API](https://ipgeolocation.io/documentation/timezone-api.html) |
| Sunrise & sunset lookup | [Astronomy API](https://ipgeolocation.io/documentation/astronomy-api.html) |
| Abuse contact finder | [Abuse Contact API](https://ipgeolocation.io/documentation/ip-abuse-contact-api.html) |

**[Explore the full API documentation →](https://ipgeolocation.io/documentation.html)**

---

## Built With

- **[ipgeolocation.io](https://ipgeolocation.io)** — the IP Security API that powers this entire tool
- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [lucide-react](https://lucide.dev/) — Icons

---

## License

MIT — see [LICENSE](LICENSE) for details.

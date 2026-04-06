# Privacy Analyzer Dashboard 🛡️

A powerful, entirely client-side zero-knowledge network diagnostic and privacy testing dashboard engineered by Bunorden.

Featuring a beautiful, Apple-styled glassmorphic UI, this tool directly queries public endpoints to expose exactly what your browser and ISP are revealing to the web—without any middle-man server tracking your session.

## 🌟 Key Features

- **Multi-Stack DNS Leak Detection**: Probes over 90 parallel IPv4 and IPv6 public resolvers to trace recursive DNS roots securely, piercing through DoH (DNS-over-HTTPS) masking.
- **Deep Proxy & VPN Fingerprinting**: Detects anonymization layers by correlating WebRTC leaks, IPv6 address inconsistencies, and Timezone routing paths.
- **XHR-driven Speed Testing Engine**: A highly accurate bandwidth benchmark (utilizing `XMLHttpRequest`) that isolates outbound bandwidth directly to Cloudflare Edge endpoints, bypassing visual latency inflation.
- **Zero-Knowledge Architecture**: The repository acts entirely statically. No tracking scripts, no node.js backend, no databases. Telemetry is sourced directly from your browser engine and instantly discarded upon tab closure.

## 📁 Repository Redundancy & Structure

To ensure complete open-source transparency and lookup efficiency, the dashboard is entirely flat-file. There is no obscured compilation process or Webpack bundling to untangle. 

### Core Components
| File | Description |
| ---- | ----------- |
| `index.html` | The primary diagnostic engine. Contains the core logic for the async DNS/WebRTC probes and Speedtest loops within its internal `<script>` tags, paired natively with the glassmorphic CSS architecture. |
| `privacy.html` | The legal document outlining the Zero-Knowledge Privacy framework. |
| `tnu.html` | Terms of Use providing explicit testing coverage disclaimers. |
| `contact.html` | Basic support and inquiry hub interface. |

## 🚀 Setup & Execution

Since the project operates securely without a backend, deployment is universally achievable:
1. Clone the repository: `git clone https://github.com/kkkkja-co/network-checking-dashboard.git`
2. Open `index.html` locally in any modern Chromium-based or WebKit browser.
3. Or deploy to strict static-hosting providers like **Vercel** (our default host), Cloudflare Pages, or GitHub Pages.

## 🛠 Active Technologies
- **Markup**: Pure Semantic HTML5
- **Design Paradigm**: Vanilla CSS3 (`-apple-system` typography, progressive DOM scaling, `@keyframes` flex timing, squircle geometry).
- **Logic Engine**: Native Vanilla JavaScript (leveraging native web APIs exclusively: `AbortController`, `fetch()`, `XMLHttpRequest`, `RTCPeerConnection`).
- **Telemetry Endpoints**: Highly available Edge nodes including [Cloudflare Speed Edge](https://speed.cloudflare.com/) and [IPLeak DNS infrastructure](https://ipleak.net/).

<br>

---
> © 2026 Bunorden. Hosted on Vercel. 100% Open-Source.

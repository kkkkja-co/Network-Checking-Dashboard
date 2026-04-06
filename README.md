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

## 🛠 Core Technologies & APIS
This product natively bypasses traditional backend-heavy frameworks in favor of ultra-efficient JavaScript parsing. Specifically, it employs:

**Design & UI Layer**
- Pure Semantic HTML5 document handling.
- **Apple-Inspired Vanilla CSS3:** Employing geometric squircle borders (`border-radius: 32px`), tracking-perfect topography (`-apple-system`), heavy Glassmorphism layered backdrops, and iOS-like bouncy `@keyframes` (`cubic-bezier` timing mechanisms).

**Logic & Threading Layer**
- Native Vanilla JavaScript interacting directly with standard Web APIs.
- `AbortController`: Enforces strict and immediate cancellation of heavy bandwidth fetch blocks without crashing background memory threads.
- `XMLHttpRequest`: Chosen intentionally over `fetch()` for Upload logic to perfectly isolate outbound pipe saturation and defeat browser DOM-overhead inflation.
- `RTCPeerConnection (WebRTC)`: Natively queried to check structural VPN slippages via STUN relays natively in script logic.

**Telemetry & API Endpoints**
- **Cloudflare Edge (`speed.cloudflare.com`)**: Utilized comprehensively as our load-bearing stresser. It fields our up/down blob packets, captures ultra-low sub-millisecond route timings, and exposes the `http/1 v http/2 v http/3` peering layer logic.
- **IPLeak API (`ipleak.net/json/`)**: Ingests your IP footprint to natively resolve timezone disparities, ASN (Autonomous System Number) identity, and precise macro geographic coordinates.
- **Dynamic DNS Probing Engine**: Runs dozens of parallel asynchronous XHR pings targeting vast global proxy domains to strip off DoH (DNS Over HTTPS) filtering masks and log raw IPv4 & IPv6 caching resolvers universally.

<br>

---
> © 2026 Bunorden. Hosted on Vercel. 100% Open-Source.

# Network Checking Dashboard

A comprehensive, privacy-focused, client-side network analysis tool. This dashboard provides detailed information about your internet connection, performs advanced VPN/Proxy detection, and runs high-performance speed tests without storing your personal data on a backend server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)
![Privacy](https://img.shields.io/badge/privacy-Client--Side-green.svg)

## 🚀 Features

### 🌐 IP & Network Analysis
* **Dual Stack Detection:** Displays both **Public IPv4** and **Public IPv6** addresses.
* **ISP & ASN:** Identifies your Internet Service Provider and Autonomous System Number.
* **Geolocation:** Visualizes your approximate location on an interactive map (Leaflet/OSM).
* **Hostname/PTR:** Performs reverse DNS lookups to find your hostname.

### 🛡️ Privacy & Security Checks
* **Advanced VPN Detection:**
    * **ISP Analysis:** Checks your ISP against a database of known datacenter and VPN providers.
    * **Timezone Heuristics:** Compares your System Timezone (UTC Offset) against your IP Address Timezone to detect location spoofing/mismatches.
* **WebRTC Leak Test:** Scans for local LAN IPs exposed via WebRTC.
* **DNS Leak Test:** Probes multiple times to identify which DNS servers your request is actually routing through.

### ⚡ Performance Tools
* **Multi-Stream Speed Test:**
    * Utilizes **Cloudflare's Edge Network** for testing.
    * Runs **4 concurrent download streams** to saturate bandwidth for accurate results.
    * Measures Latency (Ping), Download, and Upload speeds.
* **Local History:** Saves your last 5 test results locally (via Cookies) for quick comparison.

### 💻 System Info
* **Browser Fingerprinting:** Displays User Agent, Browser Name, Engine, and Operating System details.
* **System Time Analysis:** Shows precise local time, UTC time, and IANA Region codes.

---

## 🔒 Privacy Policy

**We take privacy seriously.**

1.  **Client-Side Execution:** This dashboard runs entirely within your web browser. There is no proprietary backend server collecting your data.
2.  **No Logging:** We do not log IP addresses, location data, or speed test results.
3.  **Local Storage:** History data is stored in a cookie on *your* device only. You can clear this at any time via the dashboard.
4.  **Third-Party APIs:** We rely on public APIs (Cloudflare, ipwho.is, ipify) to fetch network data. These requests are made directly from your browser to the provider.

---

## 🛠️ Installation & Usage

### 🌍 Online Access
You can use the fully functional dashboard directly in your browser at:
👉 **[net.bunorden.com](https://net.bunorden.com)**

### 🏠 Run Locally
Since this is a client-side application using CDNs, no build process is required if you want to host it yourself.

**Method 1: Direct Open**
1.  Clone the repository:
    ```bash
    git clone [https://github.com/kkkkja-co/Network-Checking-Dashboard.git](https://github.com/kkkkja-co/Network-Checking-Dashboard.git)
    ```
2.  Navigate to the folder.
3.  Double-click `index.html` to open it in your default web browser.

**Method 2: Local Server**
If you prefer to run it via a local server (to avoid CORS issues with certain strict browser settings):

```bash
# If you have Python installed
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
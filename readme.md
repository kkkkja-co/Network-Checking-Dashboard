# 🌐 Network Dashboard

A powerful, **single-file** network analysis dashboard that runs entirely in your web browser. It provides real-time insights into your connection, detects VPNs/Proxies with high precision, analyzes network speed, and checks for privacy leaks—all without sending your data to a backend server.

### 🔗 **Live Website:** [net.bunorden.com](https://net.bunorden.com) *(Website Is Hosted on Cloudflare Pages)*

-----

## ✨ Key Features

* **📍 IP & Geolocation:** Instantly detects Public IPv4, IPv6, ISP, ASN, and precise location mapping.
* **🛡️ Advanced VPN Detection:**
    * Identifies over **50+ VPN brands** (Nord, Express, PIA, Proton, etc.).
    * Distinguishes between Commercial VPNs, Corporate Infrastructure, and Residential connections.
    * Analyzes IP Timezone vs. System Timezone consistency.
* **🚀 High-Performance Speed Test:**
    * **Multi-Stream Architecture:** Uses 4 concurrent upload/download streams for network saturation.
    * **Smart Warm-up:** Discards TCP slow-start phase for accurate results.
    * **CORS-Resilient:** Prevents browser freezing if connections are blocked.
    * **Server Trace:** Identifies the exact Cloudflare datacenter handling your traffic.
* **🕵️ Privacy Leak Checks:**
    * **WebRTC Analysis:** Smart detection that distinguishes between safe tunneling and critical real-IP leaks.
    * **DNS Probing:** Detects the number of resolving servers to identify DNS leaks.
* **💻 Device Fingerprinting:** Detailed breakdown of OS, Hardware Concurrency, Browser Engine, and Screen capabilities.
* **📜 Local History:** Saves your test results locally (via Cookies) so you can track performance over time.

-----

## 🔒 Privacy Philosophy

**Zero Backend Storage.**
This dashboard is a **Client-Side Application**.

* We do not own servers that store your data.
* We do not track your behavior using analytics.
* All logic (VPN detection, Speed calculation) runs locally in your browser's JavaScript engine.

*Note: The application connects directly to third-party public APIs (listed below) to fetch data. Your IP address is visible to them during the request, but is not stored by us.*

-----

## 🛠️ Installation & Usage

### Option 1: Clone & Run Locally (Recommended)

Because modern browsers enforce strict CORS policies on `fetch` streams (used for the Speed Test), **opening the file directly via double-click (`file://`) may break the speed test.**

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/kkkkja-co/Network-Checking-Dashboard.git
    cd Network-Checking-Dashboard
    ```

2.  **Run on a local server:**

    **Using Python:**

    ```bash
    python3 -m http.server 8000
    # Then open http://localhost:8000 in your browser
    ```

    **Using VS Code:**

    * Install the "Live Server" extension.
    * Right-click `index.html` -\> **"Open with Live Server"**.

### Option 2: Host Static

You can upload `index.html` to any static host like **Cloudflare Pages**, **GitHub Pages**, **Vercel**, or **Netlify**. No backend configuration is required.

-----

## 🧩 APIs & Data Sources

This dashboard utilizes the following third-party APIs. By using this tool, you are subject to their respective Terms of Service.

| Service | Purpose |
| :--- | :--- |
| **Cloudflare** | Speed Test Engine, Latency Check, Server Tracing |
| **ipwho.is** | IP Geolocation, ISP, and ASN Data |
| **ipify** | IPv6 Connectivity Check |
| **ip-api** | DNS Leak Probing |
| **OpenStreetMap** | Map Visualizations (via Leaflet.js) |

-----

## ⚙️ Configuration

You can customize the detection logic by editing the constants in the `<script>` section of `index.html`:

* **`KNOWN_VPN_ASNS`**: Add or remove Autonomous System Numbers to flag as hosting/VPN providers.
* **`VPN_BRAND_MAP`**: Customize the regex detection for specific VPN brands or organization names.

<!-- end list -->

```javascript
// Example: Adding a custom detection rule
const VPN_BRAND_MAP = [
    { keys: ['my-custom-vpn'], label: 'Detected (My Custom VPN)' },
    // ... existing rules
];
```

-----

## 🤝 Contributing

Contributions are welcome\! If you find a VPN provider that isn't detected or want to improve the speed test algorithm:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

-----

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

-----

## ⚠️ Disclaimer

This tool is provided "as is" without warranty of any kind. Speed test results are estimates based on browser performance and may differ from native application tests. The developer is not responsible for any data usage charges incurred while running speed tests.
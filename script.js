// --- 0. UI LOGIC ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.innerText = new Date().getFullYear();

// --- NEW: TIMEZONE MODAL LOGIC ---
function showTzModal() {
    const m = document.getElementById('tz-modal');
    if (!m) return;
    const content = m.querySelector('div'); // inner container

    // Calculate Data
    const d = new Date();
    const sysRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const utcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`;

    // Populate
    const modalUtc = document.getElementById('modal-utc');
    const modalRegion = document.getElementById('modal-region');
    const modalLocal = document.getElementById('modal-local');
    const modalGlobal = document.getElementById('modal-global');

    if (modalUtc) modalUtc.innerText = utcStr;
    if (modalRegion) modalRegion.innerText = sysRegion;
    if (modalLocal) modalLocal.innerText = d.toString();
    if (modalGlobal) modalGlobal.innerText = d.toUTCString();

    // --- FILTER & DISPLAY REGIONS WITH SAME OFFSET ---
    const listEl = document.getElementById('modal-all-regions');
    const listTitle = document.getElementById('modal-regions-title');
    if (listEl) {
        listEl.innerHTML = '';

        if (typeof Intl.supportedValuesOf !== 'undefined') {
            try {
                // Helper to get consistent offset string (e.g. "GMT+09:00")
                const getOffsetStr = (z) => {
                    try {
                        return new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' })
                            .formatToParts(d)
                            .find(p => p.type === 'timeZoneName').value;
                    } catch (e) { return ''; }
                };

                const targetOffsetStr = getOffsetStr(sysRegion);
                const allTz = Intl.supportedValuesOf('timeZone');

                // Filter
                const matching = allTz.filter(tz => getOffsetStr(tz) === targetOffsetStr);

                // Update Title
                if (listTitle) listTitle.innerText = `Regions matching ${utcStr} (${matching.length})`;

                const frag = document.createDocumentFragment();
                matching.forEach(tz => {
                    const li = document.createElement('li');
                    li.textContent = tz;
                    // Highlight the current one
                    if (tz === sysRegion) {
                        li.className = "font-bold text-blue-600 bg-blue-50 px-1 rounded -ml-1";
                    }
                    frag.appendChild(li);
                });
                listEl.appendChild(frag);
            } catch (e) {
                listEl.innerHTML = '<li>Error calculating offsets.</li>';
                console.error(e);
            }
        } else {
            listEl.innerHTML = '<li>Not supported in this browser.</li>';
        }
    }

    // Animate
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closeTz() {
    const m = document.getElementById('tz-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => {
        m.classList.add('hidden');
    }, 300);
}

// --- NEW: USER AGENT MODAL LOGIC (Renamed to OS Modal) ---
function showOsModal() {
    const m = document.getElementById('os-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closeOsModal() {
    const m = document.getElementById('os-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => {
        m.classList.add('hidden');
    }, 300);
}

// --- NEW: BROWSER MODAL LOGIC ---
function showBrowserModal() {
    const m = document.getElementById('browser-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closeBrowserModal() {
    const m = document.getElementById('browser-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => {
        m.classList.add('hidden');
    }, 300);
}

// --- NEW: VPN MODAL LOGIC ---
function showVpnModal() {
    const m = document.getElementById('vpn-modal');
    if (!m) return;
    const content = m.querySelector('div');

    // Populate the raw string immediately before showing the modal
    const info = getCombinedInfo();
    const rawStringEl = document.getElementById('vpn-raw-string-bottom');
    if (rawStringEl) rawStringEl.innerText = info.combinedName; // Target the MOVED element

    // Clear and populate the detailed reasons list
    const reasonsListEl = document.getElementById('detection-details-reasons');
    if (reasonsListEl) {
        reasonsListEl.innerHTML = '';

        // Use the globally stored reasons (set by detectVPN)
        const reasons = window.vpnDetectionReasons || [];

        reasons.forEach(reason => {
            const div = document.createElement('div');
            div.className = 'text-sm text-gray-500 bg-gray-50 p-2 rounded';
            div.textContent = reason;
            reasonsListEl.appendChild(div);
        });

        if (reasons.length === 0) {
            const div = document.createElement('div');
            div.className = 'text-sm text-emerald-600 bg-emerald-50 p-2 rounded';
            div.textContent = 'No specific VPN or proxy fingerprints detected in provider details.';
            reasonsListEl.appendChild(div);
        }
    }


    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closeVpnModal() {
    const m = document.getElementById('vpn-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => {
        m.classList.add('hidden');
    }, 300);
}

// --- NEW: REPORT MIS-DETECTION LOGIC ---
function reportMisdetection() {
    const ip = (document.getElementById('ipv4-display') ? document.getElementById('ipv4-display').innerText : 'N/A') || 'N/A';
    const status = (document.getElementById('vpn-status') ? document.getElementById('vpn-status').innerText : 'N/A') || 'N/A';
    const provider = (document.getElementById('vpn-provider-name') ? document.getElementById('vpn-provider-name').innerText : 'N/A') || 'N/A';
    const asn = (document.getElementById('asn-display') ? document.getElementById('asn-display').innerText : 'N/A') || 'N/A';
    // Use the element that holds the raw string in the modal
    const rawString = (document.getElementById('vpn-raw-string-bottom') ? document.getElementById('vpn-raw-string-bottom').innerText : 'N/A') || 'N/A';

    const subject = `VPN Detection Issue Report - ${ip}`;
    const body = `
        I believe the VPN detection result is incorrect (False Positive or False Negative).

        --- Detected Information ---
        Public IP: ${ip}
        Detected Status: ${status}
        Detected Provider: ${provider}
        ASN: ${asn}
        Raw String: ${rawString}

        --- Developer Note ---
        (This data is collected to improve detection logic and will be deleted within 3 days.)

        --- My Details (Please fill out) ---
        I am/am not using a VPN or Proxy:
        My actual ISP (if known):
        What should the status be:

        --- Description of Issue ---

        `;

    const mailtoLink = `mailto:contact@bunorden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    window.open(mailtoLink, '_blank');
}

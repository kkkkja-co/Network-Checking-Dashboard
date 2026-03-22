// --- 0. UI LOGIC ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.innerText = new Date().getFullYear();

// --- NEW: TIMEZONE MODAL LOGIC ---
function showTzModal() {
    const m = document.getElementById('tz-modal');
    if (!m) return;
    const content = m.querySelector('div');

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

    const listEl = document.getElementById('modal-all-regions');
    const listTitle = document.getElementById('modal-regions-title');
    if (listEl) {
        listEl.innerHTML = '';
        if (typeof Intl.supportedValuesOf !== 'undefined') {
            try {
                const getOffsetStr = (z) => {
                    try {
                        return new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' })
                            .formatToParts(d)
                            .find(p => p.type === 'timeZoneName').value;
                    } catch (e) { return ''; }
                };
                const targetOffsetStr = getOffsetStr(sysRegion);
                const allTz = Intl.supportedValuesOf('timeZone');
                const matching = allTz.filter(tz => getOffsetStr(tz) === targetOffsetStr);
                if (listTitle) listTitle.innerText = `Regions matching ${utcStr} (${matching.length})`;
                const frag = document.createDocumentFragment();
                matching.forEach(tz => {
                    const li = document.createElement('li');
                    li.textContent = tz;
                    if (tz === sysRegion) {
                        li.className = "font-bold text-blue-600 bg-blue-50 px-1 rounded -ml-1";
                    }
                    frag.appendChild(li);
                });
                listEl.appendChild(frag);
            } catch (e) {
                listEl.innerHTML = '<li>Error calculating offsets.</li>';
            }
        } else {
            listEl.innerHTML = '<li>Not supported in this browser.</li>';
        }
    }

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
    setTimeout(() => m.classList.add('hidden'), 300);
}

// --- MODAL LOGIC (OS, Browser, VPN, Speed) ---
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
    setTimeout(() => m.classList.add('hidden'), 300);
}

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
    setTimeout(() => m.classList.add('hidden'), 300);
}

function showVpnModal() {
    const m = document.getElementById('vpn-modal');
    if (!m) return;
    const content = m.querySelector('div');

    const info = getCombinedInfo();
    const rawStringEl = document.getElementById('vpn-raw-string-bottom');
    if (rawStringEl) rawStringEl.innerText = info.combinedName;

    const reasonsListEl = document.getElementById('detection-details-reasons');
    if (reasonsListEl) {
        reasonsListEl.innerHTML = '';
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
    setTimeout(() => m.classList.add('hidden'), 300);
}

function showSpeedModal() {
    const m = document.getElementById('speed-modal');
    if (!m) return;
    const content = m.querySelector('div');

    if (lastSpeedData) {
        const dlEl = document.getElementById('modal-dl');
        const ulEl = document.getElementById('modal-ul');
        const pingEl = document.getElementById('modal-ping');
        const jitterEl = document.getElementById('modal-jitter');
        const gradeEl = document.getElementById('net-grade');
        const plossEl = document.getElementById('modal-ploss');

        if (dlEl) dlEl.innerText = lastSpeedData.dl;
        if (ulEl) ulEl.innerText = lastSpeedData.ul;
        if (pingEl) pingEl.innerText = lastSpeedData.ping + " ms";
        if (jitterEl) jitterEl.innerText = lastSpeedData.jitter + " ms";
        if (plossEl) plossEl.innerText = lastSpeedData.ploss;

        const dlVal = parseFloat(lastSpeedData.dl);
        const pingVal = parseInt(lastSpeedData.ping);
        let grade = "F", color = "text-red-500";
        if (dlVal > 500 && pingVal < 20) { grade = "A+"; color = "text-emerald-500"; }
        else if (dlVal > 100 && pingVal < 50) { grade = "A"; color = "text-emerald-500"; }
        else if (dlVal > 50 && pingVal < 100) { grade = "B"; color = "text-blue-500"; }
        else if (dlVal > 10 && pingVal < 150) { grade = "C"; color = "text-orange-500"; }
        else if (dlVal > 1) { grade = "D"; color = "text-orange-600"; }

        if (gradeEl) {
            gradeEl.innerText = grade;
            gradeEl.className = `text-3xl font-black ${color}`;
        }

        const b4k = document.getElementById('badge-4k');
        const b1080 = document.getElementById('badge-1080p');
        const b720 = document.getElementById('badge-720p');
        if (b4k) b4k.className = (dlVal > 25) ? "px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold" : "opacity-30 px-2 py-1 bg-slate-200 text-slate-500 rounded text-[10px] font-bold";
        if (b1080) b1080.className = (dlVal > 5) ? "px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold" : "opacity-30 px-2 py-1 bg-slate-200 text-slate-500 rounded text-[10px] font-bold";
        if (b720) b720.className = (dlVal > 2) ? "px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold" : "opacity-30 px-2 py-1 bg-slate-200 text-slate-500 rounded text-[10px] font-bold";
    }

    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}
function closeSpeedModal() {
    const m = document.getElementById('speed-modal');
    if (!m) return;
    const content = m.querySelector('div');
    m.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => m.classList.add('hidden'), 300);
}

function reportMisdetection() {
    const ip = (document.getElementById('ipv4-display')?.innerText || 'N/A');
    const status = (document.getElementById('vpn-status')?.innerText || 'N/A');
    const provider = (document.getElementById('vpn-provider-name')?.innerText || 'N/A');
    const asn = (document.getElementById('asn-display')?.innerText || 'N/A');
    const rawString = (document.getElementById('vpn-raw-string-bottom')?.innerText || 'N/A');

    const subject = `VPN Detection Issue Report - ${ip}`;
    const body = `I believe the VPN detection result is incorrect.\n\n--- Detected Info ---\nIP: ${ip}\nStatus: ${status}\nProvider: ${provider}\nASN: ${asn}\nRaw: ${rawString}\n\n--- My Details ---`;
    window.open(`mailto:contact@bunorden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

// --- 1. COOKIE & HISTORY LOGIC ---
function setCookie(n, v, d) { let e = ""; if (d) { const dt = new Date(); dt.setTime(dt.getTime() + (d * 24 * 60 * 60 * 1000)); e = "; expires=" + dt.toUTCString(); } document.cookie = n + "=" + (v || "") + e + "; path=/"; }
function getCookie(n) { const ne = n + "="; const ca = document.cookie.split(';'); for (let i = 0; i < ca.length; i++) { let c = ca[i]; while (c.charAt(0) == ' ') c = c.substring(1, c.length); if (c.indexOf(ne) == 0) return c.substring(ne.length, c.length); } return null; }

function showConsentModal() { const m = document.getElementById('cookie-modal'); if (m) { m.classList.remove('hidden'); setTimeout(() => m.classList.remove('opacity-0'), 50); } }
function hideConsentModal() { const m = document.getElementById('cookie-modal'); if (m) { m.classList.add('opacity-0'); setTimeout(() => m.classList.add('hidden'), 300); } }
function handleConsent(a) { const v = a ? 'accepted' : 'declined'; setCookie('speedtest_consent', v, 365); hideConsentModal(); if (!a) setCookie('speedtest_history', "", -1); updateConsentStatus(v); renderHistory(); }
function disableHistory() { setCookie('speedtest_consent', 'declined', 365); setCookie('speedtest_history', "", -1); updateConsentStatus('declined'); renderHistory(); }

function updateConsentStatus(s) {
    const l = document.getElementById('consent-status');
    const be = document.getElementById('btn-enable-history'), bd = document.getElementById('btn-disable-history'), bc = document.getElementById('btn-clear-history');
    if (!l) return;
    if (s === 'accepted') { l.innerText = "Active"; l.className = "px-2 py-1.5 rounded bg-emerald-100 text-emerald-600 font-bold"; be?.classList.add('hidden'); bd?.classList.remove('hidden'); bc?.classList.remove('hidden'); }
    else { l.innerText = "Disabled"; l.className = "px-2 py-1.5 rounded bg-gray-100 text-gray-500 font-bold"; be?.classList.remove('hidden'); bd?.classList.add('hidden'); bc?.classList.add('hidden'); }
}

function updateHistoryLimit() {
    const val = document.getElementById('history-limit-select')?.value;
    if (val) { setCookie('history_limit_val', val, 365); trimHistory(parseInt(val)); }
}
function trimHistory(limit) {
    let h = getCookie('speedtest_history');
    try { h = h ? JSON.parse(h) : []; } catch (e) { h = []; }
    if (h.length > limit) { h = h.slice(0, limit); setCookie('speedtest_history', JSON.stringify(h), 30); renderHistory(); }
}

function renderHistory() {
    const tb = document.getElementById('history-table-body');
    if (!tb) return;
    const c = getCookie('speedtest_consent');
    if (c !== 'accepted') { tb.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400 italic">History disabled. <button onclick="showConsentModal()" class="text-blue-500 underline">Enable</button></td></tr>`; return; }
    let h = getCookie('speedtest_history');
    try { h = h ? JSON.parse(h) : []; } catch (e) { h = []; }
    if (h.length === 0) { tb.innerHTML = `<tr><td colspan="7" class="px-4 py-4 text-center text-gray-400 italic">No history found.</td></tr>`; return; }
    let ht = '';
    h.forEach(i => {
        ht += `<tr class="hover:bg-gray-50">
            <td class="px-4 py-2 font-mono text-gray-500 text-xs">${i.date}</td>
            <td class="px-4 py-2 font-mono text-xs text-slate-600">${i.ip || '-'}</td>
            <td class="px-4 py-2 text-xs truncate max-w-[120px]">${i.isp || '-'}</td>
            <td class="px-4 py-2 text-xs"><b>${i.provider || 'CF'}</b><br><span class="text-[10px] text-gray-400">${i.server || '-'}</span></td>
            <td class="px-4 py-2 font-bold">${i.ping}</td>
            <td class="px-4 py-2 font-bold text-blue-600">${i.dl}</td>
            <td class="px-4 py-2 font-bold text-purple-600">${i.ul}</td>
        </tr>`;
    });
    tb.innerHTML = ht;
}
function clearHistory() { setCookie('speedtest_history', "", -1); renderHistory(); }

// --- 2. SPEEDTEST ENGINE ---
let lastSpeedData = null;
let speedTestAbortController = null;
function updateGauge(v, l, u = false) {
    const gv = document.getElementById('gauge-value'), gl = document.getElementById('gauge-label'), gf = document.getElementById('speed-gauge');
    if (gv) gv.innerText = v; if (gl) gl.innerText = l;
    if (gf) {
        gf.style.stroke = u ? "#9333ea" : "#10b981";
        let p = (v / 100) * 100; if (p > 100) p = 100; gf.style.strokeDasharray = `${p}, 100`;
    }
}
function stopSpeedTest() {
    speedTestAbortController?.abort();
    const st = document.getElementById('test-state');
    if (st) { st.innerText = "Stopped"; st.className = "text-xs font-bold text-red-500"; }
}

async function runHighPerformanceTest() {
    const btnS = document.getElementById('btn-card-speed'), btnT = document.getElementById('btn-stop-speed');
    btnS?.classList.add('hidden'); btnT?.classList.remove('hidden');
    speedTestAbortController = new AbortController();
    const signal = speedTestAbortController.signal;
    const status = document.getElementById('test-state'), bar = document.getElementById('speed-progress');
    const dlEl = document.getElementById('dl-final'), ulEl = document.getElementById('ul-final'), pgEl = document.getElementById('ping-value');

    const calculateSpeed = (cb, sb, ct, st) => { const td = (ct - st) / 1000; return td <= 0 ? 0 : (((cb - sb) * 8) / td / 1024 / 1024).toFixed(1); };

    try {
        if (status) status.innerText = "Latency...";
        const pings = [];
        for (let i = 0; i < 10; i++) {
            const s = performance.now();
            await fetch('https://speed.cloudflare.com/cdn-cgi/trace?r=' + Math.random(), { signal });
            pings.push(performance.now() - s);
        }
        pings.sort((a, b) => a - b);
        const avgP = pings.reduce((a, b) => a + b, 0) / pings.length;
        if (pgEl) pgEl.innerText = Math.round(avgP) + " ms";

        if (status) status.innerText = "Downloading...";
        const dlStartTime = performance.now(); let dlBytes = 0;
        const dlPromises = Array(6).fill(0).map(async () => {
            while (performance.now() - dlStartTime < 15000) {
                const r = await fetch("https://speed.cloudflare.com/__down?bytes=50000000&r=" + Math.random(), { signal });
                const reader = r.body.getReader();
                while (true) { const { done, value } = await reader.read(); if (done) break; dlBytes += value.length; if (performance.now() - dlStartTime > 15000) { reader.cancel(); return; } }
            }
        });
        const dlTimer = setInterval(() => {
            const now = performance.now(); const el = now - dlStartTime;
            if (el > 4000) updateGauge(calculateSpeed(dlBytes, 0, now, dlStartTime), "Mbps (Down)");
            if (bar) bar.style.width = Math.min((el / 15000) * 50, 50) + "%";
        }, 100);
        await Promise.all(dlPromises); clearInterval(dlTimer);

        if (status) status.innerText = "Uploading...";
        const ulStartTime = performance.now(); let ulBytes = 0; const blob = new Blob([new Uint8Array(2 * 1024 * 1024)]);
        const ulPromises = Array(4).fill(0).map(async () => {
            while (performance.now() - ulStartTime < 12000) {
                await fetch("https://speed.cloudflare.com/__up", { method: "POST", body: blob, signal });
                ulBytes += blob.size;
            }
        });
        const ulTimer = setInterval(() => {
            const now = performance.now(); const el = now - ulStartTime;
            if (el > 4000) updateGauge(calculateSpeed(ulBytes, 0, now, ulStartTime), "Mbps (Up)", true);
            if (bar) bar.style.width = 50 + Math.min((el / 12000) * 50, 50) + "%";
        }, 100);
        await Promise.all(ulPromises); clearInterval(ulTimer);

        lastSpeedData = { dl: calculateSpeed(dlBytes, 0, performance.now(), dlStartTime), ul: calculateSpeed(ulBytes, 0, performance.now(), ulStartTime), ping: Math.round(avgP), jitter: "0", ploss: "0%" };
        if (dlEl) dlEl.innerText = lastSpeedData.dl + " Mbps";
        if (ulEl) ulEl.innerText = lastSpeedData.ul + " Mbps";
        if (status) { status.innerText = "Complete"; status.className = "text-xs font-bold text-emerald-600"; }
        saveResult(lastSpeedData.ping + " ms", lastSpeedData.dl, lastSpeedData.ul, "Cloudflare", "Cloudflare");
    } catch (e) {
        if (status) { status.innerText = "Error"; status.className = "text-xs font-bold text-red-500"; }
    } finally { btnS?.classList.remove('hidden'); btnT?.classList.add('hidden'); }
}

// --- 3. VPN & SYSTEM UTILS ---
const KNOWN_VPN_ASNS = new Set([209854, 216025, 39351, 209103, 62371, 199218, 57169, 136787, 147049, 141039, 207137, 211366, 137409, 47583, 397223, 60341, 13335, 54113]);
function detectVPN(isp, org, asn) {
    const vpnEl = document.getElementById('vpn-status');
    const badgeEl = document.getElementById('vpn-risk-badge');
    const providerEl = document.getElementById('vpn-provider-name');
    window.vpnDetectionReasons = [];
    const asnNum = parseInt(asn);
    let score = 0;
    if (KNOWN_VPN_ASNS.has(asnNum)) { score = 100; window.vpnDetectionReasons.push(`Flagged ASN: ${asnNum}`); }
    const combined = `${isp} ${org}`.toLowerCase();
    if (combined.includes("vpn") || combined.includes("proxy")) { score = 100; window.vpnDetectionReasons.push("VPN/Proxy keyword found."); }

    if (vpnEl) {
        if (score >= 50) {
            vpnEl.innerText = "VPN Detected"; vpnEl.className = "text-lg font-bold mt-1 text-red-600";
            if (badgeEl) { badgeEl.innerText = "High Anonymity"; badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"; }
            if (providerEl) providerEl.innerText = isp;
        } else {
            vpnEl.innerText = "Not Detected"; vpnEl.className = "text-lg font-bold mt-1 text-slate-800";
            if (badgeEl) { badgeEl.innerText = "Low Anonymity"; badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"; }
            if (providerEl) providerEl.innerText = "Residential/None";
        }
    }
}

function getCombinedInfo() {
    return { combinedName: `${document.getElementById('isp-display')?.innerText} ${document.getElementById('org-display')?.innerText} ${document.getElementById('asn-display')?.innerText}`.toLowerCase() };
}

// --- 4. DATA FETCHERS ---
function updateTimestamp() {
    const n = new Date(); const f = (x) => String(x).padStart(2, '0');
    const offset = -n.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = v => String(Math.floor(Math.abs(v))).padStart(2, '0');
    const utcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
    const timeStr = `${f(n.getDate())}/${f(n.getMonth() + 1)}/${n.getFullYear()} , ${f(n.getHours())}:${f(n.getMinutes())}:${f(n.getSeconds())} ${utcStr}`;

    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) lastUpdateEl.innerText = timeStr;
}
setInterval(updateTimestamp, 1000); updateTimestamp();

async function fetchIPv4Data() {
    const ipEl = document.getElementById('ipv4-display');
    const locEl = document.getElementById('ipv4-loc');
    const ispEl = document.getElementById('isp-display');
    const asnEl = document.getElementById('asn-display');
    const orgEl = document.getElementById('org-display');
    
    try {
        // Try primary API
        const r = await fetch('https://ipwho.is/', { timeout: 5000 });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        
        if (d.success) {
            if (ipEl) ipEl.innerText = d.ip;
            if (locEl) locEl.innerText = `${d.city}, ${d.country_code}`;
            if (ispEl) ispEl.innerText = d.connection.isp;
            if (asnEl) asnEl.innerText = d.connection.asn;
            if (orgEl) orgEl.innerText = d.connection.org;
            detectVPN(d.connection.isp, d.connection.org, d.connection.asn);
            if (typeof initMap === 'function') initMap(d.latitude, d.longitude);
            return;
        }
    } catch (primaryError) {
        console.warn('ipwho.is failed:', primaryError);
        
        // Try fallback API
        try {
            const fallbackR = await fetch('https://ip-api.com/json/', { timeout: 5000 });
            if (!fallbackR.ok) throw new Error(`HTTP ${fallbackR.status}`);
            const fallbackD = await fallbackR.json();
            
            if (fallbackD.status === 'success') {
                if (ipEl) ipEl.innerText = fallbackD.query;
                if (locEl) locEl.innerText = `${fallbackD.city}, ${fallbackD.countryCode}`;
                if (ispEl) ispEl.innerText = fallbackD.isp || fallbackD.org || 'Unknown';
                if (asnEl) asnEl.innerText = fallbackD.as || 'Unknown';
                if (orgEl) orgEl.innerText = fallbackD.org || 'Unknown';
                detectVPN(fallbackD.isp || '', fallbackD.org || '', fallbackD.as || '');
                if (typeof initMap === 'function') initMap(fallbackD.lat, fallbackD.lon);
                console.log('Using ip-api.com as fallback');
                return;
            }
        } catch (fallbackError) {
            console.error('All IP APIs failed:', fallbackError);
        }
    }
    
    // Show error state if both APIs fail
    if (ipEl) ipEl.innerText = 'Unavailable';
    if (ispEl) ispEl.innerText = 'API Error - Retrying...';
    if (locEl) locEl.innerText = 'Connection failed';
    
    // Retry after 3 seconds
    setTimeout(fetchIPv4Data, 3000);
}

async function detectSystem() {
    const u = navigator.userAgent;
    const rawEl = document.getElementById('modal-ua-raw');
    if (rawEl) rawEl.innerText = u;
    const tzEl = document.getElementById('sys-tz');
    if (tzEl) {
        const d = new Date(); const offset = -d.getTimezoneOffset(); const sign = offset >= 0 ? '+' : '-';
        const utc = `UTC${sign}${String(Math.floor(Math.abs(offset / 60))).padStart(2, '0')}:${String(Math.abs(offset % 60)).padStart(2, '0')}`;
        tzEl.innerHTML = `Sys Timezone: <span class="font-bold text-slate-600">${utc}</span> <i class="fas fa-info-circle text-[10px] ml-1"></i>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const c = getCookie('speedtest_consent');
    if (!c) showConsentModal(); else updateConsentStatus(c);
    fetchIPv4Data(); detectSystem(); renderHistory();
});

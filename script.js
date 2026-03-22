// === 0. UI LOGIC ===
const yearEl = document.getElementById('year');
if (yearEl) yearEl.innerText = new Date().getFullYear();

// --- Scroll-to-Top Button ---
const scrollBtn = document.getElementById('scroll-top');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });
}

// --- Connection Pill ---
function updateConnectionPill() {
    const pill = document.getElementById('connection-pill');
    if (!pill) return;
    if (navigator.onLine) {
        pill.className = 'connection-pill';
        pill.innerHTML = '<span class="pulse-dot"></span> Online';
    } else {
        pill.className = 'connection-pill offline';
        pill.innerHTML = '<span class="pulse-dot"></span> Offline';
    }
}
window.addEventListener('online', updateConnectionPill);
window.addEventListener('offline', updateConnectionPill);
updateConnectionPill();

// --- MODAL HELPERS ---
function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    const c = m.querySelector('.modal-panel');
    m.classList.remove('hidden');
    setTimeout(() => { m.style.opacity = '1'; if (c) c.style.transform = 'scale(1)'; }, 10);
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    const c = m.querySelector('.modal-panel');
    m.style.opacity = '0';
    if (c) c.style.transform = 'scale(0.95)';
    setTimeout(() => m.classList.add('hidden'), 300);
}

// Timezone Modal
function showTzModal() {
    const d = new Date();
    const sysRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const utcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`;

    const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
    el('modal-utc', utcStr); el('modal-region', sysRegion); el('modal-local', d.toString()); el('modal-global', d.toUTCString());

    const listEl = document.getElementById('modal-all-regions');
    const listTitle = document.getElementById('modal-regions-title');
    if (listEl) {
        listEl.innerHTML = '';
        if (typeof Intl.supportedValuesOf !== 'undefined') {
            try {
                const getOffsetStr = z => { try { return new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' }).formatToParts(d).find(p => p.type === 'timeZoneName').value; } catch (e) { return ''; } };
                const targetOffsetStr = getOffsetStr(sysRegion);
                const allTz = Intl.supportedValuesOf('timeZone');
                const matching = allTz.filter(tz => getOffsetStr(tz) === targetOffsetStr);
                if (listTitle) listTitle.innerText = `Regions matching ${utcStr} (${matching.length})`;
                const frag = document.createDocumentFragment();
                matching.forEach(tz => { const li = document.createElement('li'); li.textContent = tz; if (tz === sysRegion) li.style.cssText = 'font-weight:700;color:var(--accent-blue);background:var(--glow-blue);padding:0.1rem 0.3rem;border-radius:4px;margin-left:-0.3rem'; frag.appendChild(li); });
                listEl.appendChild(frag);
            } catch (e) { listEl.innerHTML = '<li>Error calculating offsets.</li>'; }
        } else { listEl.innerHTML = '<li>Not supported in this browser.</li>'; }
    }
    openModal('tz-modal');
}
function closeTz() { closeModal('tz-modal'); }

function showOsModal() { openModal('os-modal'); }
function closeOsModal() { closeModal('os-modal'); }
function showBrowserModal() { openModal('browser-modal'); }
function closeBrowserModal() { closeModal('browser-modal'); }
function closeSpeedModal() { closeModal('speed-modal'); }

// VPN Modal
function showVpnModal() {
    const info = getCombinedInfo();
    const rawEl = document.getElementById('vpn-raw-string-bottom');
    if (rawEl) rawEl.innerText = info.combinedName;
    const reasonsEl = document.getElementById('detection-details-reasons');
    if (reasonsEl) {
        reasonsEl.innerHTML = '<div class="modal-section-title">Detection Reasons Summary</div>';
        const reasons = window.vpnDetectionReasons || [];
        reasons.forEach(r => { const div = document.createElement('div'); div.style.cssText = 'font-size:0.75rem;color:var(--text-muted);background:rgba(255,255,255,0.03);border:1px solid var(--bg-card-border);padding:0.5rem;border-radius:6px;margin-top:0.4rem'; div.textContent = r; reasonsEl.appendChild(div); });
        if (reasons.length === 0) { const div = document.createElement('div'); div.style.cssText = 'font-size:0.75rem;color:var(--accent-emerald);background:var(--glow-emerald);padding:0.5rem;border-radius:6px;margin-top:0.4rem'; div.textContent = 'No specific VPN or proxy fingerprints detected in provider details.'; reasonsEl.appendChild(div); }
    }
    openModal('vpn-modal');
}
function closeVpnModal() { closeModal('vpn-modal'); }

// Speed Modal
let lastSpeedData = null;
function showSpeedModal() {
    if (lastSpeedData) {
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
        el('modal-dl', lastSpeedData.dl); el('modal-ul', lastSpeedData.ul); el('modal-ping', lastSpeedData.ping + " ms"); el('modal-jitter', lastSpeedData.jitter + " ms"); el('modal-ploss', lastSpeedData.ploss);
        const dlVal = parseFloat(lastSpeedData.dl), pingVal = parseInt(lastSpeedData.ping);
        let grade = "F", color = "var(--accent-red)";
        if (dlVal > 500 && pingVal < 20) { grade = "A+"; color = "var(--accent-emerald)"; }
        else if (dlVal > 100 && pingVal < 50) { grade = "A"; color = "var(--accent-emerald)"; }
        else if (dlVal > 50 && pingVal < 100) { grade = "B"; color = "var(--accent-blue)"; }
        else if (dlVal > 10 && pingVal < 150) { grade = "C"; color = "var(--accent-orange)"; }
        else if (dlVal > 1) { grade = "D"; color = "var(--accent-orange)"; }
        const gradeEl = document.getElementById('net-grade');
        if (gradeEl) { gradeEl.innerText = grade; gradeEl.style.color = color; }
        const setBadge = (id, active, ac, ic) => { const e = document.getElementById(id); if (e) e.className = active ? 'stream-badge active' : 'stream-badge inactive'; };
        setBadge('badge-4k', dlVal > 25); setBadge('badge-1080p', dlVal > 5); setBadge('badge-720p', dlVal > 2);
    }
    openModal('speed-modal');
}

function reportMisdetection() {
    const g = id => document.getElementById(id)?.innerText || 'N/A';
    const subject = `VPN Detection Issue Report - ${g('ipv4-display')}`;
    const body = `I believe the VPN detection result is incorrect.\n\n--- Detected Info ---\nIP: ${g('ipv4-display')}\nStatus: ${g('vpn-status')}\nProvider: ${g('vpn-provider-name')}\nASN: ${g('asn-display')}\nRaw: ${g('vpn-raw-string-bottom')}\n\n--- My Details ---`;
    window.open(`mailto:contact@bunorden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

// === 1. COOKIE & HISTORY LOGIC ===
function setCookie(n, v, d) { let e = ""; if (d) { const dt = new Date(); dt.setTime(dt.getTime() + (d * 864e5)); e = "; expires=" + dt.toUTCString(); } document.cookie = n + "=" + (v || "") + e + "; path=/"; }
function getCookie(n) { const ne = n + "="; const ca = document.cookie.split(';'); for (let i = 0; i < ca.length; i++) { let c = ca[i].trim(); if (c.indexOf(ne) === 0) return c.substring(ne.length); } return null; }

function showConsentModal() { openModal('cookie-modal'); }
function hideConsentModal() { closeModal('cookie-modal'); }
function handleConsent(a) { setCookie('speedtest_consent', a ? 'accepted' : 'declined', 365); hideConsentModal(); if (!a) setCookie('speedtest_history', "", -1); updateConsentStatus(a ? 'accepted' : 'declined'); renderHistory(); }
function disableHistory() { setCookie('speedtest_consent', 'declined', 365); setCookie('speedtest_history', "", -1); updateConsentStatus('declined'); renderHistory(); }

function updateConsentStatus(s) {
    const l = document.getElementById('consent-status'), be = document.getElementById('btn-enable-history'), bd = document.getElementById('btn-disable-history'), bc = document.getElementById('btn-clear-history');
    if (!l) return;
    if (s === 'accepted') { l.innerText = "Active"; l.className = "consent-badge active"; be?.classList.add('hidden'); bd?.classList.remove('hidden'); bc?.classList.remove('hidden'); }
    else { l.innerText = "Disabled"; l.className = "consent-badge disabled"; be?.classList.remove('hidden'); bd?.classList.add('hidden'); bc?.classList.add('hidden'); }
}

function getHistoryLimit() { const el = document.getElementById('history-limit-select'); if (el) return parseInt(el.value); const c = getCookie('history_limit_val'); return c ? parseInt(c) : 50; }
function updateHistoryLimit() { const v = document.getElementById('history-limit-select')?.value; if (v) { setCookie('history_limit_val', v, 365); trimHistory(parseInt(v)); } }
function trimHistory(limit) { let h = getCookie('speedtest_history'); try { h = h ? JSON.parse(h) : []; } catch (e) { h = []; } if (h.length > limit) { h = h.slice(0, limit); setCookie('speedtest_history', JSON.stringify(h), 30); renderHistory(); } }

function saveResult(p, d, u, s, prov) {
    if (getCookie('speedtest_consent') !== 'accepted') return;
    let h = getCookie('speedtest_history'); try { h = h ? JSON.parse(h) : []; } catch (e) { h = []; }
    const ip = document.getElementById('ipv4-display')?.innerText || '--';
    const isp = document.getElementById('isp-display')?.innerText || '--';
    const dt = new Date(); const f = x => String(x).padStart(2, '0');
    const offset = -dt.getTimezoneOffset(); const sign = offset >= 0 ? '+' : '-';
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const utcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
    const fullDate = `${f(dt.getHours())}:${f(dt.getMinutes())} ${f(dt.getDate())}/${f(dt.getMonth() + 1)}/${dt.getFullYear()} (${utcStr})`;
    h.unshift({ date: fullDate, ping: p, dl: d, ul: u, ip, isp, server: s || 'Unknown', provider: prov || 'Unknown' });
    const limit = getHistoryLimit(); while (h.length > limit) h.pop();
    setCookie('speedtest_history', JSON.stringify(h), 30); renderHistory();
}

function renderHistory() {
    const tb = document.getElementById('history-table-body'); if (!tb) return;
    const c = getCookie('speedtest_consent');
    if (c !== 'accepted') { tb.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:var(--text-muted);font-style:italic">History disabled. <button onclick="showConsentModal()" style="color:var(--accent-blue);text-decoration:underline;background:none;border:none;cursor:pointer;font-family:inherit">Enable</button></td></tr>`; return; }
    let h = getCookie('speedtest_history'); try { h = h ? JSON.parse(h) : []; } catch (e) { h = []; }
    if (h.length === 0) { tb.innerHTML = `<tr><td colspan="7" style="padding:1rem;text-align:center;color:var(--text-muted);font-style:italic">No history found.</td></tr>`; return; }
    let ht = '';
    h.forEach(i => { const prov = i.provider || 'Cloudflare'; ht += `<tr><td style="font-family:'Inter',monospace;font-size:0.7rem;color:var(--text-muted)">${i.date}</td><td style="font-family:'Inter',monospace;font-size:0.7rem">${i.ip || '-'}</td><td style="font-size:0.7rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.isp || ''}">${i.isp || '-'}</td><td style="font-size:0.7rem"><strong style="color:var(--text-primary)">${prov}</strong><br><span style="font-size:0.6rem;color:var(--text-muted);font-family:'Inter',monospace">${i.server || '-'}</span></td><td style="font-weight:700">${i.ping}</td><td style="font-weight:700;color:var(--accent-blue)">${i.dl}</td><td style="font-weight:700;color:var(--accent-purple)">${i.ul}</td></tr>`; });
    tb.innerHTML = ht;
}
function clearHistory() { setCookie('speedtest_history', "", -1); renderHistory(); }

// === 2. SPEEDTEST ENGINE ===
let speedTestAbortController = null;
let animationEnabled = true;
function updateGauge(v, l, u = false) {
    const gv = document.getElementById('gauge-value'), gl = document.getElementById('gauge-label'), gf = document.getElementById('speed-gauge');
    if (gv) gv.innerText = v; if (gl) gl.innerText = l;
    if (gf) {
        gf.style.stroke = u ? "var(--accent-purple)" : "var(--accent-emerald)";
        // Scale: 0–1000 Mbps mapped to 0–100% of gauge arc
        let p = (parseFloat(v) / 1000) * 100;
        if (p > 100) p = 100;
        if (p < 0) p = 0;
        gf.style.strokeDasharray = `${p}, 100`;
    }
}

function stopSpeedTest() {
    if (speedTestAbortController) { speedTestAbortController.abort(); speedTestAbortController = null; }
    const st = document.getElementById('test-state'); if (st) { st.innerText = "Stopped"; st.style.color = "var(--accent-red)"; }
    document.getElementById('speed-gauge')?.classList.remove('gauge-pulse');
    document.getElementById('gauge-container')?.classList.remove('active-anim');
}

async function runHighPerformanceTest() {
    const btnS = document.getElementById('btn-card-speed'), btnT = document.getElementById('btn-stop-speed');
    btnS?.classList.add('hidden'); btnT?.classList.remove('hidden');
    speedTestAbortController = new AbortController(); const signal = speedTestAbortController.signal;
    const status = document.getElementById('test-state'), bar = document.getElementById('speed-progress');
    const dlEl = document.getElementById('dl-final'), ulEl = document.getElementById('ul-final'), pgEl = document.getElementById('ping-value');
    const serverLoc = document.getElementById('server-location'), gaugeFill = document.getElementById('speed-gauge');
    const icon = document.getElementById('speed-status-icon');

    if (dlEl) dlEl.innerText = "-- Mbps";
    if (ulEl) ulEl.innerText = "-- Mbps";
    if (bar) bar.style.width = "0%";
    updateGauge(0, "Ready");
    if (animationEnabled) { if (icon) icon.style.color = 'var(--accent-emerald)'; gaugeFill?.classList.add('gauge-pulse'); }

    // bytes transferred → Mbps over a given ms window
    const toMbps = (bytes, ms) => ms <= 0 ? 0 : ((bytes * 8) / ms / 1000).toFixed(1);
    let fP = "--", fD = "--", fU = "--", jitterVal = "0", detectedServer = "Unknown";
    const detectedProvider = "Cloudflare";

    try {
        // ── LATENCY ──────────────────────────────────────────────────────────
        if (status) status.innerText = "Measuring Latency...";
        const pings = [];
        for (let i = 0; i < 20; i++) {
            if (signal.aborted) throw new Error('Aborted');
            try {
                const s = performance.now();
                await fetch('https://speed.cloudflare.com/cdn-cgi/trace?_=' + Math.random(), { signal, cache: 'no-store' });
                pings.push(performance.now() - s);
            } catch (e) { if (signal.aborted) throw e; }
        }
        if (pings.length > 0) {
            pings.sort((a, b) => a - b);
            const trim = Math.max(1, Math.floor(pings.length * 0.2));
            const trimmed = pings.slice(trim, pings.length - trim);
            const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
            const variance = trimmed.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / trimmed.length;
            jitterVal = Math.sqrt(variance).toFixed(1);
            fP = Math.round(avg);
            if (pgEl) pgEl.innerText = fP + " ms";
        }

        // ── SERVER ───────────────────────────────────────────────────────────
        if (status) status.innerText = "Finding nearest server...";
        try {
            const r = await fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', { signal, timeout: 5000 });
            const t = await r.text();
            const loc = t.match(/loc=(.+)/)?.[1]?.trim() || "UNK";
            const colo = t.match(/colo=(.+)/)?.[1]?.trim() || "UNK";
            detectedServer = `${colo} (${loc})`;
            if (serverLoc) serverLoc.innerHTML = `${colo} <span style="color:var(--text-muted);font-weight:400">(${loc})</span>`;
        } catch (e) {
            try {
                const r = await fetchWithTimeout('https://speed.cloudflare.com/cdn-cgi/trace', { signal, timeout: 5000 });
                const t = await r.text();
                const loc = t.match(/loc=(.+)/)?.[1]?.trim() || "UNK";
                const colo = t.match(/colo=(.+)/)?.[1]?.trim() || "UNK";
                detectedServer = `${colo} (${loc})`;
                if (serverLoc) serverLoc.innerHTML = `${colo} <span style="color:var(--text-muted);font-weight:400">(${loc})</span>`;
            } catch (e2) {
                detectedServer = "UNK (UNK)";
                if (serverLoc) serverLoc.innerHTML = "UNK (UNK)";
            }
        }

        // ── DOWNLOAD: 8 streams, 100 MB chunks, 2 s warm-up ─────────────────
        if (status) status.innerText = "Downloading (Warm-up)...";
        const DL_STREAMS = 8, DL_CHUNK = 100_000_000, DL_DUR = 15_000, DL_WARMUP = 2_000;
        let dlBytes = 0, dlStart = performance.now();
        let dlBaseBytes = 0, dlBaseTime = 0, dlWarmDone = false;

        const dlWorker = async () => {
            while (performance.now() - dlStart < DL_DUR) {
                if (signal.aborted) return;
                try {
                    const res = await fetch(
                        `https://speed.cloudflare.com/__down?bytes=${DL_CHUNK}&_=${Math.random()}`,
                        { signal, cache: 'no-store' }
                    );
                    const reader = res.body.getReader();
                    while (true) {
                        if (performance.now() - dlStart >= DL_DUR) { reader.cancel(); return; }
                        const { done, value } = await reader.read();
                        if (done) break;
                        dlBytes += value.length;
                    }
                } catch (e) { if (signal.aborted) return; }
            }
        };

        const dlWorkers = Array.from({ length: DL_STREAMS }, dlWorker);
        const dlTimer = setInterval(() => {
            if (signal.aborted) { clearInterval(dlTimer); return; }
            const now = performance.now(), elapsed = now - dlStart;
            if (!dlWarmDone && elapsed >= DL_WARMUP) {
                dlWarmDone = true; dlBaseBytes = dlBytes; dlBaseTime = now;
                if (status) status.innerText = "Downloading (Measuring)...";
            }
            if (elapsed > 300) {
                const sp = dlWarmDone ? toMbps(dlBytes - dlBaseBytes, now - dlBaseTime) : toMbps(dlBytes, elapsed);
                updateGauge(sp, "Mbps (Down)");
                if (bar) bar.style.width = Math.min((elapsed / DL_DUR) * 50, 50) + "%";
            }
        }, 80);

        await Promise.all(dlWorkers); clearInterval(dlTimer);
        if (signal.aborted) throw new Error('Aborted');
        fD = toMbps(dlBytes - dlBaseBytes, performance.now() - dlBaseTime) + " Mbps";
        if (dlEl) dlEl.innerText = fD;

        // ── UPLOAD: 8 streams, ReadableStream so bytes count in-flight ────────
        if (status) status.innerText = "Uploading (Warm-up)...";
        updateGauge(0, "Mbps (Up)", true);
        const UL_STREAMS = 8, UL_CHUNK = 4 * 1024 * 1024, UL_DUR = 12_000, UL_WARMUP = 2_000;
        let ulBytes = 0, ulStart = performance.now();
        let ulBaseBytes = 0, ulBaseTime = 0, ulWarmDone = false;
        const chunkBuf = new Uint8Array(UL_CHUNK);

        const ulWorker = async () => {
            while (performance.now() - ulStart < UL_DUR) {
                if (signal.aborted) return;
                try {
                    let sent = false;
                    const stream = new ReadableStream({
                        pull(ctrl) {
                            if (sent || signal.aborted || performance.now() - ulStart >= UL_DUR) {
                                ctrl.close(); return;
                            }
                            ulBytes += UL_CHUNK;   // count bytes as they leave
                            sent = true;
                            ctrl.enqueue(chunkBuf);
                            ctrl.close();
                        }
                    });
                    await fetch("https://speed.cloudflare.com/__up", {
                        method: "POST", body: stream, signal, duplex: "half"
                    });
                } catch (e) { if (signal.aborted) return; }
            }
        };

        const ulWorkers = Array.from({ length: UL_STREAMS }, ulWorker);
        const ulTimer = setInterval(() => {
            if (signal.aborted) { clearInterval(ulTimer); return; }
            const now = performance.now(), elapsed = now - ulStart;
            if (!ulWarmDone && elapsed >= UL_WARMUP) {
                ulWarmDone = true; ulBaseBytes = ulBytes; ulBaseTime = now;
                if (status) status.innerText = "Uploading (Measuring)...";
            }
            if (elapsed > 300) {
                const sp = ulWarmDone ? toMbps(ulBytes - ulBaseBytes, now - ulBaseTime) : toMbps(ulBytes, elapsed);
                updateGauge(sp, "Mbps (Up)", true);
                if (bar) bar.style.width = 50 + Math.min((elapsed / UL_DUR) * 50, 50) + "%";
            }
        }, 80);

        await Promise.all(ulWorkers); clearInterval(ulTimer);
        if (signal.aborted) throw new Error('Aborted');
        if (ulBytes > 0) {
            fU = toMbps(ulBytes - ulBaseBytes, performance.now() - ulBaseTime) + " Mbps";
            if (ulEl) ulEl.innerText = fU;
        } else {
            fU = "Blocked"; if (ulEl) ulEl.innerText = "Blocked";
        }

        // ── DONE ─────────────────────────────────────────────────────────────
        if (status) { status.innerText = "Complete ✓"; status.style.color = "var(--accent-emerald)"; }
        if (bar) bar.style.width = "100%";
        if (icon) icon.style.color = 'var(--accent-emerald)';
        gaugeFill?.classList.remove('gauge-pulse');
        lastSpeedData = { dl: fD, ul: fU, ping: fP, jitter: jitterVal, ploss: "0% (Estimated)" };
        saveResult(fP + " ms", fD, fU, detectedServer, detectedProvider);

    } catch (e) {
        if (e.message === 'Aborted' || e.name === 'AbortError') {
            if (status) { status.innerText = "Stopped"; status.style.color = "var(--accent-orange)"; }
        } else {
            console.error(e);
            if (status) { status.innerText = "Error"; status.style.color = "var(--accent-red)"; }
        }
        if (icon) icon.style.color = 'var(--text-muted)';
        gaugeFill?.classList.remove('gauge-pulse');
    } finally {
        btnS?.classList.remove('hidden');
        btnT?.classList.add('hidden');
    }
}

async function refreshServerLocation() {
    const locEl = document.getElementById('server-location'), icon = document.getElementById('server-refresh-icon');
    if (icon) icon.classList.add('fa-spin'); if (locEl) { locEl.innerHTML = "Locating..."; locEl.style.color = 'var(--text-muted)'; }
    try {
        const endpoints = ['https://www.cloudflare.com/cdn-cgi/trace', 'https://speed.cloudflare.com/cdn-cgi/trace'];
        let success = false;
        for (const url of endpoints) {
            try {
                const r = await fetchWithTimeout(url + '?r=' + Math.random(), { timeout: 4000 });
                const t = await r.text();
                const loc = t.match(/loc=(.+)/)?.[1]?.trim() || "UNK";
                const colo = t.match(/colo=(.+)/)?.[1]?.trim() || "UNK";
                if (locEl) { locEl.innerHTML = `${colo} <span style="color:var(--text-muted);font-weight:400">(${loc})</span>`; locEl.style.color = 'var(--text-primary)'; }
                success = true; break;
            } catch (e) {}
        }
        if (!success && locEl) { locEl.innerText = "Error (Blocked)"; locEl.style.color = 'var(--accent-red)'; }
    } catch (e) { if (locEl) { locEl.innerText = "Error"; locEl.style.color = 'var(--accent-red)'; } }
    finally { if (icon) icon.classList.remove('fa-spin'); }
}

function getCombinedInfo() { return { combinedName: `${document.getElementById('isp-display')?.innerText || ''} ${document.getElementById('org-display')?.innerText || ''} ${document.getElementById('asn-display')?.innerText || ''}`.toLowerCase() }; }
window.vpnDetectionReasons = [];

// === 3. VPN DETECTION ===
function detectVPN(ipTz, ipUtc, isp, countryCode, org, asn) {
    const vpnEl = document.getElementById('vpn-status'), detailEl = document.getElementById('vpn-details');
    const badgeEl = document.getElementById('vpn-risk-badge'), fraudEl = document.getElementById('vpn-fraud-score'), providerEl = document.getElementById('vpn-provider-name');
    window.vpnDetectionReasons = [];
    const d = new Date(), offset = -d.getTimezoneOffset(), sign = offset >= 0 ? '+' : '-';
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const sysUtcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`, ipUtcStr = `UTC${ipUtc}`;
    let score = 0; const reasons = window.vpnDetectionReasons;
    const asnNum = parseInt(asn), combinedName = (isp + " " + org + " " + asn).toLowerCase();
    const rawIsp = isp || 'N/A', rawOrg = org || 'N/A', rawAsn = asn || 'N/A';
    const setIcon = (id, cls) => { const e = document.getElementById(id); if (e) e.className = cls; };
    const setDesc = (id, txt) => { const e = document.getElementById(id); if (e) e.innerText = txt; };

    // 1. Brand Map
    let matchedBrand = null, isHighConf = false;
    for (const brand of VPN_BRAND_MAP) {
        if (brand.keys.some(k => combinedName.includes(k))) {
            matchedBrand = brand.label; score += 50; isHighConf = true;
            reasons.push(`High Confidence Match: ${brand.label}. (ISP: ${rawIsp}, ASN: ${rawAsn})`);
            setIcon('icon-isp', 'fas fa-exclamation-triangle' + ' text-red-500'); setDesc('desc-isp', `Infra Matched: ${brand.keys[0]}`);
            document.getElementById('icon-isp').style.color = 'var(--accent-red)'; break;
        }
    }
    let ispFlagged = isHighConf;

    // 2. ASN
    if (!isNaN(asnNum) && KNOWN_VPN_ASNS.has(asnNum)) {
        if (!isHighConf) {
            if (LOW_CONFIDENCE_ASNS.has(asnNum)) { score += 20; reasons.push(`Low Confidence: Cloud/Hosting ASN (${rawAsn}).`); setDesc('desc-isp', `Cloud/Hosting ASN: ${asnNum}`); const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-exclamation-circle'; ic.style.color = 'var(--accent-orange)'; } }
            else { score += 50; ispFlagged = true; reasons.push(`High Confidence: Dedicated VPN ASN (${rawAsn}).`); setDesc('desc-isp', `Flagged Dedicated ASN: ${asnNum}`); const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-exclamation-triangle'; ic.style.color = 'var(--accent-red)'; } }
        }
    } else if (!ispFlagged) { if (asnNum === 13335) { const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-check-circle'; ic.style.color = 'var(--accent-emerald)'; } setDesc('desc-isp', "Standard CDN/Relay (Cloudflare)"); } }

    // 3. String Match
    if (!ispFlagged && VPN_REGEX.test(combinedName)) { score += 20; const match = combinedName.match(VPN_REGEX)[0]; matchedBrand = match.charAt(0).toUpperCase() + match.slice(1) + ' Detected'; reasons.push(`Low Confidence: keyword "${match}" in ISP/Org.`); const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-exclamation-circle'; ic.style.color = 'var(--accent-orange)'; } setDesc('desc-isp', `Matched: ${match}`); }

    // 4. Generic
    if (score === 0) { if (GENERIC_REGEX.test(combinedName)) { score += 20; reasons.push(`Low Confidence: hosting/datacenter keywords in name.`); const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-exclamation-circle'; ic.style.color = 'var(--accent-orange)'; } setDesc('desc-isp', "Generic Hosting Keyword"); } else { const ic = document.getElementById('icon-isp'); if (ic) { ic.className = 'fas fa-check-circle'; ic.style.color = 'var(--accent-emerald)'; } setDesc('desc-isp', "Residential/Standard ISP"); } }

    // 5. Timezone
    if (ipUtcStr !== sysUtcStr) { score += 20; reasons.push("Timezone Mismatch."); const ic = document.getElementById('icon-tz'); if (ic) { ic.className = 'fas fa-exclamation-circle'; ic.style.color = 'var(--accent-orange)'; } setDesc('desc-tz', `IP: ${ipUtcStr} vs Sys: ${sysUtcStr}`); }
    else { const ic = document.getElementById('icon-tz'); if (ic) { ic.className = 'fas fa-check-circle'; ic.style.color = 'var(--accent-emerald)'; } setDesc('desc-tz', "Matched"); }

    // 6. Language
    const ic6 = document.getElementById('icon-lang'); if (ic6) { ic6.className = 'fas fa-info-circle'; ic6.style.color = 'var(--accent-blue)'; }
    setDesc('desc-lang', `Browser: ${navigator.language || "en"}, IP: ${countryCode}`);

    // 7. Tor
    const torKW = ['tor exit','tor project','onion','ielo liazo','100up','online.net','stiftung erneuerbare freiheit','linode','dotsrc','quxlabs','flokinet','1337 services'];
    let isTorMatch = false; if (matchedBrand) isTorMatch = torKW.some(k => matchedBrand.toLowerCase().includes(k));
    if (isTorMatch) { const ic = document.getElementById('icon-tor'); if (matchedBrand?.includes("Tor Exit Node")) { reasons.push("CONFIRMED TOR."); setDesc('desc-tor', "Confirmed Tor Exit Node"); if (ic) { ic.className = 'fas fa-exclamation-triangle'; ic.style.color = 'var(--accent-red)'; } } else { reasons.push("TOR INFRASTRUCTURE."); setDesc('desc-tor', "Maybe (Infra Match)"); if (ic) { ic.className = 'fas fa-exclamation-circle'; ic.style.color = 'var(--accent-orange)'; } } }
    else if (/tor exit|tor project|onion/i.test(combinedName)) { reasons.push("CONFIRMED TOR keywords."); const ic = document.getElementById('icon-tor'); if (ic) { ic.className = 'fas fa-exclamation-triangle'; ic.style.color = 'var(--accent-red)'; } setDesc('desc-tor', "Tor Node Confirmed"); }
    else { const ic = document.getElementById('icon-tor'); if (ic) { ic.className = 'fas fa-check-circle'; ic.style.color = 'var(--accent-emerald)'; } setDesc('desc-tor', "No Tor fingerprints found"); }

    // SCORING
    if (score >= 50) {
        const finalName = matchedBrand || "Detected (Unknown)"; let cardStatus = "VPN Detected";
        if (isTorMatch) { cardStatus = finalName.includes("Tor Exit Node") ? "Tor Confirmed" : "Tor Network May Detected"; if (fraudEl) { fraudEl.innerText = "Medium Risk (Tor)"; fraudEl.style.color = 'var(--accent-orange)'; } if (badgeEl) { badgeEl.innerText = "High Anonymity (Tor)"; badgeEl.style.cssText = 'background:rgba(251,146,60,0.1);color:var(--accent-orange);padding:0.3rem 0.7rem;border-radius:9999px;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em'; } }
        else { if (badgeEl) { badgeEl.innerText = "High Anonymity"; badgeEl.style.cssText = 'background:rgba(248,113,113,0.1);color:var(--accent-red);padding:0.3rem 0.7rem;border-radius:9999px;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em'; } if (fraudEl) { fraudEl.innerText = "High Risk (Flagged)"; fraudEl.style.color = 'var(--accent-red)'; } }
        if (vpnEl) { vpnEl.innerText = cardStatus; vpnEl.style.color = 'var(--accent-red)'; vpnEl.style.fontSize = '1.1rem'; }
        if (detailEl) detailEl.innerHTML = "";
        if (providerEl) { providerEl.innerText = finalName; providerEl.style.color = 'var(--accent-red)'; }
    } else if (score > 0) {
        if (vpnEl) { vpnEl.innerText = "Likely Detected"; vpnEl.style.color = 'var(--accent-orange)'; }
        if (detailEl) detailEl.innerHTML = "";
        if (providerEl) { providerEl.innerText = "Generic / Datacenter"; providerEl.style.color = 'var(--accent-orange)'; }
        if (badgeEl) { badgeEl.innerText = "Moderate Anonymity"; badgeEl.style.cssText = 'background:rgba(251,146,60,0.1);color:var(--accent-orange);padding:0.3rem 0.7rem;border-radius:9999px;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em'; }
        if (fraudEl) { fraudEl.innerText = "Medium Risk"; fraudEl.style.color = 'var(--accent-orange)'; }
    } else {
        if (vpnEl) { vpnEl.innerText = "Not Detected"; vpnEl.style.color = 'var(--text-primary)'; }
        if (detailEl) detailEl.innerHTML = 'Direct Connection';
        if (providerEl) { providerEl.innerText = "Residential / None"; providerEl.style.color = 'var(--accent-emerald)'; }
        if (badgeEl) { badgeEl.innerText = "Low Anonymity"; badgeEl.style.cssText = 'background:rgba(52,211,153,0.1);color:var(--accent-emerald);padding:0.3rem 0.7rem;border-radius:9999px;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em'; }
        if (fraudEl) { fraudEl.innerText = "Low Risk (Clean)"; fraudEl.style.color = 'var(--accent-emerald)'; }
    }
}

// === 4. DATA FETCHERS ===
function updateTimestamp() {
    const n = new Date(), f = x => String(x).padStart(2, '0');
    const offset = -n.getTimezoneOffset(), sign = offset >= 0 ? '+' : '-';
    const pad = v => String(Math.floor(Math.abs(v))).padStart(2, '0');
    const utcStr = `UTC${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
    const el = document.getElementById('last-update');
    if (el) el.innerText = `${f(n.getDate())}/${f(n.getMonth() + 1)}/${n.getFullYear()} , ${f(n.getHours())}:${f(n.getMinutes())}:${f(n.getSeconds())} ${utcStr}`;
}
setInterval(updateTimestamp, 1000); updateTimestamp();

/**
 * Helper to fetch with a timeout using AbortController for better compatibility.
 */
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

/**
 * JSONP Helper for APIs that block standard fetch/CORS (like ip-api.com on VPNs).
 */
function fetchJSONP(url, callbackName = 'callback') {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const uniqueCallback = `jsonp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        window[uniqueCallback] = (data) => {
            document.body.removeChild(script);
            delete window[uniqueCallback];
            resolve(data);
        };
        script.src = `${url}${url.includes('?') ? '&' : '?'}${callbackName}=${uniqueCallback}`;
        script.onerror = () => {
            document.body.removeChild(script);
            delete window[uniqueCallback];
            reject(new Error('JSONP failed'));
        };
        document.body.appendChild(script);
        setTimeout(() => { if (window[uniqueCallback]) reject(new Error('JSONP timeout')); }, 8000);
    });
}

const COUNTRY_COORDS = {
    'US':[37.0902,-95.7129],'GB':[55.3781,-3.4360],'CA':[56.1304,-106.3468],'AU':[-25.2744,133.7751],'DE':[51.1657,10.4515],
    'FR':[46.2276,2.2137],'CN':[35.8617,104.1954],'IN':[20.5937,78.9629],'JP':[36.2048,138.2529],'SG':[1.3521,103.8198],
    'HK':[22.3193,114.1694],'TW':[23.6978,120.9605],'KR':[35.9078,127.7669],'NL':[52.1326,5.2913],'RU':[61.5240,105.3188],
    'BR':[-14.2350,-51.9253],'IT':[41.8719,12.5674],'ES':[40.4637,-3.7492],'CH':[46.8182,8.2275],'SE':[60.1282,18.6435],
    'NO':[60.4720,8.4689],'FI':[61.9241,25.7482],'DK':[56.2639,9.5018],'BE':[50.5039,4.4699],'AT':[47.5162,14.5501],
    'PL':[51.9194,19.1451],'MY':[4.2105,101.9758],'TH':[15.8700,100.9925],'VN':[14.0583,108.2772],'ID':[-0.7893,113.9213],
    'PH':[12.8797,121.7740],'TR':[38.9637,34.9248],'SA':[23.8859,45.0792],'AE':[23.4241,53.8478],'IL':[31.0461,34.8516],
    'ZA':[-30.5595,22.9375],'MX':[23.6345,-102.5528],'AR':[-38.4161,-63.6167],'CL':[-35.6751,-71.5430],'CO':[4.5709,-74.2973]
};

/* === NUCLEAR ADBLOCK BYPASS TOOLS === */
const COLO_MAP = {
    'ICN': 'KR', 'SEL': 'KR', 'BJJ': 'KR', 'GMP': 'KR',
    'NRT': 'JP', 'HND': 'JP', 'KIX': 'JP', 'NGO': 'JP', 'FUK': 'JP', 'CTS': 'JP', 'OKA': 'JP',
    'HKG': 'HK', 'TPE': 'TW', 'SIN': 'SG', 'BKK': 'TH', 'MNL': 'PH', 'KUL': 'MY', 'JKT': 'ID',
    'SJC': 'US', 'LAX': 'US', 'JFK': 'US', 'ORD': 'US', 'DFW': 'US', 'EWR': 'US', 'ATL': 'US', 'SEA': 'US', 'MIA': 'US', 'IAD': 'US', 'DEN': 'US', 'PHX': 'US',
    'LHR': 'GB', 'LGW': 'GB', 'STN': 'GB', 'MAN': 'GB', 'EDI': 'GB', 'CDG': 'FR', 'ORY': 'FR', 'MRS': 'FR', 'LYS': 'FR',
    'FRA': 'DE', 'MUC': 'DE', 'TXL': 'DE', 'BER': 'DE', 'HAM': 'DE', 'DUS': 'DE', 'AMS': 'NL', 'BRU': 'BE', 'ZRH': 'CH', 'GVA': 'CH', 'MAD': 'ES', 'BCN': 'ES',
    'MXP': 'IT', 'FCO': 'IT', 'LIN': 'IT', 'YYZ': 'CA', 'YVR': 'CA', 'YUL': 'CA', 'SYD': 'AU', 'MEL': 'AU', 'BNE': 'AU', 'PER': 'AU', 'AKL': 'NZ'
};

async function fetchIPviaDOH() {
    try {
        const r = await fetch('https://cloudflare-dns.com/dns-query?name=whoami.akamai.net&type=A', {
            headers: { 'Accept': 'application/dns-json' }
        });
        const d = await r.json();
        return d.Answer?.[0]?.data || null;
    } catch (e) { return null; }
}

/**
 * RDAP (Registration Data Access Protocol) - Core Internet Registry Access.
 * Highly resilient against adblockers as it's a technical registry service.
 */
async function fetchRDAP(ip) {
    if (!ip) return null;
    const rdaps = [`https://rdap.arin.net/bootstrap/ip/${ip}`, `https://rdap.db.ripe.net/ip/${ip}`, `https://rdap.apnic.net/ip/${ip}`];
    for (const url of rdaps) {
        try {
            const r = await fetchWithTimeout(url, { timeout: 4000 });
            if (!r.ok) continue;
            const d = await r.json();
            let org = d.name || d.handle || 'Unknown';
            if (d.entities) {
                const reg = d.entities.find(e => e.roles?.includes('registrant') || e.roles?.includes('administrative'));
                if (reg && reg.vcardArray) {
                    const fn = reg.vcardArray[1].find(p => p[0] === 'fn');
                    if (fn) org = fn[3];
                }
            }
            return { org, isp: org };
        } catch (e) {}
    }
    return null;
}

/** 
 * Same-Origin Fallback: The ultimate "Gold Standard" fix. 
 * Works if a Cloudflare Worker is deployed on /api/geo.
 */
async function fetchSameOriginGeo() {
    try {
        const r = await fetchWithTimeout('/api/geo', { timeout: 2500 });
        if (r.ok) return await r.json();
    } catch (e) {}
    return null;
}

let dnsCountryFrequency = new Map();
let dnsIsps = new Set();
let dnsOrgs = new Set();

/**
 * JSONP Helper for APIs that block standard fetch/CORS (like ip-api.com on VPNs).
 */
function fetchJSONP(url, callbackName = 'callback') {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const uniqueCallback = `jsonp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        window[uniqueCallback] = (data) => {
            document.body.removeChild(script);
            delete window[uniqueCallback];
            resolve(data);
        };
        script.src = `${url}${url.includes('?') ? '&' : '?'}${callbackName}=${uniqueCallback}`;
        script.onerror = () => {
            document.body.removeChild(script);
            delete window[uniqueCallback];
            reject(new Error('JSONP failed'));
        };
        document.body.appendChild(script);
        setTimeout(() => { if (window[uniqueCallback]) reject(new Error('JSONP timeout')); }, 8000);
    });
}

let map;
function initMap(lat, lng, zoom = 13) {
    if (map) { map.setView([lat, lng], zoom); return; }
    map = L.map('map', { zoomControl: false }).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup("<b>Detected Location</b>").openPopup();
    const el = document.getElementById('map-coords');
    if (el) el.innerText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

async function getIPFromWebRTC() { return new Promise(resolve => { const pc = new RTCPeerConnection({ iceServers: [] }); pc.createDataChannel(''); pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {}); pc.onicecandidate = e => { if (!e?.candidate) return; const m = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate); if (m) { pc.close(); resolve(m[1]); } }; setTimeout(() => { pc.close(); resolve(null); }, 1000); }); }

async function fetchIPv4Data() {
    const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
    const setLoader = (msg = 'Detecting...') => { el('ipv4-display', msg); el('ipv4-loc', 'Locating...'); };
    setLoader();

    let ip = null, city = '', region = '', countryCode = '', lat = null, lng = null, colo = '';
    let isp = 'Unknown', org = 'Unknown', asn = '--', as_org = 'Unknown', tzId = '', tzUtc = '+0:00';

    // ── STEP 1: IP Detection (Ghost Waterfall 2.0 — Nuclear Resilience) ──
    try {
        const endpoints = [
            'https://1.1.1.1/cdn-cgi/trace',
            'https://1.0.0.1/cdn-cgi/trace',
            'https://checkip.amazonaws.com',
            'https://ipv4.icanhazip.com',
            'https://dash.cloudflare.com/cdn-cgi/trace',
            'https://www.cloudflare.com/cdn-cgi/trace'
        ];
        for (const url of endpoints) {
            try {
                const r = await fetchWithTimeout(url, { timeout: 3500 });
                if (!r.ok) continue;
                const t = (await r.text()).trim();
                
                // Case A: Cloudflare Trace Format (ip=..., loc=..., colo=...)
                if (t.includes('ip=')) {
                    const traceIp = t.match(/ip=(.+)/)?.[1]?.trim();
                    if (traceIp) {
                        ip = traceIp;
                        countryCode = t.match(/loc=(.+)/)?.[1]?.trim() || countryCode;
                        colo = t.match(/colo=(.+)/)?.[1]?.trim() || colo;
                    }
                } 
                // Case B: Plain Text Format (Just the IP address)
                else if (/^([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-fA-F0-9:]+)$/.test(t)) {
                    ip = t;
                }
                
                if (ip) {
                    console.log('Ghost Waterfall success:', url, '->', ip);
                    break;
                }
            } catch (e) {}
        }
    } catch (e) { console.warn('Core IP fetch failed'); }

    // Emergency Geolocation via Cloudflare COLO (Zero-Tracker)
    if (!countryCode && colo && COLO_MAP[colo]) {
        countryCode = COLO_MAP[colo];
        console.log('Zero-Tracker COLO detection:', colo, '->', countryCode);
    }

    // ── STEP 2: Enrichment Waterfall ──
    // Priority 0: Same-Origin (Worker Fallback)
    const soData = await fetchSameOriginGeo();
    if (soData) {
        ip = soData.ip || ip; city = soData.city || city; region = soData.region || region; countryCode = soData.country || countryCode;
        isp = soData.isp || isp; org = soData.org || org; asn = soData.asn || asn; as_org = soData.as_org || as_org;
    }

    // Provider A: freeipapi.com
    if (isp === 'Unknown' || !lat) {
        try {
            const r = await fetchWithTimeout(`https://freeipapi.com/api/json/${ip || ''}`, { timeout: 4000 });
            const d = await r.json();
            if (d.ipAddress) {
                ip = d.ipAddress; city = d.cityName || city; region = d.regionName || region; countryCode = d.countryCode || countryCode;
                lat = d.latitude; lng = d.longitude;
                isp = d.isp || isp; org = d.org || org;
            }
        } catch (e) {}
    }

    // Provider B: ipinfo.io
    if (isp === 'Unknown' || !lat) {
        try {
            const r = await fetchWithTimeout(`https://ipinfo.io/${ip || ''}/json`, { timeout: 4000 });
            const d = await r.json();
            if (d.ip) {
                ip = d.ip; city = d.city || city; region = d.region || region; countryCode = d.country || countryCode;
                isp = d.org || isp; org = d.org || org;
                if (d.loc) { const parts = d.loc.split(','); lat = parseFloat(parts[0]); lng = parseFloat(parts[1]); }
            }
        } catch (e) {}
    }

    // Provider C: ipwho.is
    if (!lat || as_org === 'Unknown') {
        try {
            const r = await fetchWithTimeout(`https://ipwho.is/${ip || ''}`, { timeout: 4000 });
            const d = await r.json();
            if (d.success) {
                ip = d.ip; city = d.city || city; region = d.region || region; countryCode = d.country_code || countryCode;
                lat = d.latitude || lat; lng = d.longitude || lng;
                isp = d.connection?.isp || isp; org = d.connection?.org || org;
                asn = String(d.connection?.asn || asn);
                as_org = d.connection?.org || as_org;
                tzId = d.timezone?.id || tzId; tzUtc = d.timezone?.utc || tzUtc;
            }
        } catch (e) {}
    }

    // Provider D: JSONP fallback (Resilient to CORS/Fetch blocks)
    if (!lat || isp === 'Unknown' || as_org === 'Unknown') {
        try {
            const d = await fetchJSONP(`https://ipapi.co/${ip || ''}/jsonp/`, 'callback');
            if (d && !d.error) {
                city = d.city || city; region = d.region || region; countryCode = d.country_code || countryCode;
                lat = d.latitude || lat; lng = d.longitude || lng;
                isp = d.org || isp; org = d.org || org;
                asn = (d.asn || '').startsWith('AS') ? d.asn : 'AS' + d.asn;
                as_org = d.org || as_org;
            }
        } catch (e) {
            try {
                const d2 = await fetchJSONP(`https://extreme-ip-lookup.com/json/${ip || ''}`);
                if (d2.status === 'success') {
                    city = d2.city || city; region = d2.region || region; countryCode = d2.countryCode || countryCode;
                    lat = parseFloat(d2.lat) || lat; lng = parseFloat(d2.lon) || lng;
                    isp = d2.isp || isp; org = d2.org || org;
                }
            } catch (e2) {}
        }
    }

    // Provider E: RDAP (Registration Data Access Protocol) — The "Nuclear" Logic
    if (isp === 'Unknown' || as_org === 'Unknown') {
        const rdap = await fetchRDAP(ip);
        if (rdap) {
            isp = rdap.isp || isp;
            org = rdap.org || org;
            as_org = rdap.org || as_org;
            console.warn('Enrichment blocked. Fallback to RDAP success.');
        }
    }

    // Provider F: DNS-Mirroring (If DNS probe succeeded but Geo-IP failed)
    if (isp === 'Unknown' && dnsIsps.size > 0) {
        isp = Array.from(dnsIsps)[0];
        org = Array.from(dnsOrgs)[0] || isp;
        as_org = org;
        console.warn('Enrichment blocked. Fallback to DNS-Mirroring success.');
    }
    if (countryCode === 'JP' && dnsCountryFrequency.get('KR') > (dnsCountryFrequency.get('JP') || 0)) {
        console.log('Location mismatch detected: IP=JP, DNS=KR. Correcting...');
        countryCode = 'KR'; city = 'Seoul'; region = 'South Korea';
        const badge = document.getElementById('loc-verify-badge'); if (badge) badge.classList.remove('hidden');
        if (COUNTRY_COORDS['KR']) [lat, lng] = COUNTRY_COORDS['KR'];
    }

    // Provider E: Emergency DNS-based Geo Fallback (If all APIs blocked)
    if (!lat && dnsCountryFrequency.size > 0) {
        const topCC = Array.from(dnsCountryFrequency.entries()).sort((a,b) => b[1] - a[1])[0][0];
        if (topCC && COUNTRY_COORDS[topCC]) {
            console.warn('All Geo-IP APIs blocked. Triggering DNS geo fallback...');
            countryCode = topCC;
            const names = {'KR':'South Korea','JP':'Japan','HK':'Hong Kong','SG':'Singapore','US':'USA'};
            region = names[topCC] || topCC;
            [lat, lng] = COUNTRY_COORDS[topCC];
            const badge = document.getElementById('loc-verify-badge'); if (badge) { badge.innerText = "DNS Fallback"; badge.classList.remove('hidden'); }
        }
    }

    // MAP FALLBACK
    if (!lat && countryCode && COUNTRY_COORDS[countryCode]) {
        [lat, lng] = COUNTRY_COORDS[countryCode];
        initMap(lat, lng, 5); 
    }

    // ── STEP 4: WebRTC Fallback (Last resort IP) ──
    if (!ip) {
        try {
            const webRtcIp = await getIPFromWebRTC();
            if (webRtcIp) {
                const isPrivate = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.|169\.254\.)/i.test(webRtcIp);
                if (!isPrivate) { ip = webRtcIp; isp = "WebRTC (Detected)"; }
            }
        } catch (e) {}
    }

    // ── POPULATE UI ──
    if (ip) {
        el('ipv4-display', ip);
        el('ipv4-loc', [city, region].filter(Boolean).join(', ') || countryCode || 'Unknown');
        el('isp-display', isp); el('org-display', org); el('as-org-display', as_org || org); el('asn-display', asn);
        el('hostname-display', 'Resolving...'); fetchPTRRecord(ip);
        if (lat && lng) initMap(lat, lng, lat && lng && city && city !== 'Seoul' ? 13 : 5);
        if (isp === 'Unknown' || asn === '--') el('vpn-status', 'Adblock/Filter Detected');
        detectVPN(tzId, tzUtc, isp, countryCode, org, asn);
    } else {
        el('ipv4-display', 'Unavailable'); el('ipv4-loc', 'Privacy Filter Blocking APIs'); el('vpn-status', 'No Data');
    }
}

async function fetchPTRRecord(ip) {
    if (!ip) return;
    try {
        const r = await fetchWithTimeout(`https://ipwho.is/${ip}?fields=connection`, { timeout: 4000 });
        const d = await r.json();
        if (d.success && d.connection?.domain) {
            document.getElementById('hostname-display').innerText = d.connection.domain;
            return;
        }
    } catch (e) {}
    document.getElementById('hostname-display').innerText = 'No PTR Record';
}

async function fetchIPv6Data() {
    const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
    let ipv6 = null;
    try {
        const endpoints = ['https://api64.ipify.org?format=json', 'https://www.cloudflare.com/cdn-cgi/trace'];
        for (const url of endpoints) {
            try {
                const r = await fetchWithTimeout(url, { timeout: 4500 });
                if (url.includes('ipify')) {
                    const d = await r.json(); if (d.ip?.includes(':')) ipv6 = d.ip;
                } else {
                    const t = await r.text(); const traceIp = t.match(/ip=(.+)/)?.[1]?.trim();
                    if (traceIp?.includes(':')) ipv6 = traceIp;
                }
                if (ipv6) break;
            } catch (e) {}
        }

        if (ipv6) {
            setEl('ipv6-display', ipv6);
            const s = document.getElementById('ipv6-status');
            if (s) { s.innerText = 'Active'; s.style.color = 'var(--accent-emerald)'; s.style.fontWeight = '700'; }
            try {
                // Multi-provider fallback for IPv6
                const ri = await fetchWithTimeout(`https://freeipapi.com/api/json/${ipv6}`, { timeout: 4000 });
                const di = await ri.json();
                if (di.cityName) setEl('ipv6-provider', di.connection?.isp || di.connection?.org || 'Active');
                else {
                    const ri2 = await fetchWithTimeout(`https://ipwho.is/${ipv6}?fields=connection`, { timeout: 4000 });
                    const di2 = await ri2.json();
                    setEl('ipv6-provider', di2.connection?.isp || di2.connection?.org || 'Active');
                }
            } catch (e) { setEl('ipv6-provider', 'Active'); }
        } else {
            setEl('ipv6-display', 'Not Available');
            const s = document.getElementById('ipv6-status');
            if (s) { s.innerText = 'IPv4 Only'; s.style.color = 'var(--text-muted)'; }
            setEl('ipv6-provider', 'No IPv6 Connectivity');
        }
    } catch (e) {
        setEl('ipv6-display', 'Not Detected');
        setEl('ipv6-status', 'IPv4 Only');
        setEl('ipv6-provider', '--');
    }
}

async function fetchDNS() {
    const list = document.getElementById('dns-list'), badge = document.getElementById('dns-count-badge');
    if (list) list.innerHTML = '<li style="font-size:0.8rem;color:var(--text-secondary);display:flex;align-items:center"><span class="loader" style="margin-right:0.5rem"></span><span><span>Probing DNS Resolvers...</span><br><span style="font-size:0.6rem;color:var(--text-muted)">Fetching raw provider data</span></span></li>';
    const detected = new Map(), BATCH = 10;
    const runBatch = async () => Promise.all(Array(BATCH).fill(0).map(async () => { try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 3000); const r = await fetch(`https://edns.ip-api.com/json?r=${Math.random()}`, { signal: c.signal, cache: 'no-store' }); clearTimeout(t); if (!r.ok) return null; const d = await r.json(); return d.dns?.ip ? d.dns : null; } catch (e) { return null; } }));
    let results = await runBatch(); await new Promise(r => setTimeout(r, 250)); results = results.concat(await runBatch());
    let total = 0; results.forEach(dns => { 
        if (dns) { 
            total++; 
            if (detected.has(dns.ip)) detected.get(dns.ip).count++; 
            else detected.set(dns.ip, { data: dns, count: 1 }); 
            if (dns.isp) dnsIsps.add(dns.isp);
            if (dns.org) dnsOrgs.add(dns.org);
            if (dns.geo) { 
                const cc = dns.geo.split(',').pop().trim(); 
                let code = cc; 
                if (cc === 'South Korea') code = 'KR'; 
                else if (cc === 'Japan') code = 'JP'; 
                dnsCountryFrequency.set(code, (dnsCountryFrequency.get(code) || 0) + 1); 
            } 
        } 
    });
    if (list) list.innerHTML = '';
    
    // Trigger IP refresh if DNS results might correct location
    if (dnsCountryFrequency.size > 0) { setTimeout(() => fetchIPv4Data(), 500); }
    
    if (detected.size > 0) {
        if (badge) { badge.innerText = `${detected.size} SERVER${detected.size > 1 ? 'S' : ''}`; badge.classList.remove('hidden'); }
        Array.from(detected.values()).sort((a, b) => b.count - a.count).forEach(item => {
            const dns = item.data, pct = Math.round((item.count / total) * 100);
            let pn = dns.isp || ""; const l = pn.toLowerCase(); if (l.includes("google")) pn = "Google DNS"; else if (l.includes("cloudflare")) pn = "Cloudflare"; else if (l.includes("opendns")) pn = "OpenDNS"; else if (l.includes("quad9")) pn = "Quad9"; else if (l.includes("cisco")) pn = "Cisco Umbrella";
            if (list) list.innerHTML += `<li style="padding-bottom:0.6rem;border-bottom:1px solid var(--bg-card-border)"><div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:0.2rem"><span style="font-size:0.85rem;font-weight:700;color:var(--text-primary);font-family:'Inter',monospace">${dns.ip}</span><span style="font-size:0.6rem;font-weight:700;background:rgba(255,255,255,0.05);color:var(--text-muted);padding:0.1rem 0.4rem;border-radius:4px">${pct}% Traffic</span></div><div style="display:flex;justify-content:space-between"><div><div style="font-size:0.75rem;font-weight:700;color:var(--accent-blue)">${pn}</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:0.1rem">${dns.geo || ""}</div></div></div><div style="width:100%;height:3px;background:rgba(255,255,255,0.04);border-radius:9999px;margin-top:0.4rem;overflow:hidden"><div style="height:100%;background:var(--accent-blue);width:${pct}%;transition:width 0.5s"></div></div></li>`;
        });
    } else { if (list) list.innerHTML = '<li style="padding:0.75rem;background:var(--glow-red);border:1px solid rgba(248,113,113,0.1);border-radius:6px;text-align:center"><p style="font-size:0.75rem;font-weight:700;color:var(--accent-red)">Detection Failed</p><p style="font-size:0.6rem;color:var(--text-muted);margin-top:0.2rem">Check adblocker or network settings</p></li>'; }
}

function getWebRTCIPs() {
    const l = document.getElementById('webrtc-list'), icon = document.getElementById('icon-webrtc'), desc = document.getElementById('desc-webrtc');
    const foundIPs = new Set(); let isScanning = true;
    const R = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (!R) { if (l) l.innerHTML = '<li>Unsupported</li>'; return; }
    const p = new R({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    try { p.createDataChannel(''); } catch (e) {}
    p.onicecandidate = e => {
        if (!e?.candidate) return;
        const m = e.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
        if (m) {
            const ip = m[1]; if (e.candidate.candidate.includes('.local')) return;
            if (!foundIPs.has(ip)) {
                foundIPs.add(ip); if (isScanning && l) { l.innerHTML = ''; isScanning = false; }
                const isPriv = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.|169\.254\.|100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.|fd|fc|fe80)/i.test(ip);
                if (l) l.innerHTML += `<li style="font-family:'Inter',monospace;font-size:0.85rem;color:${isPriv ? 'var(--text-muted)' : 'var(--text-primary);font-weight:700'}">${ip}${isPriv ? ' (Local/VPN)' : ''}</li>`;
            }
        }
    };
    p.createOffer().then(d => p.setLocalDescription(d)).catch(() => {});
    const analyzer = setInterval(() => {
        const ipv4 = document.getElementById('ipv4-display')?.innerText?.trim();
        const ipv6 = document.getElementById('ipv6-display')?.innerText?.trim();
        const vpnText = document.getElementById('vpn-status')?.innerText;
        const isVpnOff = vpnText?.includes("Not Detected");
        if (!ipv4 || ipv4 === '--' || ipv4.includes('Loader') || ipv4 === 'Error') return;
        let status = "safe"; if (foundIPs.size === 0) return;
        foundIPs.forEach(ip => { const isPriv = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.|169\.254\.|100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.|fd|fc|fe80)/i.test(ip); if (!isPriv) { const n = ip.toLowerCase(); if (n !== ipv4?.toLowerCase() && n !== ipv6?.toLowerCase()) status = "leak"; else if (status !== "leak" && isVpnOff) status = "exposed"; } });
        if (icon && desc) {
            if (status === "leak") { icon.className = 'fas fa-exclamation-triangle blink'; icon.style.color = 'var(--accent-red)'; desc.innerText = "CRITICAL: Real IP Leaked!"; desc.style.color = 'var(--accent-red)'; desc.style.fontWeight = '700'; clearInterval(analyzer); }
            else if (status === "exposed") { icon.className = 'fas fa-exclamation-triangle'; icon.style.color = 'var(--accent-orange)'; desc.innerText = "VPN Off — WebRTC Exposed"; desc.style.color = 'var(--accent-orange)'; desc.style.fontWeight = '700'; }
            else { icon.className = 'fas fa-check-circle'; icon.style.color = 'var(--accent-emerald)'; desc.innerText = "Safe (Matches Tunnel IP)"; desc.style.color = 'var(--accent-emerald)'; desc.style.fontWeight = '700'; }
        }
    }, 1000);
    setTimeout(() => { if (foundIPs.size === 0) { if (l) l.innerHTML = '<li style="font-size:0.7rem;color:var(--text-muted)">Hidden by Browser Privacy</li>'; if (icon) { icon.className = 'fas fa-shield-alt'; icon.style.color = 'var(--accent-emerald)'; } if (desc) { desc.innerText = "WebRTC Disabled/Hidden"; desc.style.color = 'var(--text-muted)'; } clearInterval(analyzer); } }, 5000);
}

async function detectSystem() {
    const u = navigator.userAgent;
    const rawEl = document.getElementById('modal-ua-raw'); if (rawEl) rawEl.innerText = u;
    const tzEl = document.getElementById('sys-tz');
    if (tzEl) { const d = new Date(), offset = -d.getTimezoneOffset(), sign = offset >= 0 ? '+' : '-'; const utc = `UTC${sign}${String(Math.floor(Math.abs(offset / 60))).padStart(2, '0')}:${String(Math.abs(offset % 60)).padStart(2, '0')}`; tzEl.innerHTML = `Sys Timezone: <span style="font-weight:700;color:var(--text-primary)">${utc}</span> <i class="fas fa-info-circle" style="font-size:0.55rem;margin-left:0.2rem"></i>`; }

    let o = "Unknown", b = "Unknown";
    if (navigator.userAgentData) { try { const v = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]); const m = parseInt(v.platformVersion?.split('.')[0] || 0); o = m >= 13 ? "Windows 11" : "Windows 10"; } catch(e) {} }
    else { if (u.includes("Win")) o = "Windows"; if (u.includes("Mac")) o = "macOS"; if (u.includes("Linux")) o = "Linux"; if (u.includes("Android")) o = "Android"; if (u.includes("like Mac")) o = "iOS"; }
    if (u.includes("Firefox")) b = "Firefox"; else if (u.includes("Chrome")) b = "Chrome"; else if (u.includes("Safari")) b = "Safari"; else if (u.includes("Edg")) b = "Edge";
    const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
    el('os-name', o); el('os-detail', u.includes("64") ? "64-bit" : "32-bit"); el('browser-name', b);
    const v = u.match(/(?:Chrome|Firefox|Version|Edg)\/([0-9.]+)/); el('browser-ver', v ? "v" + v[1] : "");

    // Browser details
    let bName = "Unknown", bVer = "--", eName = "--", eVer = "--";
    if (u.includes("Firefox")) { bName = "Firefox"; bVer = u.match(/Firefox\/([0-9.]+)/)?.[1] || ""; eName = "Gecko"; eVer = u.match(/Gecko\/([0-9]+)/)?.[1] || ""; }
    else if (u.includes("Chrome")) { bName = "Chrome"; if (u.includes("Edg")) bName = "Edge"; bVer = u.match(/(?:Chrome|Edg)\/([0-9.]+)/)?.[1] || ""; eName = "Blink"; eVer = u.match(/AppleWebKit\/([0-9.]+)/)?.[1] || ""; }
    else if (u.includes("Safari")) { bName = "Safari"; bVer = u.match(/Version\/([0-9.]+)/)?.[1] || ""; eName = "WebKit"; eVer = u.match(/AppleWebKit\/([0-9.]+)/)?.[1] || ""; }
    el('br-name', bName); el('br-ver', bVer); el('br-eng', eName); el('br-eng-ver', eVer);
    el('priv-dnt', navigator.doNotTrack === "1" ? "Enabled" : "Disabled"); el('br-cookies', navigator.cookieEnabled ? "Enabled" : "Disabled"); el('br-js', "Enabled");

    // Hardware
    el('os-cores', navigator.hardwareConcurrency || "Unknown");
    let arch = "x86"; if (u.includes("Win64") || u.includes("x64")) arch = "x86-64"; else if (u.includes("arm")) arch = "ARM";
    el('os-arch', arch); el('os-bitness', u.includes("64") ? "64-bit" : "32-bit"); el('os-memory', (navigator.deviceMemory ? `>=${navigator.deviceMemory}` : "Unknown") + " GB");
    const s = window.screen; el('os-res', `${s.width} x ${s.height}`); el('os-cdepth', `${s.colorDepth}-bit`); el('os-pdepth', `${s.pixelDepth}-bit`);
    let orient = "Landscape"; if (s.orientation?.type) orient = s.orientation.type.replace("-", " "); else if (window.innerHeight > window.innerWidth) orient = "Portrait"; el('os-orient', orient);
    const aud = new Audio(); let codecs = []; if (aud.canPlayType('audio/mpeg')) codecs.push("MP3"); if (aud.canPlayType('audio/mp4')) codecs.push("AAC"); el('os-media', codecs.join(", ") || "Basic"); el('os-pdf', navigator.pdfViewerEnabled ? "Supported" : "No"); el('os-vendor', navigator.vendor || "Unknown"); el('os-model', "Desktop/Generic");
}

function copyUA() { navigator.clipboard.writeText(document.getElementById('modal-ua-raw')?.innerText || ''); alert("Copied!"); }

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    const c = getCookie('speedtest_consent');
    if (!c) showConsentModal(); else updateConsentStatus(c);
    const lim = getCookie('history_limit_val');
    if (lim) { const sel = document.getElementById('history-limit-select'); if (sel) sel.value = lim; }
    renderHistory();
    fetchIPv4Data(); fetchIPv6Data(); fetchDNS(); getWebRTCIPs(); detectSystem();
});

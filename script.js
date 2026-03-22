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
        await fetch('https://speed.cloudflare.com/cdn-cgi/trace', { signal })
            .then(r => r.text())
            .then(t => {
                const loc = t.match(/loc=(.+)/)?.[1] || "UNK";
                const colo = t.match(/colo=(.+)/)?.[1] || "UNK";
                detectedServer = `${colo} (${loc})`;
                if (serverLoc) serverLoc.innerHTML = `${colo} <span style="color:var(--text-muted);font-weight:400">(${loc})</span>`;
            }).catch(() => {});

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
    try { const r = await fetch('https://speed.cloudflare.com/cdn-cgi/trace?r=' + Math.random()); const t = await r.text(); const loc = t.match(/loc=(.+)/)?.[1] || "UNK"; const colo = t.match(/colo=(.+)/)?.[1] || "UNK"; if (locEl) { locEl.innerHTML = `${colo} <span style="color:var(--text-muted);font-weight:400">(${loc})</span>`; locEl.style.color = 'var(--text-primary)'; } }
    catch (e) { if (locEl) { locEl.innerText = "Error (Blocked)"; locEl.style.color = 'var(--accent-red)'; } }
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

let map;
function initMap(lat, lng) { if (map) return; map = L.map('map', { zoomControl: false }).setView([lat, lng], 13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map); L.marker([lat, lng]).addTo(map).bindPopup("<b>IP Location</b>").openPopup(); const el = document.getElementById('map-coords'); if (el) el.innerText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }

async function getIPFromWebRTC() { return new Promise(resolve => { const pc = new RTCPeerConnection({ iceServers: [] }); pc.createDataChannel(''); pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {}); pc.onicecandidate = e => { if (!e?.candidate) return; const m = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate); if (m) { pc.close(); resolve(m[1]); } }; setTimeout(() => { pc.close(); resolve(null); }, 1000); }); }

async function fetchIPv4Data() {
    try {
        let d = null;
        try { const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) }); const data = await r.json(); if (data?.ip) d = { ip: data.ip, city: data.city || '', region_code: data.region_code || '', country_code: data.country_code || '', latitude: data.latitude, longitude: data.longitude, timezone: { id: data.timezone || 'Unknown' }, connection: { isp: data.org || 'Unknown', org: data.org || 'Unknown', asn: (data.asn || '').replace('AS', '') || '--' } }; } catch (e) { console.warn('ipapi.co failed:', e.message); }
        if (!d?.ip) { try { const ip = await getIPFromWebRTC(); if (ip) d = { ip, city: 'Unknown', region_code: 'Unknown', country_code: 'Unknown', latitude: null, longitude: null, timezone: { id: 'Unknown' }, connection: { isp: 'Unable to detect', org: 'Unable to detect', asn: '--' } }; } catch (e) {} }
        if (d?.ip) {
            const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
            el('ipv4-display', d.ip); el('ipv4-loc', `${d.city || 'Unknown'}, ${d.region_code || 'Unknown'}`);
            el('isp-display', d.connection?.isp || 'Unknown'); el('org-display', d.connection?.org || 'Unknown');
            el('as-org-display', d.connection?.org || 'Unknown'); el('asn-display', d.connection?.asn || '--');
            if (d.connection?.domain) el('hostname-display', d.connection.domain); else { el('hostname-display', 'No PTR Record'); fetchPTRRecord(d.ip); }
            if (d.latitude && d.longitude) initMap(d.latitude, d.longitude);
            if (d.timezone) detectVPN(d.timezone.id, d.timezone.utc, d.connection?.isp || '', d.country_code || '', d.connection?.org || '', d.connection?.asn || '');
        } else { const el = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; }; el('ipv4-display', 'Unavailable'); el('ipv4-loc', 'Unable to detect'); el('isp-display', 'Unknown'); }
    } catch (e) { const el = document.getElementById('ipv4-display'); if (el) el.innerText = "Error"; }
}

async function fetchPTRRecord(ip) { try { const r = await fetch(`https://ipwho.is/?ip=${ip}`, { signal: AbortSignal.timeout(5000) }); const d = await r.json(); if (d.success && d.connection?.domain) document.getElementById('hostname-display').innerText = d.connection.domain; } catch (e) {} }

async function fetchIPv6Data() {
    try { const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) }); if (r.ok) { const d = await r.json(); if (d.ip?.includes(':')) { document.getElementById('ipv6-display').innerText = d.ip; const s = document.getElementById('ipv6-status'); if (s) { s.innerText = "Active"; s.style.color = 'var(--accent-emerald)'; s.style.fontWeight = '700'; } document.getElementById('ipv6-provider').innerText = d.org || d.asn || "Unknown"; } else { document.getElementById('ipv6-display').innerText = "Not Available"; const s = document.getElementById('ipv6-status'); if (s) { s.innerText = "Inactive"; s.style.fontWeight = '700'; } document.getElementById('ipv6-provider').innerText = "No IPv6 Connection"; } } }
    catch (e) { document.getElementById('ipv6-display').innerText = "Not Detected"; document.getElementById('ipv6-status').innerText = "IPv4 Only"; document.getElementById('ipv6-provider').innerText = "--"; }
}

async function fetchDNS() {
    const list = document.getElementById('dns-list'), badge = document.getElementById('dns-count-badge');
    if (list) list.innerHTML = '<li style="font-size:0.8rem;color:var(--text-secondary);display:flex;align-items:center"><span class="loader" style="margin-right:0.5rem"></span><span><span>Probing DNS Resolvers...</span><br><span style="font-size:0.6rem;color:var(--text-muted)">Fetching raw provider data</span></span></li>';
    const detected = new Map(), BATCH = 10;
    const runBatch = async () => Promise.all(Array(BATCH).fill(0).map(async () => { try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 3000); const r = await fetch(`https://edns.ip-api.com/json?r=${Math.random()}`, { signal: c.signal, cache: 'no-store' }); clearTimeout(t); if (!r.ok) return null; const d = await r.json(); return d.dns?.ip ? d.dns : null; } catch (e) { return null; } }));
    let results = await runBatch(); await new Promise(r => setTimeout(r, 250)); results = results.concat(await runBatch());
    let total = 0; results.forEach(dns => { if (dns) { total++; if (detected.has(dns.ip)) detected.get(dns.ip).count++; else detected.set(dns.ip, { data: dns, count: 1 }); } });
    if (list) list.innerHTML = '';
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

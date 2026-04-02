const https = require('https');

function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({}); }
            });
        }).on('error', (err) => resolve({}));
    });
}

async function testDNS() {
    const dnsMap = new Map();
    console.log("Starting DNS Test with 50 probes (ip-api.com)...");

    const probes = [];
    for (let i = 0; i < 50; i++) {
        probes.push(getJSON('https://edns.ip-api.com/json?cache=' + Math.random()).then(r => {
            if (r.dns && r.dns.ip) {
                const ip = r.dns.ip;
                if (!dnsMap.has(ip)) dnsMap.set(ip, 0);
                dnsMap.set(ip, dnsMap.get(ip) + 1);
            }
        }));
    }

    await Promise.all(probes);
    console.log(`Found ${dnsMap.size} unique resolvers via ip-api.com`);
    console.log(Array.from(dnsMap.entries()));

    const dnsMap2 = new Map();
    console.log("\nStarting DNS Test with 50 probes (ipleak.net)...");
    const probes2 = [];
    for (let i = 0; i < 50; i++) {
        const session = Math.random().toString(36).substr(2, 16);
        const rnd = Math.random().toString(36).substr(2, 12);
        probes2.push(getJSON(`https://${session}-${rnd}.ipleak.net/dnsdetection/`).then(r => {
            const item = Array.isArray(r) ? r[0] : r;
            if (item && item.ip) {
                const ip = item.ip;
                if (!dnsMap2.has(ip)) dnsMap2.set(ip, 0);
                dnsMap2.set(ip, dnsMap2.get(ip) + 1);
            }
        }));
    }

    await Promise.all(probes2);
    console.log(`Found ${dnsMap2.size} unique resolvers via ipleak.net`);
    console.log(Array.from(dnsMap2.entries()));
}

testDNS();

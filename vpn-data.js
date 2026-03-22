// === VPN Detection Data (Separated for maintainability) ===
const KNOWN_VPN_ASNS = new Set([
    209854,216025,39351,209103,62371,199218,57169,136787,147049,141039,207137,211366,137409,47583,397223,60341,
    9009,212238,201814,60068,42473,16265,28753,395954,60626,57043,18779,54095,11878,33438,12989,54600,30635,6939,
    14061,202018,62567,393406,20473,64515,206443,63949,21844,17204,16276,35540,9989,24940,213230,47232,
    16509,14618,7224,8987,15169,396982,19527,8075,8074,31898,
    13335,53667,202425,132203,49335,40021,262287,396356,21859,203020,22363,136557,8100,40676,395092,19318,29802,
    41281,215551,398327,394353,34988,54314,398284,54113,23959,43357
]);

const VPN_BRAND_MAP = [
    {keys:['london trust media','private internet access'],label:'Likely PIA - London Trust Media'},
    {keys:['proton ag','protonvpn'],label:'Likely ProtonVPN - Proton AG'},
    {keys:['mullvad','31173 services','amnezia'],label:'Likely Mullvad - 31173 Services'},
    {keys:['cyberzone','surfshark'],label:'Likely Surfshark - Cyberzone'},
    {keys:['packethub','nordvpn'],label:'Likely NordVPN - Packethub'},
    {keys:['expressvpn','expressnetw'],label:'Likely ExpressVPN - ExpressNetw'},
    {keys:['logicweb'],label:'Likely ExpressVPN - LogicWeb'},
    {keys:['aura','anchorfree','pango','hotspot shield'],label:'Likely Hotspot Shield - Aura/Pango'},
    {keys:['golden frog','vyprvpn'],label:'Likely VyprVPN - Golden Frog'},
    {keys:['zenmate','zenguard'],label:'Likely ZenMate - Zenguard'},
    {keys:['windscribe'],label:'Likely Windscribe - Windscribe'},
    {keys:['tunnelbear'],label:'Likely TunnelBear - TunnelBear'},
    {keys:['hide.me','hide me'],label:'Likely Hide.me - Hide-me'},
    {keys:['privax','hidemyass','hma'],label:'Likely HMA (HideMyAss) - Privax'},
    {keys:['gz systems','gaditek','purevpn','secure internet'],label:'Likely PureVPN - GZ Systems'},
    {keys:['peakstar','atlas'],label:'Likely Atlas VPN - Peakstar'},
    {keys:['ivpn'],label:'Likely IVPN - IVPN'},
    {keys:['ovpn'],label:'Likely OVPN - OVPN'},
    {keys:['airvpn'],label:'Likely AirVPN - AirVPN'},
    {keys:['torguard'],label:'Likely TorGuard - TorGuard'},
    {keys:['keff networks ltd','keff networks'],label:'Possibly Tor Network / Datacenter - Keff Networks Ltd'},
    {keys:['foundation for applied privacy','applied privacy'],label:'Likely Tor Network - Foundation for Applied Privacy'},
    {keys:['1337 services gmbh','1337 services'],label:'Possibly Tor Network / Datacenter - 1337 Services GmbH'},
    {keys:['flokinet ehf','flokinet'],label:'Possibly Tor Network / Datacenter - FlokiNET ehf'},
    {keys:['quxlabs ab','quxlabs'],label:'Possibly Tor Network / Datacenter - QuxLabs AB'},
    {keys:['dotsrc','forening for dotsrc'],label:'Possibly Tor Network / Datacenter - Dotsrc'},
    {keys:['stiftung erneuerbare freiheit','erneur freih'],label:'Likely Tor Network - Stiftung Erneuerbare Freiheit'},
    {keys:['online.net','online sas'],label:'Likely Tor Network - Online.net'},
    {keys:['100up'],label:'Likely Tor Network - 100UP'},
    {keys:['ielo liazo','lazo services'],label:'Likely Tor Network - IELO LIAZO'},
    {keys:['host universal'],label:'Possible Surfshark - Host Universal'},
    {keys:['pexigo','zomro','dedipath','hostwinds'],label:'Generic Hosting / Proxy Network - High Risk'},
    {keys:['telenor'],label:'Generic Hosting / Anonymity Service - Telenor'},
    {keys:['owl limited','asn23959','asn43357'],label:'Likely Mullvad/Proton - Owl Limited/AS'},
    {keys:['datacamp','cdn77','datapacket'],label:'Likely Surfshark/PIA/Proton - Datacamp'},
    {keys:['estnoc'],label:'Datacenter / Possibly Nord/Surfshark/Proton - Estnoc'},
    {keys:['orion'],label:'Datacenter / Possibly Proton - Orion'},
    {keys:['xtom'],label:'Datacenter / Possibly Proton - xTom'},
    {keys:['strong technology','strongvpn','ipvanish','netprotect','highwinds','stackpath','performive'],label:'Likely StrongVPN/IPVanish - NetProtect'},
    {keys:['m247','m europe','ipxo'],label:'Likely Nord/Surfshark/Proton - M247'},
    {keys:['tzulo','gsl networks'],label:'Likely PureVPN/CyberGhost - GSL'},
    {keys:['clouvider'],label:'Likely ExpressVPN/FastestVPN - Clouvider'},
    {keys:['leaseweb'],label:'Likely PIA/PrivateVPN - Leaseweb'},
    {keys:['cloudflare','warp','asn13335'],label:'Usually WARP / iCloud Private Relay - Cloudflare Inc.'},
    {keys:['fastly','asn54113'],label:'Probably WARP / iCloud Private Relay - Fastly Inc.'},
    {keys:['akamai'],label:'Maybe iCloud Private Relay / Surfshark / Proton - Akamai Technologies'},
    {keys:['google','google llc'],label:'Likely Google One VPN - Google Cloud'},
    {keys:['constant','vultr','choopa'],label:'Likely IPVanish/Self-Hosted - Vultr'},
    {keys:['digitalocean'],label:'Likely Self-Hosted VPN - DigitalOcean'},
    {keys:['linode'],label:'Likely Tor Network / Self-Hosted VPN - Linode'},
    {keys:['ovh','ovh sas'],label:'Likely Self-Hosted VPN - OVH'},
    {keys:['hetzner'],label:'Likely Self-Hosted VPN - Hetzner'},
    {keys:['amazon','aws'],label:'Likely AWS VPN - AWS'},
    {keys:['microsoft','azure'],label:'Likely Azure VPN - Azure'},
    {keys:['oracle','oracle cloud'],label:'Likely Oracle Cloud VPN - Oracle'},
    {keys:['alibaba'],label:'Likely Alibaba Cloud VPN - Alibaba'},
    {keys:['tor exit','tor project','onion'],label:'Tor Network - Tor Exit Node'},
    {keys:['vpn service','privacy service','anonymous vpn'],label:'Likely Generic VPN Service'},
    {keys:['residential proxy','anonymous proxy'],label:'Likely Proxy Network'}
];

const PROVIDER_NAMES = [
    'cloudflare','google','amazon','aws','microsoft','azure','digitalocean','hetzner','ovh','expressvpn',
    'nordvpn','proton','surfshark','mullvad','zenlayer','leaseweb','hostinger','windscribe','tunnelbear',
    'vyprvpn','purevpn','ipvanish','hotspot shield','zenmate','hidemyass','hma','private internet access',
    'pia','cyberghost','strongvpn','fastestvpn','ivacy','veepn','torguard','airvpn','perfectprivacy',
    'cactusvpn','ovpn','hide.me','privatevpn','protonvpn','vultr','linode','choopa','performive',
    'shock hosting','teraswitch','melbicom','packethub','datacamp','fastly','owl limited','akamai'
];

const VPN_REGEX = new RegExp(PROVIDER_NAMES.join('|'), 'i');
const GENERIC_REGEX = /vpn|proxy|hosting|cloud|datacenter|vps|server|transit|colo/i;

const LOW_CONFIDENCE_ASNS = new Set([
    14061,202018,62567,393406,20473,64515,206443,63949,21844,17204,16276,35540,9989,
    24940,213230,47232,16509,14618,7224,8987,15169,396982,19527,8075,8074,31898
]);

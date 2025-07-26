export async function handler(event, context) {
  const urls = [
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_1.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_2.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_3.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_4.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_1.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_2.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_3.txt',
    'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_4.txt',
    'https://raw.githubusercontent.com/4n0nymou3/auto-warp-config/refs/heads/main/config.txt',
    'https://raw.githubusercontent.com/4n0nymou3/wg-config-fetcher/refs/heads/main/configs/wireguard_configs.txt',
    'https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_iOS.txt',
    'https://raw.githubusercontent.com/HosseinKoofi/GO_V2rayCollector/main/ss_iran.txt',
    'https://raw.githubusercontent.com/HosseinKoofi/GO_V2rayCollector/main/vmess_iran.txt',
    'https://raw.githubusercontent.com/HosseinKoofi/GO_V2rayCollector/main/vless_iran.txt',
    'https://raw.githubusercontent.com/HosseinKoofi/GO_V2rayCollector/main/mixed_iran.txt',
    'https://raw.githubusercontent.com/HosseinKoofi/GO_V2rayCollector/main/trojan_iran.txt',
    'https://raw.githubusercontent.com/4n0nymou3/ss-config-updater/refs/heads/main/configs.txt',
    'https://raw.githubusercontent.com/Mahdi0024/ProxyCollector/master/sub/proxies.txt',
    'https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/refs/heads/main/Reality',
    'https://raw.githubusercontent.com/TelAB841Conf/AB_841-config-Free-X-ray/refs/heads/main/X-ray_Server-Free',
    'https://raw.githubusercontent.com/rango-cfs/NewCollector/refs/heads/main/v2ray_links.txt',
    'https://raw.githubusercontent.com/4n0nymou3/multi-proxy-config-fetcher/refs/heads/main/configs/proxy_configs.txt',
    'https://raw.githubusercontent.com/IranianCypherpunks/SingBox/refs/heads/main/Sub',
    'https://raw.githubusercontent.com/valid7996/Gozargah/refs/heads/main/Gozargah_sing-box_sub',
    'https://trojanvmess.pages.dev/cmcm?b64',
    'https://raw.githubusercontent.com/valid7996/Gozargah/refs/heads/main/Gozargah.yaml',
    'https://raw.githubusercontent.com/aiboboxx/clashfree/refs/heads/main/clash.yml',
    'https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml',
    'https://raw.githubusercontent.com/Pawdroid/Free-servers/refs/heads/main/sub',
    'https://raw.githubusercontent.com/mortezmorteza20202/mortezavpn/refs/heads/main/mortezavpn.txt',
    'https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt',
    'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/STR.BYPASS',
    'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/Vless',
    'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/STR',
    'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/BYPASS'
  ];

  let combined = '';

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();

      const cleaned = text
        .split('\n')
        // Remove lines like "//key: value"
        .filter(line => !/^\/\/.*?:/.test(line.trim()))
        // Remove lines containing "VLESS Link:" or "VMESS Link:"
        .filter(line => !/VLESS Link:|VMESS Link:/i.test(line))
        // Remove anything after '#' (including '#')
        .map(line => line.split('#')[0].trim())
        // Remove malformed characters (non-standard Unicode)
        .map(line =>
          line.replace(
            /[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]/g,
            ''
          )
        )
        .filter(line => line.length > 0)
        .join('\n');

      combined += cleaned + '\n';
    } catch (_) {
      // skip failed fetches
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    },
    body: combined.trim()
  };
}

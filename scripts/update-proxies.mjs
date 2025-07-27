// scripts/update-proxies.mjs

import fs from 'fs/promises';
import net from 'net';
import fetch from 'node-fetch';

const OUTPUT_PATH = 'proxies.txt';

const urls = [
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_1.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_2.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_3.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mci/sub_4.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_1.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_2.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_3.txt',
  'https://raw.githubusercontent.com/mahsanet/MahsaFreeConfig/refs/heads/main/mtn/sub_4.txt',
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
  'https://trojanvmess.pages.dev/cmcm?b64',
  'https://raw.githubusercontent.com/Pawdroid/Free-servers/refs/heads/main/sub',
  'https://raw.githubusercontent.com/mortezmorteza20202/mortezavpn/refs/heads/main/mortezavpn.txt',
  'https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt',
  'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/STR.BYPASS',
  'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/Vless',
  'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/STR',
  'https://raw.githubusercontent.com/STR97/STRUGOV/refs/heads/main/BYPASS',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollector/main/vmess_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollector/main/ss_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollector/main/trojan_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollector/main/vless_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollector/main/mixed_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2ray-Config/main/Splitted-By-Protocol/vmess.txt',
  'https://raw.githubusercontent.com/SilkArt/V2ray-Config/main/Splitted-By-Protocol/vless.txt',
  'https://raw.githubusercontent.com/SilkArt/V2ray-Config/main/Splitted-By-Protocol/trojan.txt',
  'https://raw.githubusercontent.com/SilkArt/V2ray-Config/main/Splitted-By-Protocol/ss.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollectorLire/main/vmess_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollectorLire/main/ss_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollectorLire/main/trojan_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollectorLire/main/vless_iran.txt',
  'https://raw.githubusercontent.com/SilkArt/V2rayCollectorLire/main/mixed_iran.txt',
  'https://raw.githubusercontent.com/F0rc3Run/F0rc3Run/refs/heads/main/splitted-by-protocol/ss/ss.txt',
  'https://raw.githubusercontent.com/F0rc3Run/F0rc3Run/refs/heads/main/splitted-by-protocol/vless/vless_part1.txt',
  'https://raw.githubusercontent.com/F0rc3Run/F0rc3Run/refs/heads/main/splitted-by-protocol/vmess/vmess.txt',
  'https://raw.githubusercontent.com/F0rc3Run/F0rc3Run/refs/heads/main/splitted-by-protocol/trojan/trojan_part1.txt',
  'https://raw.githubusercontent.com/F0rc3Run/F0rc3Run/main/Special/Telegram.txt',
];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function measureLatency(host, port, timeout = 1000) {
  return new Promise(resolve => {
    if (!port || port < 0 || port >= 65536) return resolve(null);
    const start = Date.now();
    const socket = net.connect(port, host);
    let finished = false;
    const done = (ms) => {
      if (!finished) {
        finished = true;
        socket.destroy();
        resolve(ms);
      }
    };
    socket.on('connect', () => done(Date.now() - start));
    socket.on('error', () => done(null));
    socket.setTimeout(timeout, () => done(null));
  });
}

function parseHostPort(line) {
  try {
    if (/^vmess:\/\//.test(line)) {
      const base64 = line.replace(/^vmess:\/\//, '').split('#')[0].trim();
      const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      return { host: json.add, port: Number(json.port) };
    } else if (/^(vless|trojan):\/\//.test(line)) {
      const url = new URL(line);
      return { host: url.hostname, port: Number(url.port || 443) };
    } else if (/^ss:\/\//.test(line)) {
      const cleaned = line.replace(/^ss:\/\//, '').split('#')[0];
      const atIndex = cleaned.lastIndexOf('@');
      if (atIndex !== -1) {
        const server = cleaned.substring(atIndex + 1);
        const [host, portStr] = server.split(':');
        return { host, port: Number(portStr) };
      }
    }
  } catch (err) {
    log(`Error parsing host/port: ${err.message}`);
  }
  return null;
}

async function limitedParallelMap(array, fn, limit = 10) {
  const results = [];
  const executing = [];

  for (const item of array) {
    const p = fn(item).then(r => results.push(r));
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(0, executing.length - limit + 1);
    }
  }

  await Promise.all(executing);
  return results;
}

(async () => {
  let lines = [];

  log(`Starting proxy fetch from ${urls.length} URLs...`);
  for (const url of urls) {
    try {
      log(`Fetching: ${url}`);
      const res = await fetch(url);
      if (!res.ok) {
        log(`Failed to fetch: ${url} - Status: ${res.status}`);
        continue;
      }
      const text = await res.text();
      const cleaned = text
        .split('\n')
        .filter(line => !/^\/\/.*?:/.test(line.trim()))
        .filter(line => !/VLESS Link:|VMESS Link:/i.test(line))
        .map(line => line.split('#')[0].trim())
        .map(line =>
          line.replace(
            /[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]/g,
            ''
          )
        )
        .filter(line => line.length > 0);

      log(`Fetched and cleaned ${cleaned.length} lines from: ${url}`);
      lines.push(...cleaned);
    } catch (err) {
      log(`Error fetching ${url}: ${err.message}`);
    }
  }

  log(`Total lines collected: ${lines.length}`);
  log(`Starting latency checks...`);

  const withLatency = await limitedParallelMap(
    lines,
    async line => {
      const info = parseHostPort(line);
      if (!info || !info.host || !info.port) {
        log(`Unresolved line: ${line}`);
        return `${line} #unresolved`;
      }

      const latency = await measureLatency(info.host, info.port);
      const status = latency !== null ? `${latency}ms` : 'timeout';
      log(`Checked ${info.host}:${info.port} - ${status}`);
      return latency !== null ? `${line} #${latency}ms` : `${line} #timeout`;
    },
    15
  );

  log(`Latency checks complete. Writing to ${OUTPUT_PATH}...`);
  const result = withLatency.join('\n');
  await fs.writeFile(OUTPUT_PATH, result, 'utf-8');
  log(`Finished writing output to ${OUTPUT_PATH}`);
})();

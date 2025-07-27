// scripts/update-proxies.mjs

import fs from 'fs/promises';
import net from 'net';
import fetch from 'node-fetch';

const OUTPUT_PATH = 'proxies.txt';

const urls = [
  // 🔽 Copy full URL list from your Netlify function and paste here
];

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
  } catch {}
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

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
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

      lines.push(...cleaned);
    } catch (_) {}
  }

  const withLatency = await limitedParallelMap(
    lines,
    async line => {
      const info = parseHostPort(line);
      if (!info || !info.host || !info.port) return `${line} #unresolved`;
      const latency = await measureLatency(info.host, info.port);
      return latency !== null ? `${line} #${latency}ms` : `${line} #timeout`;
    },
    15
  );

  const result = withLatency.join('\n');
  await fs.writeFile(OUTPUT_PATH, result, 'utf-8');
})();

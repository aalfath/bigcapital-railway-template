// Bigcapital's Redis clients (BullMQ, cache) only take a host and port, and ioredis
// resolves IPv4 only, while Railway's private network is IPv6. This forwarder listens on
// 127.0.0.1:6379, connects to the Redis in REDIS_URL over the private network, sends AUTH
// with its password first, then pipes the connection through.
'use strict';
const net = require('net');

const target = new URL(process.env.REDIS_URL);
const host = target.hostname.replace(/^\[|\]$/g, '');
const port = Number(target.port || 6379);
const user = decodeURIComponent(target.username || 'default');
const pass = decodeURIComponent(target.password || '');

function resp(args) {
  return `*${args.length}\r\n` + args.map((a) => `$${Buffer.byteLength(a)}\r\n${a}\r\n`).join('');
}

net
  .createServer((client) => {
    client.pause();
    const upstream = net.connect({ host, port });
    const fail = () => { client.destroy(); upstream.destroy(); };
    client.on('error', fail);
    upstream.on('error', (e) => { console.error('[redis-forward]', e.message); fail(); });
    upstream.once('connect', () => {
      if (!pass) { client.pipe(upstream).pipe(client); client.resume(); return; }
      upstream.write(resp(['AUTH', user, pass]));
      let buf = '';
      const onData = (d) => {
        buf += d.toString('latin1');
        const i = buf.indexOf('\r\n');
        if (i === -1) return;
        upstream.removeListener('data', onData);
        if (!buf.startsWith('+OK')) { console.error('[redis-forward] AUTH failed:', buf.slice(0, i)); return fail(); }
        const rest = buf.slice(i + 2);
        if (rest) client.write(Buffer.from(rest, 'latin1'));
        client.pipe(upstream).pipe(client);
        client.resume();
      };
      upstream.on('data', onData);
    });
  })
  .listen(6379, '127.0.0.1', () => console.log(`[redis-forward] 127.0.0.1:6379 -> ${host}:${port}`));

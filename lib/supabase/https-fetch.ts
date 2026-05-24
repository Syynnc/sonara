import https from 'https';

// One agent per host to avoid keep-alive connection reuse across different hosts.
const agents = new Map<string, https.Agent>();
function getAgent(hostname: string) {
  if (!agents.has(hostname)) {
    agents.set(hostname, new https.Agent({ family: 4, keepAlive: true }));
  }
  return agents.get(hostname)!;
}

function toPlainHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((v, k) => { out[k] = v; });
    return out;
  }
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers as Record<string, string>;
}

// undici (Node fetch) times out on Windows due to IPv6 DNS entries.
// This custom fetch uses the legacy https module which correctly uses IPv4.
export const httpsFetch: typeof fetch = (input, init) => {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const parsed = new URL(rawUrl);

  return new Promise((resolve, reject) => {
    const body =
      init?.body != null
        ? typeof init.body === 'string'
          ? Buffer.from(init.body)
          : (init.body as Buffer)
        : null;

    const headers: Record<string, string> = {
      ...toPlainHeaders(init?.headers),
      ...(body ? { 'content-length': String(body.length) } : {}),
    };

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: init?.method ?? 'GET',
        headers,
        agent: getAgent(parsed.hostname),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const status = res.statusCode ?? 200;
          // 204/304 must have no body — Response constructor rejects them with a body
          const body = status === 204 || status === 304 ? null : Buffer.concat(chunks);
          resolve(
            new Response(body, {
              status,
              headers: res.headers as Record<string, string>,
            }),
          );
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

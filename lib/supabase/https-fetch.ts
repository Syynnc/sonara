import https from 'https';

// One agent per host, IPv4-forced to avoid Windows IPv6 timeout issues.
// keepAlive is enabled but stale sockets are automatically destroyed after 5 s
// of inactivity so ECONNRESET on reuse is far less likely.
const agents = new Map<string, https.Agent>();
function getAgent(hostname: string) {
  if (!agents.has(hostname)) {
    agents.set(hostname, new https.Agent({
      family:    4,
      keepAlive: true,
    }));
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

function toBuffer(body: BodyInit | null | undefined): Buffer | null {
  if (body == null)                       return null;
  if (typeof body === 'string')           return Buffer.from(body);
  if (body instanceof URLSearchParams)    return Buffer.from(body.toString());
  if (Buffer.isBuffer(body))              return body;
  return Buffer.from(body as Uint8Array);
}

// undici (Node fetch) times out on Windows due to IPv6 DNS entries.
// This custom fetch uses the legacy https module which correctly uses IPv4.
// On ECONNRESET (stale keep-alive socket) it retries once with a fresh socket.
function doRequest(
  rawUrl: string,
  init: RequestInit | undefined,
  useAgent: https.Agent | false,
): Promise<Response> {
  const parsed = new URL(rawUrl);
  const body   = toBuffer(init?.body);

  const headers: Record<string, string> = {
    ...toPlainHeaders(init?.headers),
    ...(body ? { 'content-length': String(body.length) } : {}),
  };

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   init?.method ?? 'GET',
        headers,
        agent:    useAgent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const status = res.statusCode ?? 200;
          const buf    = status === 204 || status === 304 ? null : Buffer.concat(chunks);
          resolve(new Response(buf, { status, headers: res.headers as Record<string, string> }));
        });
        res.on('error', reject);
      },
    );

    req.setTimeout(10_000, () => {
      req.destroy(new Error('httpsFetch: request timed out after 10 s'));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

export const httpsFetch: typeof fetch = async (input, init) => {
  const rawUrl =
    typeof input === 'string' ? input
    : input instanceof URL    ? input.href
    : input.url;

  const hostname = new URL(rawUrl).hostname;

  try {
    return await doRequest(rawUrl, init, getAgent(hostname));
  } catch (err: unknown) {
    // ECONNRESET = stale keep-alive socket. Retry once with a fresh connection.
    if ((err as NodeJS.ErrnoException).code === 'ECONNRESET') {
      console.warn(`[httpsFetch] ECONNRESET on ${hostname}, retrying with fresh socket`);
      return doRequest(rawUrl, init, false); // false = no agent, new socket
    }
    throw err;
  }
};

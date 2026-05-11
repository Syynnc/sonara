import https from 'https';

const agent = new https.Agent({ family: 4 });

function toPlainHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((v, k) => { out[k] = v; });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

// undici (Node fetch) times out on Windows due to IPv6 DNS entries from Supabase.
// This custom fetch uses the legacy https module which correctly uses IPv4.
export const httpsFetch: typeof fetch = (input, init) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: init?.method ?? 'GET',
        headers: toPlainHeaders(init?.headers),
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve(
            new Response(body, {
              status: res.statusCode,
              headers: res.headers as Record<string, string>,
            }),
          );
        });
      },
    );
    req.on('error', reject);
    if (init?.body) req.write(init.body as string);
    req.end();
  });
};

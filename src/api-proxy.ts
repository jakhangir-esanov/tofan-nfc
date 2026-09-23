import type { Request, RequestHandler, Response } from 'express';
const BAD_GATEWAY = 502;
const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'content-encoding',
]);

export function apiProxy(target: string): RequestHandler {
  const origin = target.replace(/\/+$/, '');
  return (request, response) => {
    forward(origin, request, response).catch(() => response.sendStatus(BAD_GATEWAY));
  };
}

async function forward(origin: string, request: Request, response: Response): Promise<void> {
  const hasBody = !METHODS_WITHOUT_BODY.has(request.method);
  const upstream = await fetch(`${origin}${request.url}`, {
    method: request.method,
    headers: toUpstreamHeaders(request),
    body: hasBody ? await readBody(request) : undefined,
    redirect: 'manual',
  });

  response.status(upstream.status);
  upstream.headers.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name) && name !== 'set-cookie') {
      response.setHeader(name, value);
    }
  });
  const cookies = upstream.headers.getSetCookie();
  if (cookies.length > 0) {
    response.setHeader('set-cookie', cookies);
  }
  response.end(Buffer.from(await upstream.arrayBuffer()));
}

function toUpstreamHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(name)) {
      continue;
    }
    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  return headers;
}

async function readBody(request: Request): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Uint8Array.from(Buffer.concat(chunks));
}

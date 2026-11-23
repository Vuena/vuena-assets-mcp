// Cloudflare Worker: remote MCP endpoint (streamable HTTP) at /mcp; everything else is served as static assets.
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer, type Catalog } from './core.js';
import catalogJson from '../data/catalog.json';

const catalog = catalogJson as unknown as Catalog;

interface Env { ASSETS: { fetch(req: Request): Promise<Response> } }

const CORS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id, authorization',
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version',
};
const withCors = (r: Response) => {
  const h = new Headers(r.headers);
  for (const [k, v] of Object.entries(CORS)) h.set(k, v);
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (req.method === 'GET') {
        // Stateless server: no server-initiated SSE stream. Answer with a short pointer instead of hanging.
        const wantsStream = (req.headers.get('accept') || '').includes('text/event-stream');
        if (wantsStream) return withCors(new Response('This MCP endpoint is stateless; use POST (streamable HTTP).', { status: 405, headers: { allow: 'POST, OPTIONS' } }));
        return withCors(Response.json({ name: 'vuena-assets', transport: 'streamable-http', endpoint: `${url.origin}/mcp`, tools: ['search_assets', 'get_asset', 'list_packs'], docs: `${url.origin}/llms.txt`, models: catalog.count, license: 'CC0-1.0' }));
      }
      const server = createServer(catalog, { transport: 'remote' });
      const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      await server.connect(transport);
      return withCors(await transport.handleRequest(req));
    }
    return env.ASSETS.fetch(req);
  },
};

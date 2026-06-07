import { IncomingMessage, Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import https from 'https';
import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import { createLXCTermProxy } from '../api/endpoints/lxc';

function parseProfileFromUrl(url: string): string | undefined {
  try {
    const params = new URL(url, 'http://localhost').searchParams;
    return params.get('profile') ?? undefined;
  } catch {
    return undefined;
  }
}

function parseQueryParams(url: string): Record<string, string> {
  try {
    const params = new URL(url, 'http://localhost').searchParams;
    const result: Record<string, string> = {};
    params.forEach((v, k) => { result[k] = v; });
    return result;
  } catch {
    return {};
  }
}

export function attachTerminalWebSocket(server: Server, config: Config): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (req: IncomingMessage, socket, head) => {
    const url = req.url ?? '';
    if (!url.startsWith('/ws/terminal/')) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', async (clientWs: WebSocket, req: IncomingMessage) => {
    const url = req.url ?? '';
    const params = parseQueryParams(url);
    const profileName = params['profile'];

    // Extract ctid from path: /ws/terminal/{ctid}
    const match = url.match(/\/ws\/terminal\/(\d+)/);
    if (!match) {
      clientWs.close(4000, 'Invalid URL — expected /ws/terminal/{ctid}');
      return;
    }
    const ctid = parseInt(match[1]!, 10);

    let profile, pveProfile;
    try {
      const resolved = resolveProfile(config, profileName);
      profile = resolved.profile;
      pveProfile = profile;
    } catch (e) {
      clientWs.close(4001, `Profile error: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }

    try {
      // Resolve node and get term proxy ticket
      const client = new ProxmoxClient(pveProfile);
      const { listAllLXC } = await import('../api/endpoints/lxc');
      const containers = await listAllLXC(client);
      const ct = containers.find(c => c.vmid === ctid);
      if (!ct) {
        clientWs.close(4004, `Container ${ctid} not found`);
        return;
      }

      const termProxy = await createLXCTermProxy(client, ct.node, ctid);
      const { ticket, port } = termProxy;

      // Connect to Proxmox WebSocket terminal
      const pveWsUrl = `wss://${pveProfile.host}:${pveProfile.port}/api2/json/nodes/${ct.node}/lxc/${ctid}/vncwebsocket?port=${port}&vncticket=${encodeURIComponent(ticket)}`;

      const pveWs = new WebSocket(pveWsUrl, ['binary'], {
        headers: {
          Authorization: `PVEAPIToken=${pveProfile.API_TOKEN_ID}=${pveProfile.API_TOKEN_SECRET}`,
        },
        rejectUnauthorized: pveProfile.rejectUnauthorized,
        agent: new https.Agent({ rejectUnauthorized: pveProfile.rejectUnauthorized }),
      });

      pveWs.on('open', () => {
        clientWs.send(JSON.stringify({ type: 'connected', ctid, node: ct.node }));
      });

      // Bidirectional proxy
      pveWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      });

      clientWs.on('message', (data) => {
        if (pveWs.readyState === WebSocket.OPEN) {
          pveWs.send(data);
        }
      });

      pveWs.on('close', (code, reason) => {
        clientWs.close(code, reason);
      });

      pveWs.on('error', (err) => {
        clientWs.close(4002, `Proxmox WebSocket error: ${err.message}`);
      });

      clientWs.on('close', () => {
        pveWs.close();
      });

      clientWs.on('error', () => {
        pveWs.close();
      });

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      clientWs.close(4003, `Terminal setup failed: ${msg}`);
    }
  });
}

import http from 'http';
import path from 'path';
import express from 'express';
import { loadConfig } from '../config/loader';
import { configureAuditLog } from '../audit/logger';
import { profileMiddleware } from './middleware/profile';
import { errorHandler } from './middleware/error';
import { vmsRouter } from './routes/vms';
import { lxcRouter } from './routes/lxc';
import { nodesRouter } from './routes/nodes';
import { storageRouter } from './routes/storage';
import { clusterRouter } from './routes/cluster';
import { networkRouter } from './routes/network';
import { accessRouter } from './routes/access';
import { backupRouter } from './routes/backup';
import { firewallRouter } from './routes/firewall';
import { sdnRouter } from './routes/sdn';
import { docsRouter } from './routes/docs';
import { sseRouter } from './sse';
import { attachTerminalWebSocket } from './terminal';
import { version } from '../../package.json';


const app = express();
app.use(express.json());

let config: ReturnType<typeof loadConfig>;
try {
  config = loadConfig();
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`Failed to load config: ${msg}`);
  process.exit(1);
}
configureAuditLog(config.auditLog.path);

const PORT = process.env['SERVER_PORT'] ? parseInt(process.env['SERVER_PORT'], 10) : config.serverPort;

app.use(profileMiddleware(config));

app.get('/health', (_req, res) => {
  res.json({ ok: true, version });
});

app.use('/api/vms', vmsRouter(config));
app.use('/api/lxc', lxcRouter(config));
app.use('/api/nodes', nodesRouter(config));
app.use('/api/storage', storageRouter(config));
app.use('/api/cluster', clusterRouter(config));
app.use('/api/network', networkRouter(config));
app.use('/api/access', accessRouter(config));
app.use('/api/backup', backupRouter(config));
app.use('/api/firewall', firewallRouter(config));
app.use('/api/sdn', sdnRouter(config));
app.use('/api/docs', docsRouter());
app.use('/api', sseRouter(config));

app.get('/llms.txt', (_req, res) => {
  res.type('text/plain').send([
    '# proxmox-manager',
    '',
    'A safe, audited CLI and Web UI for managing Proxmox VE from your terminal. Built with TypeScript.',
    '',
    '## Capabilities',
    '',
    '- Multi-profile management of multiple Proxmox VE instances',
    '- Full VM lifecycle: create, start, stop, shutdown, reboot, suspend, resume, clone, migrate, snapshot, resize, delete',
    '- Full LXC lifecycle: same as VMs plus exec (run commands inside containers)',
    '- Node management: status, services, tasks, shutdown/reboot with workload warnings',
    '- Storage: list pools, inspect content, upload ISOs/templates, list backups',
    '- Cluster: status, resource inventory, HA states',
    '- Network: list and inspect interfaces per node',
    '- Access: users, groups, roles, API tokens (list + write)',
    '- Firewall: cluster-level, per-VM, per-LXC rules (list + write)',
    '- SDN: zones, VNets, subnets',
    '- Backup jobs: list, create, delete vzdump scheduled jobs',
    '- Audit log: every action appended as a JSON line',
    '- Safeguards: protected resource lists, dry-run mode, interactive confirmation',
    '- Web UI: React + Vite frontend with full resource management',
    '',
    '## Setup docs',
    '',
    '- /api/docs/setup/quickstart.md — Install, configure, and run ./pm doctor',
    '- /api/docs/setup/proxmox-api-tokens.md — Create Proxmox API tokens step by step',
    '- /api/docs/setup/configuration.md — Full config.json schema with examples',
    '- /api/docs/setup/web-ui.md — Run the Web UI in dev and production',
    '- /api/docs/setup/troubleshooting.md — Common errors and fixes',
    '',
    '## Command reference',
    '',
    '- /api/docs/vm.md — VM commands',
    '- /api/docs/lxc.md — LXC commands',
    '- /api/docs/node.md — Node commands',
    '- /api/docs/storage.md — Storage commands',
    '- /api/docs/cluster.md — Cluster commands',
    '- /api/docs/network.md — Network commands',
    '- /api/docs/access.md — Access commands',
    '- /api/docs/backup.md — Backup commands',
    '- /api/docs/firewall.md — Firewall commands',
    '- /api/docs/sdn.md — SDN commands',
    '',
    '## Full context',
    '',
    'GET /api/docs/llms-context — Returns all setup guides as a single markdown string',
  ].join('\n'));
});

const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

app.use(errorHandler);

const server = http.createServer(app);
attachTerminalWebSocket(server, config);

server.listen(PORT, () => {
  console.log(`proxmox-manager web server running on http://localhost:${PORT}`);
  console.log(`Profile: ${config.defaultProfile ?? '(none set)'}`);
  console.log(`WebSocket terminal: ws://localhost:${PORT}/ws/terminal/{ctid}`);
});

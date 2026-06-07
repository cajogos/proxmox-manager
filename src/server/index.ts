import express from 'express';
import { loadConfig } from '../config/loader';
import { configureAuditLog } from '../audit/logger';
import { profileMiddleware } from './middleware/profile';
import { errorHandler } from './middleware/error';
import { vmsRouter } from './routes/vms';
import { lxcRouter } from './routes/lxc';
import { nodesRouter } from './routes/nodes';
import { storageRouter } from './routes/storage';
import { version } from '../../package.json';

const PORT = parseInt(process.env.SERVER_PORT ?? '3000', 10);

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

app.use(profileMiddleware(config));

app.get('/health', (_req, res) => {
  res.json({ ok: true, version });
});

app.use('/api/vms', vmsRouter(config));
app.use('/api/lxc', lxcRouter(config));
app.use('/api/nodes', nodesRouter(config));
app.use('/api/storage', storageRouter(config));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`proxmox-manager web server running on http://localhost:${PORT}`);
  console.log(`Profile: ${config.defaultProfile ?? '(none set)'}`);
});

import express from 'express';
import { loadConfig } from '../config/loader';
import { configureAuditLog, audit } from '../audit/logger';
import { getVMs } from '../services/vm';

const PORT = parseInt(process.env.SERVER_PORT ?? '3000', 10);

const app = express();
app.use(express.json());

let config = loadConfig();
configureAuditLog(config.auditLog.path);

app.get('/health', (_req, res) => {
  res.json({ ok: true, version: '0.1.0' });
});

app.get('/api/vms', async (req, res) => {
  const profileName = req.query.profile as string | undefined;
  const result = await getVMs(config, profileName);

  audit({
    timestamp: new Date().toISOString(),
    profile: profileName ?? config.defaultProfile ?? 'default',
    command: 'vm list',
    resource: { type: 'vm' },
    dryRun: false,
    result: result.ok ? 'success' : 'failed',
    error: result.ok ? null : result.error,
    source: 'web',
  });

  if (!result.ok) {
    res.status(500).json({ ok: false, error: result.error });
    return;
  }

  res.json({ ok: true, data: result.data });
});

app.listen(PORT, () => {
  console.log(`proxmox-manager web server running on http://localhost:${PORT}`);
  console.log(`Profile: ${config.defaultProfile ?? '(none set)'}`);
});

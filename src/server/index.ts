import express from 'express';
import { loadConfig, resolveProfile } from '../config/loader';
import { configureAuditLog, audit } from '../audit/logger';
import { getVMs } from '../services/vm';
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

app.get('/health', (_req, res) => {
  res.json({ ok: true, version });
});

app.get('/api/vms', async (req, res) => {
  const profileName = req.query.profile as string | undefined;
  const result = await getVMs(config, profileName);

  let resolvedProfile: string;
  try {
    resolvedProfile = resolveProfile(config, profileName).name;
  } catch {
    resolvedProfile = profileName ?? config.defaultProfile ?? 'default';
  }

  audit({
    timestamp: new Date().toISOString(),
    profile: resolvedProfile,
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

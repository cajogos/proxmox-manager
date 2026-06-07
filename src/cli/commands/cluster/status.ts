import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listClusterStatusService } from '../../../services/cluster';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg, statusColor } from '../../../output/colors';

interface ClusterStatusOptions {
  profile?: string;
  format: string;
}

export async function clusterStatus(opts: ClusterStatusOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'cluster status',
    resource: { type: 'cluster' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching cluster status…');
  const result = await listClusterStatusService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(e => ({
    Name: e.name,
    Type: e.type,
    ID: e.id,
    Online: e.online != null ? statusColor(e.online ? 'online' : 'offline') : '-',
    IP: e.ip ?? '-',
    Quorate: e.quorate != null ? (e.quorate ? 'yes' : 'no') : '-',
    Nodes: e.nodes ?? '-',
  }));

  const nodes = result.data.filter(e => e.type === 'node');
  const online = nodes.filter(e => e.online === 1).length;
  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: nodes.length > 0
      ? `${nodes.length} node(s) — ${online} online · ${nodes.length - online} offline`
      : undefined,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

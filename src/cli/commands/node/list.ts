import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listNodesService } from '../../../services/node';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg, statusColor } from '../../../output/colors';
import { humanBytes, humanSeconds } from '../../../output/humanize';

interface NodeListOptions {
  profile?: string;
  format: string;
}

export async function nodeList(opts: NodeListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node list',
    resource: { type: 'node' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching nodes…');
  const result = await listNodesService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(n => ({
    Name: n.node,
    Status: statusColor(n.status),
    'CPU%': n.cpu != null ? `${(n.cpu * 100).toFixed(1)}%` : '-',
    Memory: n.mem != null && n.maxmem != null
      ? `${humanBytes(n.mem)} / ${humanBytes(n.maxmem)}`
      : '-',
    Disk: n.disk != null && n.maxdisk != null
      ? `${humanBytes(n.disk)} / ${humanBytes(n.maxdisk)}`
      : '-',
    Uptime: n.uptime != null ? humanSeconds(n.uptime) : '-',
  }));

  const online = result.data.filter(n => n.status === 'online').length;
  const total = result.data.length;

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${total} node${total !== 1 ? 's' : ''} — ${online} online · ${total - online} offline`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

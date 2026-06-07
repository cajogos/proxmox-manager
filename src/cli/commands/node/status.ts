import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getNodeDetailService } from '../../../services/node';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg, statusColor } from '../../../output/colors';
import { humanBytes, humanSeconds } from '../../../output/humanize';

interface NodeStatusOptions {
  profile?: string;
  format: string;
}

export async function nodeStatus(node: string, opts: NodeStatusOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node status',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching status for node ${node}…`);
  const result = await getNodeDetailService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const d = result.data;
  const rows = [
    { Field: 'Node', Value: d.node },
    { Field: 'Status', Value: statusColor(d.status) },
    { Field: 'CPU', Value: d.cpu != null ? `${(d.cpu * 100).toFixed(1)}%` : '-' },
    {
      Field: 'Memory',
      Value: d.memory != null
        ? `${humanBytes(d.memory.used)} / ${humanBytes(d.memory.total)}`
        : d.mem != null && d.maxmem != null
          ? `${humanBytes(d.mem)} / ${humanBytes(d.maxmem)}`
          : '-',
    },
    {
      Field: 'Swap',
      Value: d.swap != null
        ? `${humanBytes(d.swap.used)} / ${humanBytes(d.swap.total)}`
        : '-',
    },
    { Field: 'Disk', Value: d.disk != null && d.maxdisk != null ? `${humanBytes(d.disk)} / ${humanBytes(d.maxdisk)}` : '-' },
    { Field: 'Uptime', Value: d.uptime != null ? humanSeconds(d.uptime) : '-' },
    { Field: 'PVE Version', Value: d.pveversion ?? '-' },
    { Field: 'Kernel', Value: d.kversion ?? '-' },
    { Field: 'Load Avg', Value: d.loadavg ? d.loadavg.join(', ') : '-' },
    { Field: 'CPUs', Value: d.cpuinfo != null ? `${d.cpuinfo.cpus} (${d.cpuinfo.sockets}s × ${d.cpuinfo.cores}c)` : '-' },
    { Field: 'CPU Model', Value: d.cpuinfo?.model ?? '-' },
  ];

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

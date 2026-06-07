import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listClusterResourcesService } from '../../../services/cluster';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg, statusColor } from '../../../output/colors';
import { humanBytes } from '../../../output/humanize';

interface ClusterResourcesOptions {
  profile?: string;
  format: string;
  type?: string;
}

export async function clusterResources(opts: ClusterResourcesOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'cluster resources',
    resource: { type: 'cluster' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching cluster resources…');
  const result = await listClusterResourcesService(config, {
    profile: opts.profile,
    resourceType: opts.type,
  });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(r => ({
    ID: r.id,
    Type: r.type,
    Node: r.node ?? '-',
    Name: r.name ?? '-',
    Status: r.status ? statusColor(r.status) : '-',
    CPUs: r.maxcpu ?? '-',
    Memory: r.maxmem != null ? humanBytes(r.maxmem) : '-',
    Pool: r.pool ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} resource(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

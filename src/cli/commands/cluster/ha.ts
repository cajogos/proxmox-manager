import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listHAStatusService } from '../../../services/cluster';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg, statusColor } from '../../../output/colors';

interface ClusterHAOptions {
  profile?: string;
  format: string;
}

export async function clusterHA(opts: ClusterHAOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'cluster ha',
    resource: { type: 'cluster' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching HA status…');
  const result = await listHAStatusService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(e => ({
    SID: e.sid,
    Type: e.type ?? '-',
    State: statusColor(e.state),
    Node: e.node ?? '-',
    'CRM State': e.crm_state ?? '-',
    'LRM State': e.lrm_state ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} HA resource(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

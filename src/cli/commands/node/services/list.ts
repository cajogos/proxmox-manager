import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listServicesService } from '../../../../services/node';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg, statusColor } from '../../../../output/colors';

interface NodeServicesListOptions {
  profile?: string;
  format: string;
}

export async function nodeServicesList(node: string, opts: NodeServicesListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node services list',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching services on ${node}…`);
  const result = await listServicesService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(s => ({
    Service: s.name,
    Description: s.desc ?? '-',
    State: statusColor(s.state),
    'Unit State': s['unit-file-state'] ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

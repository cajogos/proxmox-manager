import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getLXCStatusService } from '../../../services/lxc';
import { output, OutputFormat } from '../../../output/formatter';
import { statusColor, errorMsg } from '../../../output/colors';
import { humanMB, humanSeconds } from '../../../output/humanize';
import { startSpinner } from '../../../output/spinner';

interface LXCStatusOptions {
  profile?: string;
  format: OutputFormat;
  node?: string;
}

export async function lxcStatus(ctid: number, opts: LXCStatusOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc status',
    resource: { type: 'container', id: ctid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching status for container ${ctid}…`);
  const result = await getLXCStatusService(config, ctid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const ct = result.data;
  const isTable = opts.format === 'table';
  const rows = [{
    CTID: ct.vmid,
    Name: ct.name ?? '(unnamed)',
    Status: isTable ? statusColor(ct.status) : ct.status,
    Node: ct.node,
    CPUs: ct.cpus ?? '-',
    Memory: ct.maxmem ? humanMB(Math.round(ct.maxmem / 1024 / 1024)) : '-',
    Uptime: ct.uptime ? humanSeconds(ct.uptime) : '-',
  }];

  output(rows as Record<string, unknown>[], opts.format);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

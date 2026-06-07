import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getStorageStatusService } from '../../../services/storage';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';
import { humanBytes } from '../../../output/humanize';

interface StorageStatusOptions {
  profile?: string;
  format: string;
  node?: string;
}

export async function storageStatus(storage: string, opts: StorageStatusOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage status',
    resource: { type: 'storage', id: storage },
    dryRun: false,
    source: 'cli' as const,
  };

  if (!opts.node) {
    console.error(errorMsg('--node <name> is required for storage status'));
    process.exit(1);
  }

  const spinner = startSpinner(`Fetching status for ${storage} on ${opts.node}…`);
  const result = await getStorageStatusService(config, storage, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const d = result.data;
  const usedPct = d.total && d.total > 0
    ? `${(((d.used ?? 0) / d.total) * 100).toFixed(1)}%`
    : '-';

  const rows = [
    { Field: 'Storage', Value: d.storage },
    { Field: 'Type', Value: d.type },
    { Field: 'Content', Value: d.content ?? '-' },
    { Field: 'Total', Value: d.total != null ? humanBytes(d.total) : '-' },
    { Field: 'Used', Value: d.used != null ? humanBytes(d.used) : '-' },
    { Field: 'Available', Value: d.avail != null ? humanBytes(d.avail) : '-' },
    { Field: 'Used%', Value: usedPct },
    { Field: 'Active', Value: d.active != null ? (d.active ? 'yes' : 'no') : '-' },
    { Field: 'Enabled', Value: d.enabled != null ? (d.enabled ? 'yes' : 'no') : '-' },
  ];

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

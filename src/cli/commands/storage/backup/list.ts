import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listBackupsService } from '../../../../services/storage';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';
import { humanBytes } from '../../../../output/humanize';

interface BackupListOptions {
  profile?: string;
  format: string;
}

export async function storageBackupList(opts: BackupListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage backup list',
    resource: { type: 'storage' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching backups across all nodes…');
  const result = await listBackupsService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(b => ({
    Volume: b.volid,
    Format: b.format ?? '-',
    Size: b.size != null ? humanBytes(b.size) : '-',
    VMID: b.vmid ?? '-',
    Notes: b.notes ?? '-',
    Created: b.ctime != null ? new Date(b.ctime * 1000).toISOString().slice(0, 10) : '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} backup(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

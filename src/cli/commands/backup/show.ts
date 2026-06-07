import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getBackupJobService } from '../../../services/vzdump';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';

interface BackupShowOptions {
  profile?: string;
  format: string;
}

export async function backupShow(id: string, opts: BackupShowOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'backup show',
    resource: { type: 'backup-job', id },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching backup job ${id}…`);
  const result = await getBackupJobService(config, id, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const j = result.data;
  const rows = [
    { Field: 'ID', Value: j.id },
    { Field: 'Enabled', Value: j.enabled !== 0 ? 'yes' : 'no' },
    { Field: 'Schedule', Value: j.schedule ?? '-' },
    { Field: 'Storage', Value: j.storage },
    { Field: 'Node', Value: j.node ?? 'all' },
    { Field: 'VMIDs', Value: j.vmid ?? 'all' },
    { Field: 'Mode', Value: j.mode ?? '-' },
    { Field: 'Compress', Value: j.compress ?? '-' },
    { Field: 'Mail Notification', Value: j.mailnotification ?? '-' },
    { Field: 'Mail To', Value: j.mailto ?? '-' },
  ];

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

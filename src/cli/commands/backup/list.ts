import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listBackupJobsService } from '../../../services/vzdump';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';
import chalk from 'chalk';

interface BackupListOptions {
  profile?: string;
  format: string;
}

export async function backupList(opts: BackupListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'backup list',
    resource: { type: 'backup-job' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching backup jobs…');
  const result = await listBackupJobsService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data.map(j => ({
    ID: j.id,
    Enabled: j.enabled !== 0
      ? (isTable ? chalk.green('yes') : 'yes')
      : (isTable ? chalk.dim('no') : 'no'),
    Schedule: j.schedule ?? '-',
    Storage: j.storage,
    Node: j.node ?? 'all',
    VMIDs: j.vmid ?? 'all',
    Mode: j.mode ?? '-',
    Compress: j.compress ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} backup job(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

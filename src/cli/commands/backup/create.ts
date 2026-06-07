import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { createBackupJobService } from '../../../services/vzdump';
import { startSpinner } from '../../../output/spinner';
import { confirmAction } from '../../../safeguards/confirm';
import { errorMsg, successMsg } from '../../../output/colors';

interface BackupCreateOptions {
  profile?: string;
  storage: string;
  schedule?: string;
  node?: string;
  vmid?: string;
  mode?: 'snapshot' | 'suspend' | 'stop';
  compress?: string;
  yes?: boolean;
}

export async function backupCreate(opts: BackupCreateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'backup create',
    resource: { type: 'backup-job', storage: opts.storage },
    dryRun: false,
    source: 'cli' as const,
  };

  const confirmed = await confirmAction('create', `backup job on storage ${opts.storage}`, opts.yes ?? false);
  if (!confirmed) {
    console.log('Aborted.');
    return;
  }

  const spinner = startSpinner('Creating backup job…');
  const result = await createBackupJobService(config, {
    storage: opts.storage,
    schedule: opts.schedule,
    node: opts.node,
    vmid: opts.vmid,
    mode: opts.mode,
    compress: opts.compress as 'none' | 'gzip' | 'lzo' | 'zstd' | undefined,
  }, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg('Backup job created.'));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

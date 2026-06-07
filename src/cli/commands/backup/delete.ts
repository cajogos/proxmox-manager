import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { deleteBackupJobService } from '../../../services/vzdump';
import { startSpinner } from '../../../output/spinner';
import { confirmAction } from '../../../safeguards/confirm';
import { errorMsg, successMsg } from '../../../output/colors';

interface BackupDeleteOptions {
  profile?: string;
  yes?: boolean;
}

export async function backupDelete(id: string, opts: BackupDeleteOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'backup delete',
    resource: { type: 'backup-job', id },
    dryRun: false,
    source: 'cli' as const,
  };

  const confirmed = await confirmAction('delete', `backup job ${id}`, opts.yes ?? false);
  if (!confirmed) {
    console.log('Aborted.');
    return;
  }

  const spinner = startSpinner(`Deleting backup job ${id}…`);
  const result = await deleteBackupJobService(config, id, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Backup job ${id} deleted.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

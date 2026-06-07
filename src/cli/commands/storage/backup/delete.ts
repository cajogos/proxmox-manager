import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { deleteStorageContentService } from '../../../../services/storage';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg } from '../../../../output/colors';

interface BackupDeleteOptions {
  profile?: string;
  node: string;
  storage: string;
  yes: boolean;
}

export async function storageBackupDelete(volid: string, opts: BackupDeleteOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage backup delete',
    resource: { type: 'storage', id: opts.storage },
    dryRun: false,
    source: 'cli' as const,
  };

  const confirmed = await confirmAction('Delete backup', volid, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting backup ${volid}…`);
  const result = await deleteStorageContentService(config, opts.storage, volid, {
    profile: opts.profile,
    node: opts.node,
  });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Backup ${volid} deleted.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

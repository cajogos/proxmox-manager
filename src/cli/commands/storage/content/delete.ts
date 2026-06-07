import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { deleteStorageContentService } from '../../../../services/storage';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg } from '../../../../output/colors';

interface StorageContentDeleteOptions {
  profile?: string;
  node?: string;
  yes: boolean;
}

export async function storageContentDelete(
  storage: string,
  volid: string,
  opts: StorageContentDeleteOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage content delete',
    resource: { type: 'storage', id: storage },
    dryRun: false,
    source: 'cli' as const,
  };

  if (!opts.node) {
    console.error(errorMsg('--node <name> is required for content delete'));
    process.exit(1);
  }

  const confirmed = await confirmAction('Delete storage content', volid, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting ${volid}…`);
  const result = await deleteStorageContentService(config, storage, volid, {
    profile: opts.profile,
    node: opts.node,
  });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Deleted ${volid} from ${storage}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

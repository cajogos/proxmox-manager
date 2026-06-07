import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { migrateVMService } from '../../../services/vm';
import { checkProtected } from '../../../safeguards/protected';
import { checkDryRun } from '../../../safeguards/dryRun';
import { confirmAction } from '../../../safeguards/confirm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';

interface VMMigrateOptions {
  profile?: string;
  node?: string;
  online?: boolean;
  withLocalDisks?: boolean;
  dryRun: boolean;
  yes: boolean;
}

export async function vmMigrate(vmid: number, targetNode: string, opts: VMMigrateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm migrate',
    resource: { type: 'vm', id: vmid },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  try {
    checkProtected('vm', vmid, profile.safeguards);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error });
    console.error(errorMsg(error));
    process.exit(1);
  }

  if (checkDryRun(opts.dryRun, 'migrate VM', String(vmid))) {
    console.log(dryRunMsg(`Would migrate VM ${vmid} to node ${targetNode}${opts.online ? ' (live)' : ''}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Migrate VM', `${vmid} → ${targetNode}`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Migrating VM ${vmid} to ${targetNode}…`);
  const result = await migrateVMService(
    config,
    vmid,
    {
      target: targetNode,
      online: opts.online,
      'with-local-disks': opts.withLocalDisks,
    },
    { profile: opts.profile, node: opts.node },
  );
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Migration started. Task: ${result.data.upid}`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

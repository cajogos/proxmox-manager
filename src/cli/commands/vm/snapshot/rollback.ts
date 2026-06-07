import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { rollbackSnapshotService } from '../../../../services/vm';
import { checkProtected } from '../../../../safeguards/protected';
import { checkDryRun } from '../../../../safeguards/dryRun';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg, warnMsg } from '../../../../output/colors';

interface SnapshotRollbackOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function snapshotRollback(vmid: number, name: string, opts: SnapshotRollbackOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm snapshot rollback',
    resource: { type: 'vm', id: vmid, name },
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

  if (checkDryRun(opts.dryRun, 'rollback snapshot', `${vmid}@${name}`)) {
    console.log(dryRunMsg(`Would roll back VM ${vmid} to snapshot "${name}". Current state will be lost.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  console.warn(warnMsg(`Rolling back VM ${vmid} to snapshot "${name}" will overwrite its current state. This cannot be undone.`));

  const confirmed = await confirmAction('Roll back VM to snapshot', `"${name}" (VM ${vmid})`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Rolling back VM ${vmid} to snapshot "${name}"…`);
  const result = await rollbackSnapshotService(config, vmid, name, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`VM ${vmid} rolled back to snapshot "${name}".`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

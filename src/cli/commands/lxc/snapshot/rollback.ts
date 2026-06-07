import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { rollbackLXCSnapshotService } from '../../../../services/lxc';
import { checkProtected } from '../../../../safeguards/protected';
import { checkDryRun } from '../../../../safeguards/dryRun';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg, warnMsg } from '../../../../output/colors';

interface LXCSnapshotRollbackOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function lxcSnapshotRollback(ctid: number, name: string, opts: LXCSnapshotRollbackOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc snapshot rollback',
    resource: { type: 'container', id: ctid, name },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  try {
    checkProtected('container', ctid, profile.safeguards);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error });
    console.error(errorMsg(error));
    process.exit(1);
  }

  if (checkDryRun(opts.dryRun, 'rollback snapshot', `${ctid}@${name}`)) {
    console.log(dryRunMsg(`Would roll back container ${ctid} to snapshot "${name}". Current state will be lost.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  console.warn(warnMsg(`Rolling back container ${ctid} to snapshot "${name}" will overwrite its current state. This cannot be undone.`));

  const confirmed = await confirmAction('Roll back container to snapshot', `"${name}" (container ${ctid})`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Rolling back container ${ctid} to snapshot "${name}"…`);
  const result = await rollbackLXCSnapshotService(config, ctid, name, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Container ${ctid} rolled back to snapshot "${name}".`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

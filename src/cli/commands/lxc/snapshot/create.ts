import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { createLXCSnapshotService } from '../../../../services/lxc';
import { checkDryRun } from '../../../../safeguards/dryRun';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../../output/colors';

interface LXCSnapshotCreateOptions {
  profile?: string;
  node?: string;
  description?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function lxcSnapshotCreate(ctid: number, name: string, opts: LXCSnapshotCreateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc snapshot create',
    resource: { type: 'container', id: ctid, name },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'create snapshot', `${ctid}@${name}`)) {
    console.log(dryRunMsg(`Would create snapshot "${name}" on container ${ctid}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Create snapshot', `"${name}" on container ${ctid}`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Creating snapshot "${name}" on container ${ctid}…`);
  const result = await createLXCSnapshotService(config, ctid, name, {
    profile: opts.profile,
    node: opts.node,
    description: opts.description,
  });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Snapshot "${name}" created on container ${ctid}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

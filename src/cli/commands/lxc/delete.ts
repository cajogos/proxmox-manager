import prompts from 'prompts';
import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getLXCStatusService, deleteLXCService } from '../../../services/lxc';
import { checkProtected } from '../../../safeguards/protected';
import { checkDryRun } from '../../../safeguards/dryRun';
import { confirmAction } from '../../../safeguards/confirm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg, warnMsg } from '../../../output/colors';

interface LXCDeleteOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function lxcDelete(ctid: number, opts: LXCDeleteOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc delete',
    resource: { type: 'container', id: ctid },
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

  if (checkDryRun(opts.dryRun, 'delete container', String(ctid))) {
    console.log(dryRunMsg(`Would permanently delete container ${ctid}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const lookupSpinner = startSpinner(`Resolving container ${ctid}…`);
  const statusResult = await getLXCStatusService(config, ctid, { profile: opts.profile, node: opts.node });
  lookupSpinner.stop();

  if (!statusResult.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: statusResult.error });
    console.error(errorMsg(statusResult.error));
    process.exit(1);
  }

  const ctName = statusResult.data.name ?? String(ctid);

  console.warn(warnMsg(`This will permanently delete container ${chalk.bold(ctid)} (${chalk.bold(ctName)}) and all its data.`));

  const confirmed = await confirmAction('Permanently delete container', `${ctid} (${ctName})`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const { typed } = await prompts({
    type: 'text',
    name: 'typed',
    message: `Type the container name ${chalk.bold(ctName)} to confirm deletion:`,
  });

  if (typed !== ctName) {
    console.log('Name did not match — deletion cancelled.');
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting container ${ctid}…`);
  const result = await deleteLXCService(config, ctid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Container ${ctid} deleted.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import prompts from 'prompts';
import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getVMStatusService, deleteVMService } from '../../../services/vm';
import { checkProtected } from '../../../safeguards/protected';
import { checkDryRun } from '../../../safeguards/dryRun';
import { confirmAction } from '../../../safeguards/confirm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg, warnMsg } from '../../../output/colors';

interface VMDeleteOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function vmDelete(vmid: number, opts: VMDeleteOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm delete',
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

  if (checkDryRun(opts.dryRun, 'delete VM', String(vmid))) {
    console.log(dryRunMsg(`Would permanently delete VM ${vmid}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  // Resolve the VM name for the double-confirmation prompt
  const lookupSpinner = startSpinner(`Resolving VM ${vmid}…`);
  const statusResult = await getVMStatusService(config, vmid, { profile: opts.profile, node: opts.node });
  lookupSpinner.stop();

  if (!statusResult.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: statusResult.error });
    console.error(errorMsg(statusResult.error));
    process.exit(1);
  }

  const vmName = statusResult.data.name ?? String(vmid);

  console.warn(warnMsg(`This will permanently delete VM ${chalk.bold(vmid)} (${chalk.bold(vmName)}) and all its data.`));

  const confirmed = await confirmAction('Permanently delete VM', `${vmid} (${vmName})`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  // Double-confirmation: user must type the VM name
  const { typed } = await prompts({
    type: 'text',
    name: 'typed',
    message: `Type the VM name ${chalk.bold(vmName)} to confirm deletion:`,
  });

  if (typed !== vmName) {
    console.log('Name did not match — deletion cancelled.');
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting VM ${vmid}…`);
  const result = await deleteVMService(config, vmid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`VM ${vmid} deleted.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

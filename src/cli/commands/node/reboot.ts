import prompts from 'prompts';
import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { nodeRebootService } from '../../../services/node';
import { checkProtected } from '../../../safeguards/protected';
import { checkDryRun } from '../../../safeguards/dryRun';
import { confirmAction } from '../../../safeguards/confirm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg, warnMsg } from '../../../output/colors';
import { listAllVMs } from '../../../api/endpoints/vm';
import { listAllLXC } from '../../../api/endpoints/lxc';
import { ProxmoxClient } from '../../../api/client';

interface NodeRebootOptions {
  profile?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function nodeReboot(node: string, opts: NodeRebootOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node reboot',
    resource: { type: 'node', id: node },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  try {
    checkProtected('node', node, profile.safeguards);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error });
    console.error(errorMsg(error));
    process.exit(1);
  }

  if (checkDryRun(opts.dryRun, 'reboot node', node)) {
    console.log(dryRunMsg(`Would reboot node ${node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const lookupSpinner = startSpinner(`Checking workloads on ${node}…`);
  let affectedCount = 0;
  try {
    const client = new ProxmoxClient(profile);
    const [vms, lxcs] = await Promise.all([listAllVMs(client), listAllLXC(client)]);
    affectedCount = vms.filter(v => v.node === node && v.status === 'running').length
      + lxcs.filter(c => c.node === node && c.status === 'running').length;
  } catch {
    // best-effort
  }
  lookupSpinner.stop();

  console.warn(warnMsg(
    `Rebooting node ${chalk.bold(node)} will interrupt all ${affectedCount} running workload(s). The host will come back online after reboot.`,
  ));

  const confirmed = await confirmAction('Reboot node', node, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const { typed } = await prompts({
    type: 'text',
    name: 'typed',
    message: `Type ${chalk.bold('"I understand"')} to confirm node reboot:`,
  });

  if ((typed ?? '').trim().toLowerCase() !== 'i understand') {
    console.log('Confirmation did not match — reboot cancelled.');
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Rebooting node ${node}…`);
  const result = await nodeRebootService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Node ${node} reboot initiated.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

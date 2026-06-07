import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { vmActionService } from '../../../services/vm';
import { checkProtected } from '../../../safeguards/protected';
import { checkDryRun } from '../../../safeguards/dryRun';
import { confirmAction } from '../../../safeguards/confirm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';

interface VMActionOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function vmReboot(vmid: number, opts: VMActionOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm reboot',
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

  if (checkDryRun(opts.dryRun, 'reboot VM', String(vmid))) {
    console.log(dryRunMsg(`Would reboot VM ${vmid}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Reboot VM', String(vmid), opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Rebooting VM ${vmid}…`);
  const result = await vmActionService(config, vmid, 'reboot', { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`VM ${vmid} reboot initiated.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

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

export async function vmSuspend(vmid: number, opts: VMActionOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName, profile } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm suspend',
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

  if (checkDryRun(opts.dryRun, 'suspend VM', String(vmid))) {
    console.log(dryRunMsg(`Would suspend VM ${vmid}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Suspend VM', String(vmid), opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Suspending VM ${vmid}…`);
  const result = await vmActionService(config, vmid, 'suspend', { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`VM ${vmid} suspended.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

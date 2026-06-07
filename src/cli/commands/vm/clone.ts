import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { cloneVMService } from '../../../services/vm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface VMCloneOptions {
  profile?: string;
  node?: string;
  name?: string;
  target?: string;
  full?: boolean;
  storage?: string;
  description?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function vmClone(vmid: number, newid: number, opts: VMCloneOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm clone',
    resource: { type: 'vm', id: vmid },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'clone VM', String(vmid))) {
    console.log(dryRunMsg(`Would clone VM ${vmid} → new VM ${newid}${opts.name ? ` (${opts.name})` : ''}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Cloning VM ${vmid} → ${newid}…`);
  const result = await cloneVMService(
    config,
    vmid,
    {
      newid,
      name: opts.name,
      target: opts.target,
      full: opts.full,
      storage: opts.storage,
      description: opts.description,
    },
    { profile: opts.profile, node: opts.node },
  );
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Clone started. Task: ${result.data}`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

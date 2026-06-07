import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { cloneLXCService } from '../../../services/lxc';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface LXCCloneOptions {
  profile?: string;
  node?: string;
  hostname?: string;
  target?: string;
  full?: boolean;
  storage?: string;
  description?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function lxcClone(ctid: number, newid: number, opts: LXCCloneOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc clone',
    resource: { type: 'lxc', id: ctid },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'clone container', String(ctid))) {
    console.log(dryRunMsg(`Would clone container ${ctid} → new container ${newid}${opts.hostname ? ` (${opts.hostname})` : ''}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Cloning container ${ctid} → ${newid}…`);
  const result = await cloneLXCService(
    config,
    ctid,
    {
      newid,
      hostname: opts.hostname,
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

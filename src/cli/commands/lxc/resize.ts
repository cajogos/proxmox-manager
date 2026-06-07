import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { resizeLXCDiskService } from '../../../services/lxc';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface LXCResizeOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
}

export async function lxcResize(ctid: number, disk: string, size: string, opts: LXCResizeOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc resize',
    resource: { type: 'lxc', id: ctid },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'resize disk', `Container ${ctid} disk ${disk} → ${size}`)) {
    console.log(dryRunMsg(`Would resize disk ${disk} on container ${ctid} to ${size}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Resizing disk ${disk} on container ${ctid} to ${size}…`);
  const result = await resizeLXCDiskService(config, ctid, disk, size, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Disk ${disk} on container ${ctid} resized to ${size}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

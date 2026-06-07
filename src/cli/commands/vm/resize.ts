import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { resizeVMDiskService } from '../../../services/vm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface VMResizeOptions {
  profile?: string;
  node?: string;
  dryRun: boolean;
}

export async function vmResize(vmid: number, disk: string, size: string, opts: VMResizeOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm resize',
    resource: { type: 'vm', id: vmid },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'resize disk', `VM ${vmid} disk ${disk} → ${size}`)) {
    console.log(dryRunMsg(`Would resize disk ${disk} on VM ${vmid} to ${size}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Resizing disk ${disk} on VM ${vmid} to ${size}…`);
  const result = await resizeVMDiskService(config, vmid, disk, size, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Disk ${disk} on VM ${vmid} resized to ${size}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { createLXCService } from '../../../services/lxc';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface LXCCreateOptions {
  profile?: string;
  node: string;
  vmid?: number;
  template: string;
  rootfs: string;
  memory?: number;
  cores?: number;
  password?: string;
  net?: string;
  unprivileged: boolean;
  start: boolean;
  dryRun: boolean;
}

export async function lxcCreate(hostname: string, opts: LXCCreateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc create',
    resource: { type: 'lxc' },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'create LXC container', hostname)) {
    console.log(dryRunMsg(`Would create LXC container "${hostname}" on node ${opts.node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Creating LXC container "${hostname}" on ${opts.node}…`);
  const result = await createLXCService(
    config,
    {
      hostname,
      vmid: opts.vmid,
      ostemplate: opts.template,
      rootfs: opts.rootfs,
      memory: opts.memory,
      cores: opts.cores,
      password: opts.password,
      net: opts.net,
      unprivileged: opts.unprivileged,
      start: opts.start,
    },
    { profile: opts.profile, node: opts.node },
  );
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const { vmid, node, upid } = result.data;
  console.log(successMsg(`Container ${vmid} created on ${node}. Task: ${upid}`));
  audit({ ...auditBase, resource: { type: 'lxc', id: String(vmid) }, timestamp: new Date().toISOString(), result: 'success', error: null });
}

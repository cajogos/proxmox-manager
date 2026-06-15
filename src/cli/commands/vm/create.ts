import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { createVMService } from '../../../services/vm';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface VMCreateOptions {
  profile?: string;
  node: string;
  vmid?: number;
  memory?: number;
  cores?: number;
  sockets?: number;
  cpu?: string;
  ostype?: string;
  disk?: string;
  iso?: string;
  net?: string;
  start: boolean;
  dryRun: boolean;
}

export async function vmCreate(name: string, opts: VMCreateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm create',
    resource: { type: 'vm' },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'create VM', name)) {
    console.log(dryRunMsg(`Would create VM "${name}" on node ${opts.node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Creating VM "${name}" on ${opts.node}…`);
  const result = await createVMService(
    config,
    {
      name,
      vmid: opts.vmid,
      memory: opts.memory,
      cores: opts.cores,
      sockets: opts.sockets,
      cpu: opts.cpu,
      ostype: opts.ostype,
      disk: opts.disk,
      iso: opts.iso,
      net: opts.net,
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
  console.log(successMsg(`VM ${vmid} created on ${node}. Task: ${upid}`));
  audit({ ...auditBase, resource: { type: 'vm', id: String(vmid) }, timestamp: new Date().toISOString(), result: 'success', error: null });
}

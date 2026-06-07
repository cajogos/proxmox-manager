import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { createNetworkIfaceService } from '../../../services/network';
import { NetworkIfaceType } from '../../../api/endpoints/network';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface NetworkCreateOptions {
  profile?: string;
  address?: string;
  netmask?: string;
  gateway?: string;
  bridgePorts?: string;
  bondSlaves?: string;
  bondMode?: string;
  autostart?: boolean;
  mtu?: number;
  comments?: string;
  dryRun: boolean;
}

export async function networkCreate(
  node: string,
  iface: string,
  type: NetworkIfaceType,
  opts: NetworkCreateOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'network create',
    resource: { type: 'network', id: `${node}/${iface}` },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'create interface', `${iface} (${type}) on ${node}`)) {
    console.log(dryRunMsg(`Would create ${type} interface ${iface} on node ${node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Creating ${type} interface ${iface} on ${node}…`);
  const result = await createNetworkIfaceService(
    config,
    node,
    {
      iface,
      type,
      address: opts.address,
      netmask: opts.netmask,
      gateway: opts.gateway,
      bridge_ports: opts.bridgePorts,
      bond_slaves: opts.bondSlaves,
      bond_mode: opts.bondMode,
      autostart: opts.autostart,
      mtu: opts.mtu,
      comments: opts.comments,
    },
    { profile: opts.profile },
  );
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Interface ${iface} created on ${node}. Run 'network apply ${node}' to activate.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

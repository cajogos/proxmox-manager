import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { updateNetworkIfaceService } from '../../../services/network';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { checkDryRun } from '../../../safeguards/dryRun';

interface NetworkUpdateOptions {
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

export async function networkUpdate(node: string, iface: string, opts: NetworkUpdateOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'network update',
    resource: { type: 'network', id: `${node}/${iface}` },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'update interface', `${iface} on ${node}`)) {
    console.log(dryRunMsg(`Would update interface ${iface} on node ${node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const spinner = startSpinner(`Updating interface ${iface} on ${node}…`);
  const result = await updateNetworkIfaceService(
    config,
    node,
    iface,
    {
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

  console.log(successMsg(`Interface ${iface} updated on ${node}. Run 'network apply ${node}' to activate.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

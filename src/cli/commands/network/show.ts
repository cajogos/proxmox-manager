import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getNetworkIfaceService } from '../../../services/network';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';

interface NetworkShowOptions {
  profile?: string;
  format: string;
}

export async function networkShow(
  node: string,
  iface: string,
  opts: NetworkShowOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'network show',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching ${iface} on ${node}…`);
  const result = await getNetworkIfaceService(config, node, iface, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const d = result.data;
  const rows = [
    { Field: 'Interface', Value: d.iface },
    { Field: 'Type', Value: d.type },
    { Field: 'Active', Value: d.active === 1 ? 'yes' : 'no' },
    { Field: 'Autostart', Value: d.autostart === 1 ? 'yes' : 'no' },
    { Field: 'Method (IPv4)', Value: d.method ?? '-' },
    { Field: 'Address', Value: d.address ?? '-' },
    { Field: 'Netmask', Value: d.netmask ?? '-' },
    { Field: 'Gateway', Value: d.gateway ?? '-' },
    { Field: 'Method (IPv6)', Value: d.method6 ?? '-' },
    { Field: 'Address (IPv6)', Value: d.address6 ?? '-' },
    { Field: 'Gateway (IPv6)', Value: d.gateway6 ?? '-' },
    { Field: 'Bridge Ports', Value: d.bridge_ports ?? '-' },
    { Field: 'Bridge STP', Value: d.bridge_stp ?? '-' },
    { Field: 'Bridge FD', Value: d.bridge_fd ?? '-' },
    { Field: 'Bond Slaves', Value: d.bond_slaves ?? '-' },
    { Field: 'Bond Mode', Value: d.bond_mode ?? '-' },
    { Field: 'MTU', Value: d.mtu != null ? String(d.mtu) : '-' },
    { Field: 'Comments', Value: d.comments ?? '-' },
  ].filter(r => r.Value !== '-');

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

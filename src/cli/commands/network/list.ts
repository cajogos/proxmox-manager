import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listNetworkIfacesService } from '../../../services/network';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';
import chalk from 'chalk';

interface NetworkListOptions {
  profile?: string;
  format: string;
}

export async function networkList(node: string, opts: NetworkListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'network list',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching network interfaces on ${node}…`);
  const result = await listNetworkIfacesService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data.map(i => ({
    Interface: i.iface,
    Type: i.type,
    Method: i.method ?? '-',
    Address: i.address ?? '-',
    Active: i.active === 1
      ? (isTable ? chalk.green('yes') : 'yes')
      : (isTable ? chalk.dim('no') : 'no'),
    Autostart: i.autostart === 1
      ? (isTable ? chalk.green('yes') : 'yes')
      : (isTable ? chalk.dim('no') : 'no'),
    'Bridge Ports': i.bridge_ports ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} interface(s) on ${node}`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

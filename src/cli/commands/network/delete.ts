import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { deleteNetworkIfaceService } from '../../../services/network';
import { confirmAction } from '../../../safeguards/confirm';
import { checkDryRun } from '../../../safeguards/dryRun';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';

interface NetworkDeleteOptions {
  profile?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function networkDelete(node: string, iface: string, opts: NetworkDeleteOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'network delete',
    resource: { type: 'network', id: `${node}/${iface}` },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'delete interface', `${iface} on ${node}`)) {
    console.log(dryRunMsg(`Would delete interface ${iface} on node ${node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Delete interface', `${iface} on ${node}`, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting interface ${iface} on ${node}…`);
  const result = await deleteNetworkIfaceService(config, node, iface, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Interface ${iface} deleted from ${node}. Run 'network apply ${node}' to activate.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

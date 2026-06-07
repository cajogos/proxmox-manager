import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { applyNetworkConfigService, revertNetworkConfigService } from '../../../services/network';
import { confirmAction } from '../../../safeguards/confirm';
import { checkDryRun } from '../../../safeguards/dryRun';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';

interface NetworkApplyOptions {
  profile?: string;
  revert?: boolean;
  dryRun: boolean;
  yes: boolean;
}

export async function networkApply(node: string, opts: NetworkApplyOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const action = opts.revert ? 'revert' : 'apply';

  const auditBase = {
    profile: profileName,
    command: `network ${action}`,
    resource: { type: 'network', id: node },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, `${action} network config`, node)) {
    console.log(dryRunMsg(`Would ${action} pending network configuration on node ${node}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} network config`, node, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`${action === 'apply' ? 'Applying' : 'Reverting'} network config on ${node}…`);
  const result = opts.revert
    ? await revertNetworkConfigService(config, node, { profile: opts.profile })
    : await applyNetworkConfigService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Network configuration ${action === 'apply' ? 'applied' : 'reverted'} on ${node}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

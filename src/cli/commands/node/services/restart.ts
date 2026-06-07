import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { restartServiceService } from '../../../../services/node';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg } from '../../../../output/colors';

interface NodeServicesRestartOptions {
  profile?: string;
  yes: boolean;
}

export async function nodeServicesRestart(
  node: string,
  service: string,
  opts: NodeServicesRestartOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node services restart',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const confirmed = await confirmAction(`Restart service ${service} on node`, node, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Restarting ${service} on ${node}…`);
  const result = await restartServiceService(config, node, service, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Service ${service} restarted on ${node}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

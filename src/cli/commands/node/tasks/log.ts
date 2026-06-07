import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { getTaskLogService } from '../../../../services/node';
import { startSpinner } from '../../../../output/spinner';
import { errorMsg } from '../../../../output/colors';

interface NodeTasksLogOptions {
  profile?: string;
}

export async function nodeTasksLog(
  node: string,
  upid: string,
  opts: NodeTasksLogOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node tasks log',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching task log…');
  const result = await getTaskLogService(config, node, upid, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  for (const line of result.data) {
    console.log(line.t);
  }

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

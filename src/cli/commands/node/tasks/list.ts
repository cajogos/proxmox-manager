import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listTasksService } from '../../../../services/node';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';

interface NodeTasksListOptions {
  profile?: string;
  format: string;
  limit: number;
}

export async function nodeTasksList(node: string, opts: NodeTasksListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node tasks list',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching tasks on ${node}…`);
  const result = await listTasksService(config, node, { profile: opts.profile, limit: opts.limit });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(t => ({
    UPID: t.upid.length > 40 ? t.upid.slice(0, 40) + '…' : t.upid,
    Type: t.type,
    User: t.user,
    Status: t.status ?? '-',
    Started: new Date(t.starttime * 1000).toISOString().replace('T', ' ').slice(0, 19),
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} task(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

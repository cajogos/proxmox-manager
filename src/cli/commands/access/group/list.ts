import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listGroupsService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';

interface GroupListOptions {
  profile?: string;
  format: string;
}

export async function accessGroupList(opts: GroupListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access group list',
    resource: { type: 'group' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching groups…');
  const result = await listGroupsService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(g => ({
    GroupID: g.groupid,
    Members: Array.isArray(g.members) ? g.members.length : '-',
    Comment: g.comment ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} group(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

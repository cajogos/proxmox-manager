import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listRolesService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';
import chalk from 'chalk';

interface RoleListOptions {
  profile?: string;
  format: string;
}

export async function accessRoleList(opts: RoleListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access role list',
    resource: { type: 'role' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching roles…');
  const result = await listRolesService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data.map(r => ({
    RoleID: r.roleid,
    Special: r.special === 1
      ? (isTable ? chalk.yellow('yes') : 'yes')
      : (isTable ? chalk.dim('no') : 'no'),
    Privileges: r.privs ?? '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} role(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

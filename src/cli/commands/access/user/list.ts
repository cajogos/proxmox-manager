import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listUsersService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';
import chalk from 'chalk';

interface UserListOptions {
  profile?: string;
  format: string;
}

export async function accessUserList(opts: UserListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access user list',
    resource: { type: 'user' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching users…');
  const result = await listUsersService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data.map(u => {
    const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || '-';
    const enabled = u.enable !== 0;
    return {
      UserID: u.userid,
      Name: name,
      Email: u.email ?? '-',
      Enabled: enabled
        ? (isTable ? chalk.green('yes') : 'yes')
        : (isTable ? chalk.dim('no') : 'no'),
      Groups: u.groups ?? '-',
      Comment: u.comment ?? '-',
    };
  });

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} user(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

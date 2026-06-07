import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { getUserService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';

interface UserShowOptions {
  profile?: string;
  format: string;
}

export async function accessUserShow(userid: string, opts: UserShowOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access user show',
    resource: { type: 'user', id: userid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching user ${userid}…`);
  const result = await getUserService(config, userid, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const u = result.data;
  const rows = [
    { Field: 'UserID', Value: u.userid },
    { Field: 'First Name', Value: u.firstname ?? '-' },
    { Field: 'Last Name', Value: u.lastname ?? '-' },
    { Field: 'Email', Value: u.email ?? '-' },
    { Field: 'Enabled', Value: u.enable !== 0 ? 'yes' : 'no' },
    { Field: 'Groups', Value: u.groups ?? '-' },
    { Field: 'Expires', Value: u.expire ? new Date(u.expire * 1000).toISOString().slice(0, 10) : 'never' },
    { Field: 'Comment', Value: u.comment ?? '-' },
  ];

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listUserTokensService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';

interface TokenListOptions {
  profile?: string;
  format: string;
}

export async function accessTokenList(userid: string, opts: TokenListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access token list',
    resource: { type: 'token', id: userid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching tokens for ${userid}…`);
  const result = await listUserTokensService(config, userid, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(t => ({
    'Token ID': t.tokenid,
    Comment: t.comment ?? '-',
    Expire: t.expire ? new Date(t.expire * 1000).toISOString().split('T')[0] : 'never',
    'Priv. Sep.': t.privsep === 1 ? 'yes' : 'no',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} token(s) for ${userid}`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

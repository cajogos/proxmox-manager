import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { createUserTokenService } from '../../../../services/access';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg } from '../../../../output/colors';

interface TokenCreateOptions {
  profile?: string;
  comment?: string;
  expire?: number;
  privsep?: number;
}

export async function accessTokenCreate(
  userid: string,
  tokenid: string,
  opts: TokenCreateOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'access token create',
    resource: { type: 'token', id: `${userid}!${tokenid}` },
    dryRun: false,
    source: 'cli' as const,
  };

  const params: { comment?: string; expire?: number; privsep?: number } = {};
  if (opts.comment !== undefined) {
    params.comment = opts.comment;
  }
  if (opts.expire !== undefined) {
    params.expire = opts.expire;
  }
  if (opts.privsep !== undefined) {
    params.privsep = opts.privsep;
  }

  const spinner = startSpinner(`Creating token ${tokenid} for ${userid}…`);
  const result = await createUserTokenService(config, userid, tokenid, params, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const secret = result.data;
  console.log(successMsg(`Token created: ${secret['full-tokenid']}`));
  console.log('');
  console.log(chalk.yellow('⚠  Save this secret now — it will not be shown again:'));
  console.log('');
  console.log(`  ${chalk.bold(secret.value)}`);
  console.log('');

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

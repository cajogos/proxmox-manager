import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { deleteUserTokenService } from '../../../../services/access';
import { checkDryRun } from '../../../../safeguards/dryRun';
import { confirmAction } from '../../../../safeguards/confirm';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../../output/colors';

interface TokenDeleteOptions {
  profile?: string;
  dryRun: boolean;
  yes: boolean;
}

export async function accessTokenDelete(
  userid: string,
  tokenid: string,
  opts: TokenDeleteOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const fullToken = `${userid}!${tokenid}`;

  const auditBase = {
    profile: profileName,
    command: 'access token delete',
    resource: { type: 'token', id: fullToken },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  if (checkDryRun(opts.dryRun, 'delete token', fullToken)) {
    console.log(dryRunMsg(`Would delete token ${fullToken}.`));
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
    return;
  }

  const confirmed = await confirmAction('Delete token', fullToken, opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const spinner = startSpinner(`Deleting token ${fullToken}…`);
  const result = await deleteUserTokenService(config, userid, tokenid, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Token ${fullToken} deleted.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getLXCConfigService } from '../../../services/lxc';
import { output, OutputFormat } from '../../../output/formatter';
import { startSpinner } from '../../../output/spinner';
import { errorMsg } from '../../../output/colors';

interface LXCConfigOptions {
  profile?: string;
  format: OutputFormat;
  node?: string;
}

export async function lxcConfig(ctid: number, opts: LXCConfigOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc config',
    resource: { type: 'container', id: ctid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching config for container ${ctid}…`);
  const result = await getLXCConfigService(config, ctid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = Object.entries(result.data)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => ({ Key: k, Value: String(v) }));

  output(rows, opts.format);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

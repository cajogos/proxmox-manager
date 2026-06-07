import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getNodeVersionService } from '../../../services/node';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';

interface NodeVersionOptions {
  profile?: string;
  format: string;
}

export async function nodeVersion(node: string, opts: NodeVersionOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'node version',
    resource: { type: 'node', id: node },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching version for node ${node}…`);
  const result = await getNodeVersionService(config, node, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const d = result.data;
  const rows = [
    { Field: 'Node', Value: node },
    { Field: 'PVE Version', Value: d.version },
    { Field: 'Release', Value: d.release },
    { Field: 'Repo ID', Value: d.repoid },
  ];

  output(rows as Record<string, unknown>[], opts.format as OutputFormat);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

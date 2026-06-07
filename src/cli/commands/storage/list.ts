import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { listStorageService } from '../../../services/storage';
import { startSpinner } from '../../../output/spinner';
import { output, OutputFormat } from '../../../output/formatter';
import { errorMsg } from '../../../output/colors';
import { humanBytes } from '../../../output/humanize';

interface StorageListOptions {
  profile?: string;
  format: string;
}

export async function storageList(opts: StorageListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage list',
    resource: { type: 'storage' },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching storage pools…');
  const result = await listStorageService(config, { profile: opts.profile });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(s => {
    const usedPct = s.total && s.total > 0
      ? `${(((s.used ?? 0) / s.total) * 100).toFixed(1)}%`
      : '-';
    return {
      Name: s.storage,
      Type: s.type,
      Node: s.node ?? '-',
      Avail: s.avail != null ? humanBytes(s.avail) : '-',
      Used: s.used != null ? humanBytes(s.used) : '-',
      Total: s.total != null ? humanBytes(s.total) : '-',
      'Used%': usedPct,
      Content: s.content ?? '-',
    };
  });

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} storage pool(s)`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listStorageContentService } from '../../../../services/storage';
import { startSpinner } from '../../../../output/spinner';
import { output, OutputFormat } from '../../../../output/formatter';
import { errorMsg } from '../../../../output/colors';
import { humanBytes } from '../../../../output/humanize';

interface StorageContentListOptions {
  profile?: string;
  format: string;
  node?: string;
  contentType?: string;
}

export async function storageContentList(
  storage: string,
  opts: StorageContentListOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage content list',
    resource: { type: 'storage', id: storage },
    dryRun: false,
    source: 'cli' as const,
  };

  if (!opts.node) {
    console.error(errorMsg('--node <name> is required for storage content list'));
    process.exit(1);
  }

  const spinner = startSpinner(`Fetching content in ${storage}…`);
  const result = await listStorageContentService(config, storage, {
    profile: opts.profile,
    node: opts.node,
    contentType: opts.contentType,
  });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data.map(c => ({
    Volume: c.volid,
    Type: c.content,
    Format: c.format ?? '-',
    Size: c.size != null ? humanBytes(c.size) : '-',
    VMID: c.vmid ?? '-',
    Created: c.ctime != null ? new Date(c.ctime * 1000).toISOString().slice(0, 10) : '-',
  }));

  output(rows as Record<string, unknown>[], opts.format as OutputFormat, {
    summary: `${result.data.length} item(s) in ${storage}`,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

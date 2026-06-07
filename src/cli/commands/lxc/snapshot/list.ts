import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listLXCSnapshotsService } from '../../../../services/lxc';
import { output, OutputFormat } from '../../../../output/formatter';
import { startSpinner } from '../../../../output/spinner';
import { errorMsg } from '../../../../output/colors';

interface LXCSnapshotListOptions {
  profile?: string;
  format: OutputFormat;
  node?: string;
}

export async function lxcSnapshotList(ctid: number, opts: LXCSnapshotListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc snapshot list',
    resource: { type: 'container', id: ctid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching snapshots for container ${ctid}…`);
  const result = await listLXCSnapshotsService(config, ctid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data
    .sort((a, b) => (b.snaptime ?? 0) - (a.snaptime ?? 0))
    .map(s => ({
      Name: s.snapname,
      Description: s.description ?? '-',
      Parent: s.parent ?? '-',
      Created: s.snaptime ? new Date(s.snaptime * 1000).toISOString() : '-',
    }));

  output(rows, opts.format, { summary: `${rows.length} snapshot${rows.length !== 1 ? 's' : ''}` });
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

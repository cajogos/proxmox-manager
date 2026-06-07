import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { listSnapshotsService } from '../../../../services/vm';
import { output, OutputFormat } from '../../../../output/formatter';
import { startSpinner } from '../../../../output/spinner';
import { errorMsg } from '../../../../output/colors';

interface SnapshotListOptions {
  profile?: string;
  format: OutputFormat;
  node?: string;
}

export async function snapshotList(vmid: number, opts: SnapshotListOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm snapshot list',
    resource: { type: 'vm', id: vmid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching snapshots for VM ${vmid}…`);
  const result = await listSnapshotsService(config, vmid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const rows = result.data
    .filter(s => s.snapname !== 'current')
    .sort((a, b) => (b.snaptime ?? 0) - (a.snaptime ?? 0))
    .map(s => ({
      Name: s.snapname,
      Description: s.description ?? '-',
      Parent: s.parent ?? '-',
      Created: s.snaptime ? new Date(s.snaptime * 1000).toISOString() : '-',
      'VM State': s.vmstate ? 'saved' : '-',
    }));

  output(rows, opts.format, { summary: `${rows.length} snapshot${rows.length !== 1 ? 's' : ''}` });
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

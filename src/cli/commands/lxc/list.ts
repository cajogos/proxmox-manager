import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getLXCList } from '../../../services/lxc';
import { output, OutputFormat } from '../../../output/formatter';
import { statusColor, errorMsg } from '../../../output/colors';
import { humanMB } from '../../../output/humanize';
import { startSpinner } from '../../../output/spinner';

interface ListLXCOptions {
  profile?: string;
  format: OutputFormat;
  dryRun: boolean;
}

export async function listLXC(opts: ListLXCOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc list',
    resource: { type: 'container' },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching containers…');
  const result = await getLXCList(config, opts.profile);
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data
    .sort((a, b) => a.vmid - b.vmid)
    .map(ct => ({
      CTID: ct.vmid,
      Name: ct.name || '(unnamed)',
      Status: isTable ? statusColor(ct.status) : ct.status,
      Node: ct.node,
      CPUs: ct.cpus ?? '-',
      Memory: ct.maxmem ? humanMB(Math.round(ct.maxmem / 1024 / 1024)) : '-',
      Template: ct.template ? (isTable ? chalk.dim('template') : 'template') : '-',
      Tags: ct.tags || '-',
    }));

  const total = rows.length;
  const counts = result.data.reduce((acc, ct) => {
    acc[ct.status] = (acc[ct.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const parts = Object.entries(counts).map(([s, n]) => `${n} ${s}`);
  const summary = `${total} container${total !== 1 ? 's' : ''} — ${parts.join(' · ')}`;

  output(rows as Record<string, unknown>[], opts.format, {
    colAligns: ['right', 'left', 'left', 'left', 'right', 'right', 'left', 'left'],
    summary,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getVMs } from '../../../services/vm';
import { output, OutputFormat } from '../../../output/formatter';
import { statusColor } from '../../../output/colors';
import { humanMB } from '../../../output/humanize';
import { startSpinner } from '../../../output/spinner';

interface ListVMsOptions {
  profile?: string;
  format: OutputFormat;
  dryRun: boolean;
}

export async function listVMs(opts: ListVMsOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);

  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm list',
    resource: { type: 'vm' },
    dryRun: opts.dryRun,
    source: 'cli' as const,
  };

  const spinner = startSpinner('Fetching VMs…');
  const result = await getVMs(config, opts.profile);
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(chalk.red('✗'), result.error);
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data
    .sort((a, b) => a.vmid - b.vmid)
    .map(vm => ({
      VMID: vm.vmid,
      Name: vm.name || '(unnamed)',
      Status: isTable ? statusColor(vm.status) : vm.status,
      Node: vm.node,
      CPUs: vm.cpus ?? '-',
      Memory: vm.maxmem ? humanMB(Math.round(vm.maxmem / 1024 / 1024)) : '-',
      Template: vm.template ? (isTable ? chalk.dim('template') : 'template') : '-',
      Tags: vm.tags || '-',
    }));

  const total = rows.length;
  const counts = result.data.reduce((acc, vm) => {
    acc[vm.status] = (acc[vm.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const parts = Object.entries(counts).map(([s, n]) => `${n} ${s}`);
  const summary = `${total} VM${total !== 1 ? 's' : ''} — ${parts.join(' · ')}`;

  output(rows as Record<string, unknown>[], opts.format, {
    colAligns: ['right', 'left', 'left', 'left', 'right', 'right', 'left', 'left'],
    summary,
  });

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

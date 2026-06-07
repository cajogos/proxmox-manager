import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getVMs } from '../../../services/vm';
import { output, OutputFormat } from '../../../output/formatter';

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

  const result = await getVMs(config, opts.profile);

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(chalk.red('Error:'), result.error);
    process.exit(1);
  }

  const isTable = opts.format === 'table';
  const rows = result.data
    .sort((a, b) => a.vmid - b.vmid)
    .map(vm => ({
      VMID: vm.vmid,
      Name: vm.name || '(unnamed)',
      Status: isTable ? colorStatus(vm.status) : vm.status,
      Node: vm.node,
      CPUs: vm.cpus ?? '-',
      'Memory (MB)': vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024) : '-',
      Template: vm.template ? 'Yes' : 'No',
      Tags: vm.tags || '-',
    }));

  output(rows as Record<string, unknown>[], opts.format);

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

function colorStatus(status: string): string {
  switch (status) {
    case 'running':   return chalk.green(status);
    case 'stopped':   return chalk.gray(status);
    case 'paused':
    case 'suspended': return chalk.yellow(status);
    default:          return chalk.dim(status);
  }
}

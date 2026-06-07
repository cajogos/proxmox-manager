import chalk from 'chalk';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { ProxmoxClient } from '../../../api/client';
import { listAllVMs } from '../../../api/endpoints/vm';
import { output, OutputFormat } from '../../../output/formatter';

interface ListVMsOptions {
  profile?: string;
  format: OutputFormat;
  dryRun: boolean;
}

export async function listVMs(opts: ListVMsOptions): Promise<void> {
  const config = loadConfig();
  const { profile, name: profileName } = resolveProfile(config, opts.profile);

  configureAuditLog(config.auditLog.path);

  const auditBase = {
    profile: profileName,
    command: 'vm list',
    resource: { type: 'vm' },
    dryRun: opts.dryRun,
  };

  const client = new ProxmoxClient(profile);

  try {
    const vms = await listAllVMs(client);

    const isTable = opts.format === 'table';
    const rows = vms
      .sort((a, b) => a.vmid - b.vmid)
      .map(vm => ({
        VMID: vm.vmid,
        Name: vm.name || '(unnamed)',
        Status: isTable
          ? colorStatus(vm.status)
          : vm.status,
        Node: vm.node,
        CPUs: vm.cpus ?? '-',
        'Memory (MB)': vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024) : '-',
        Template: vm.template ? 'Yes' : 'No',
        Tags: vm.tags || '-',
      }));

    output(rows as Record<string, unknown>[], opts.format);

    audit({
      ...auditBase,
      timestamp: new Date().toISOString(),
      result: 'success',
      error: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);

    audit({
      ...auditBase,
      timestamp: new Date().toISOString(),
      result: 'failed',
      error: msg,
    });

    console.error(chalk.red('Error:'), msg);
    process.exit(1);
  }
}

function colorStatus(status: string): string {
  switch (status) {
    case 'running':
      return chalk.green(status);
    case 'stopped':
      return chalk.gray(status);
    case 'paused':
    case 'suspended':
      return chalk.yellow(status);
    default:
      return chalk.dim(status);
  }
}

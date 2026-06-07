import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { getVMStatusService } from '../../../services/vm';
import { output, OutputFormat } from '../../../output/formatter';
import { statusColor } from '../../../output/colors';
import { humanMB, humanSeconds } from '../../../output/humanize';
import { startSpinner } from '../../../output/spinner';
import { errorMsg } from '../../../output/colors';

interface VMStatusOptions {
  profile?: string;
  format: OutputFormat;
  node?: string;
}

export async function vmStatus(vmid: number, opts: VMStatusOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'vm status',
    resource: { type: 'vm', id: vmid },
    dryRun: false,
    source: 'cli' as const,
  };

  const spinner = startSpinner(`Fetching status for VM ${vmid}…`);
  const result = await getVMStatusService(config, vmid, { profile: opts.profile, node: opts.node });
  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  const vm = result.data;
  const isTable = opts.format === 'table';
  const rows = [{
    VMID: vm.vmid,
    Name: vm.name ?? '(unnamed)',
    Status: isTable ? statusColor(vm.status) : vm.status,
    Node: vm.node,
    CPUs: vm.cpus ?? '-',
    Memory: vm.maxmem ? humanMB(Math.round(vm.maxmem / 1024 / 1024)) : '-',
    Uptime: vm.uptime ? humanSeconds(vm.uptime) : '-',
    PID: vm.pid ?? '-',
  }];

  output(rows as Record<string, unknown>[], opts.format);
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

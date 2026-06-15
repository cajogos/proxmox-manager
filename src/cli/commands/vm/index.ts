import { Command } from 'commander';
import { OutputFormat } from '../../../output/formatter';
import { listVMs } from './list';
import { vmCreate } from './create';
import { vmStatus } from './status';
import { vmConfig } from './config';
import { vmStart } from './start';
import { vmStop } from './stop';
import { vmShutdown } from './shutdown';
import { vmReboot } from './reboot';
import { vmSuspend } from './suspend';
import { vmResume } from './resume';
import { vmDelete } from './delete';
import { vmClone } from './clone';
import { vmResize } from './resize';
import { vmMigrate } from './migrate';
import { registerVMSnapshotCommands } from './snapshot/index';

export function registerVMCommands(program: Command): void {
  const vm = program
    .command('vm')
    .description('Manage QEMU virtual machines')
    .action(function () { vm.outputHelp(); });

  vm.command('create')
    .description('Create a new QEMU VM')
    .requiredOption('--name <name>', 'VM display name')
    .requiredOption('--node <node>', 'Target node')
    .option('--vmid <id>', 'Explicit VMID (auto-assigned if omitted)')
    .option('--memory <mb>', 'RAM in MB (default: 512)')
    .option('--cores <n>', 'CPU cores (default: 1)')
    .option('--sockets <n>', 'CPU sockets (default: 1)')
    .option('--cpu <type>', 'CPU model, e.g. kvm64, host (default: kvm64)')
    .option('--ostype <type>', 'OS type, e.g. l26, win11 (default: l26)')
    .option('--disk <storage:size>', 'Primary disk, e.g. local-lvm:32')
    .option('--iso <storage:path>', 'ISO image for CDROM, e.g. local:iso/debian-12.iso')
    .option('--net <model,bridge>', 'Network adapter, e.g. virtio,bridge=vmbr0')
    .option('--start', 'Start VM immediately after creation')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; }>();
      const cmdOpts = cmd.opts<{ name: string; node: string; vmid?: string; memory?: string; cores?: string; sockets?: string; cpu?: string; ostype?: string; disk?: string; iso?: string; net?: string; start?: boolean; }>();
      await vmCreate(cmdOpts.name, {
        profile: globals.profile,
        node: cmdOpts.node,
        vmid: cmdOpts.vmid ? Number(cmdOpts.vmid) : undefined,
        memory: cmdOpts.memory ? Number(cmdOpts.memory) : undefined,
        cores: cmdOpts.cores ? Number(cmdOpts.cores) : undefined,
        sockets: cmdOpts.sockets ? Number(cmdOpts.sockets) : undefined,
        cpu: cmdOpts.cpu,
        ostype: cmdOpts.ostype,
        disk: cmdOpts.disk,
        iso: cmdOpts.iso,
        net: cmdOpts.net,
        start: !!cmdOpts.start,
        dryRun: !!globals.dryRun,
      });
    });

  vm.command('list')
    .description('List all VMs across all nodes')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; dryRun: boolean; }>();
      await listVMs({
        profile: globals.profile,
        format: globals.format as OutputFormat,
        dryRun: !!globals.dryRun,
      });
    });

  vm.command('status <vmid>')
    .description('Show detailed status of a VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await vmStatus(Number(vmid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  vm.command('config <vmid>')
    .description('Show VM configuration')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await vmConfig(Number(vmid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  vm.command('start <vmid>')
    .description('Start a stopped VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmStart(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('stop <vmid>')
    .description('Hard-stop a running VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmStop(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('shutdown <vmid>')
    .description('Gracefully shut down a VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmShutdown(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('reboot <vmid>')
    .description('Reboot a running VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmReboot(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('suspend <vmid>')
    .description('Suspend a running VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmSuspend(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('resume <vmid>')
    .description('Resume a suspended VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmResume(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('delete <vmid>')
    .description('Permanently delete a VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await vmDelete(Number(vmid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('clone <vmid> <newid>')
    .description('Clone a VM to a new VM ID')
    .option('--node <name>', 'Source node (auto-discovered if omitted)')
    .option('--name <name>', 'Name for the cloned VM')
    .option('--target <node>', 'Target node for the clone')
    .option('--full', 'Full clone (independent copy, not linked)')
    .option('--storage <storage>', 'Storage pool for the clone')
    .option('--description <text>', 'Description for the cloned VM')
    .action(async (vmid: string, newid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      const cmdOpts = cmd.opts<{ node?: string; name?: string; target?: string; full?: boolean; storage?: string; description?: string; }>();
      await vmClone(Number(vmid), Number(newid), {
        profile: globals.profile,
        node: cmdOpts.node,
        name: cmdOpts.name,
        target: cmdOpts.target,
        full: cmdOpts.full,
        storage: cmdOpts.storage,
        description: cmdOpts.description,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  vm.command('resize <vmid> <disk> <size>')
    .description('Resize a VM disk (e.g. scsi0, +10G or 50G)')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, disk: string, size: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; }>();
      await vmResize(Number(vmid), disk, size, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
      });
    });

  vm.command('migrate <vmid> <target-node>')
    .description('Migrate a VM to another node')
    .option('--node <name>', 'Source node (auto-discovered if omitted)')
    .option('--online', 'Live migration without downtime')
    .option('--with-local-disks', 'Migrate local disks (advanced)')
    .action(async (vmid: string, targetNode: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      const cmdOpts = cmd.opts<{ node?: string; online?: boolean; withLocalDisks?: boolean; }>();
      await vmMigrate(Number(vmid), targetNode, {
        profile: globals.profile,
        node: cmdOpts.node,
        online: cmdOpts.online,
        withLocalDisks: cmdOpts.withLocalDisks,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  registerVMSnapshotCommands(vm);
}

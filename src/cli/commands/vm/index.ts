import { Command } from 'commander';
import { OutputFormat } from '../../../output/formatter';
import { listVMs } from './list';
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

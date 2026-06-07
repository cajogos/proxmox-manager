import { Command } from 'commander';
import { OutputFormat } from '../../../output/formatter';
import { listLXC } from './list';
import { lxcStatus } from './status';
import { lxcConfig } from './config';
import { lxcStart } from './start';
import { lxcStop } from './stop';
import { lxcShutdown } from './shutdown';
import { lxcReboot } from './reboot';
import { lxcSuspend } from './suspend';
import { lxcResume } from './resume';
import { lxcDelete } from './delete';
import { lxcExec } from './exec';
import { lxcClone } from './clone';
import { lxcResize } from './resize';
import { registerLXCSnapshotCommands } from './snapshot/index';

export function registerLXCCommands(program: Command): void {
  const lxc = program
    .command('lxc')
    .description('Manage LXC containers')
    .action(function () { lxc.outputHelp(); });

  lxc.command('list')
    .description('List all containers across all nodes')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; dryRun: boolean; }>();
      await listLXC({
        profile: globals.profile,
        format: globals.format as OutputFormat,
        dryRun: !!globals.dryRun,
      });
    });

  lxc.command('status <ctid>')
    .description('Show detailed status of a container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await lxcStatus(Number(ctid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  lxc.command('config <ctid>')
    .description('Show container configuration')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await lxcConfig(Number(ctid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  lxc.command('start <ctid>')
    .description('Start a stopped container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcStart(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('stop <ctid>')
    .description('Hard-stop a running container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcStop(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('shutdown <ctid>')
    .description('Gracefully shut down a container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcShutdown(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('reboot <ctid>')
    .description('Reboot a running container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcReboot(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('suspend <ctid>')
    .description('Suspend a running container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcSuspend(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('resume <ctid>')
    .description('Resume a suspended container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcResume(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('delete <ctid>')
    .description('Permanently delete a container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcDelete(Number(ctid), {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('exec <ctid> [command...]')
    .description('Execute a command inside a container (requires SSH root access to node)')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, command: string[], _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; yes?: boolean; }>();
      await lxcExec(Number(ctid), command, {
        profile: globals.profile,
        node: cmd.opts().node,
        yes: !!globals.yes,
      });
    });

  lxc.command('clone <ctid> <newid>')
    .description('Clone a container to a new container ID')
    .option('--node <name>', 'Source node (auto-discovered if omitted)')
    .option('--hostname <name>', 'Hostname for the cloned container')
    .option('--target <node>', 'Target node for the clone')
    .option('--full', 'Full clone (independent copy, not linked)')
    .option('--storage <storage>', 'Storage pool for the clone')
    .option('--description <text>', 'Description for the cloned container')
    .action(async (ctid: string, newid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      const cmdOpts = cmd.opts<{ node?: string; hostname?: string; target?: string; full?: boolean; storage?: string; description?: string; }>();
      await lxcClone(Number(ctid), Number(newid), {
        profile: globals.profile,
        node: cmdOpts.node,
        hostname: cmdOpts.hostname,
        target: cmdOpts.target,
        full: cmdOpts.full,
        storage: cmdOpts.storage,
        description: cmdOpts.description,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  lxc.command('resize <ctid> <disk> <size>')
    .description('Resize a container disk (e.g. rootfs, +10G or 50G)')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, disk: string, size: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; }>();
      await lxcResize(Number(ctid), disk, size, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
      });
    });

  registerLXCSnapshotCommands(lxc);
}

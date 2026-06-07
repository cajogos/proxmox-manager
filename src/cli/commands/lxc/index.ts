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

  registerLXCSnapshotCommands(lxc);
}

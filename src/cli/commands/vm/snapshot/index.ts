import { Command } from 'commander';
import { OutputFormat } from '../../../../output/formatter';
import { snapshotList } from './list';
import { snapshotCreate } from './create';
import { snapshotDelete } from './delete';
import { snapshotRollback } from './rollback';

export function registerVMSnapshotCommands(vm: Command): void {
  const snapshot = vm
    .command('snapshot')
    .description('Manage VM snapshots')
    .action(function () { snapshot.outputHelp(); });

  snapshot
    .command('list <vmid>')
    .description('List snapshots for a VM')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await snapshotList(Number(vmid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  snapshot
    .command('create <vmid> <name>')
    .description('Create a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .option('--description <text>', 'Snapshot description')
    .action(async (vmid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await snapshotCreate(Number(vmid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        description: cmd.opts().description,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  snapshot
    .command('delete <vmid> <name>')
    .description('Delete a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await snapshotDelete(Number(vmid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  snapshot
    .command('rollback <vmid> <name>')
    .description('Roll back a VM to a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (vmid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await snapshotRollback(Number(vmid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });
}

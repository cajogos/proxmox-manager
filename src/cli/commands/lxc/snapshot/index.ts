import { Command } from 'commander';
import { OutputFormat } from '../../../../output/formatter';
import { lxcSnapshotList } from './list';
import { lxcSnapshotCreate } from './create';
import { lxcSnapshotDelete } from './delete';
import { lxcSnapshotRollback } from './rollback';

export function registerLXCSnapshotCommands(lxc: Command): void {
  const snapshot = lxc
    .command('snapshot')
    .description('Manage container snapshots')
    .action(function () { snapshot.outputHelp(); });

  snapshot
    .command('list <ctid>')
    .description('List snapshots for a container')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string; }>();
      await lxcSnapshotList(Number(ctid), {
        profile: globals.profile,
        format: globals.format as OutputFormat,
        node: cmd.opts().node,
      });
    });

  snapshot
    .command('create <ctid> <name>')
    .description('Create a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .option('--description <text>', 'Snapshot description')
    .action(async (ctid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcSnapshotCreate(Number(ctid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        description: cmd.opts().description,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  snapshot
    .command('delete <ctid> <name>')
    .description('Delete a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcSnapshotDelete(Number(ctid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  snapshot
    .command('rollback <ctid> <name>')
    .description('Roll back a container to a snapshot')
    .option('--node <name>', 'Target node (auto-discovered if omitted)')
    .action(async (ctid: string, name: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await lxcSnapshotRollback(Number(ctid), name, {
        profile: globals.profile,
        node: cmd.opts().node,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });
}

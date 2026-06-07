import { Command } from 'commander';
import { backupList } from './list';
import { backupShow } from './show';
import { backupCreate } from './create';
import { backupDelete } from './delete';

export function registerBackupCommands(program: Command): void {
  const backup = program.command('backup').description('Manage Proxmox backup jobs');

  backup
    .command('list')
    .description('List all backup jobs')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      backupList({ profile: globals.profile, format: globals.format });
    });

  backup
    .command('show <id>')
    .description('Show details for a backup job')
    .action((id: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      backupShow(id, { profile: globals.profile, format: globals.format });
    });

  backup
    .command('create')
    .description('Create a new backup job')
    .requiredOption('--storage <name>', 'Target storage for backups')
    .option('--schedule <cron>', 'Cron-like schedule (e.g. "0 2 * * *")')
    .option('--node <node>', 'Restrict to a specific node')
    .option('--vmid <ids>', 'Comma-separated list of VMIDs')
    .option('--mode <mode>', 'Backup mode: snapshot, suspend, or stop', 'snapshot')
    .option('--compress <type>', 'Compression: 0, gzip, lzo, zstd')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action((cmdOpts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string }>();
      backupCreate({
        profile: globals.profile,
        storage: cmdOpts.storage,
        schedule: cmdOpts.schedule,
        node: cmdOpts.node,
        vmid: cmdOpts.vmid,
        mode: cmdOpts.mode,
        compress: cmdOpts.compress,
        yes: cmdOpts.yes,
      });
    });

  backup
    .command('delete <id>')
    .description('Delete a backup job')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action((id: string, cmdOpts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string }>();
      backupDelete(id, { profile: globals.profile, yes: cmdOpts.yes });
    });
}

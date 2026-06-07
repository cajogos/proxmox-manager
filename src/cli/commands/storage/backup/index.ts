import { Command } from 'commander';
import { storageBackupList } from './list';
import { storageBackupDelete } from './delete';

export function registerStorageBackupCommands(storageCmd: Command): void {
  const backup = storageCmd.command('backup').description('Manage backups across storage');

  backup
    .command('list')
    .description('List all backups across all nodes and storage pools')
    .action(() => {
      const opts = storageCmd.parent?.opts() ?? {};
      storageBackupList({ profile: opts['profile'], format: opts['format'] ?? 'table' });
    });

  backup
    .command('delete <volid>')
    .description('Delete a backup by volume ID')
    .option('--node <name>', 'Node name (required)')
    .option('--storage <name>', 'Storage pool name (required)')
    .action((volid: string, cmdOpts: { node?: string; storage?: string }) => {
      if (!cmdOpts.node || !cmdOpts.storage) {
        console.error('Both --node <name> and --storage <name> are required.');
        process.exit(1);
      }
      const opts = storageCmd.parent?.opts() ?? {};
      storageBackupDelete(volid, {
        profile: opts['profile'],
        node: cmdOpts.node,
        storage: cmdOpts.storage,
        yes: opts['yes'] ?? false,
      });
    });
}

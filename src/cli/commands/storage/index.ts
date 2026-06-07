import { Command } from 'commander';
import { storageList } from './list';
import { storageStatus } from './status';
import { registerStorageContentCommands } from './content/index';
import { registerStorageBackupCommands } from './backup/index';

export function registerStorageCommands(program: Command): void {
  const storage = program.command('storage').description('Manage Proxmox storage pools');

  storage
    .command('list')
    .description('List all storage pools across all nodes')
    .action(() => {
      const opts = program.opts();
      storageList({ profile: opts['profile'], format: opts['format'] });
    });

  storage
    .command('status <storage>')
    .description('Show detailed status of a storage pool')
    .option('--node <name>', 'Node name (required)')
    .action((name: string, cmdOpts: { node?: string }) => {
      const opts = program.opts();
      storageStatus(name, {
        profile: opts['profile'],
        format: opts['format'],
        node: cmdOpts.node,
      });
    });

  registerStorageContentCommands(storage);
  registerStorageBackupCommands(storage);
}

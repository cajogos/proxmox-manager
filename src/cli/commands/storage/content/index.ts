import { Command } from 'commander';
import { storageContentList } from './list';
import { storageContentUpload } from './upload';
import { storageContentDelete } from './delete';

export function registerStorageContentCommands(storageCmd: Command): void {
  const content = storageCmd.command('content').description('Manage storage content');

  content
    .command('list <storage>')
    .description('List content in a storage pool')
    .option('--node <name>', 'Node name (required)')
    .option('--type <type>', 'Filter by content type (e.g. iso, vztmpl, backup)')
    .action((storage: string, cmdOpts: { node?: string; type?: string }) => {
      const opts = storageCmd.parent?.opts() ?? {};
      storageContentList(storage, {
        profile: opts['profile'],
        format: opts['format'] ?? 'table',
        node: cmdOpts.node,
        contentType: cmdOpts.type,
      });
    });

  content
    .command('upload <storage> <file>')
    .description('Upload a file to a storage pool (iso or vztmpl)')
    .option('--node <name>', 'Node name (required)')
    .option('--content <type>', 'Content type: iso or vztmpl', 'iso')
    .action((storage: string, file: string, cmdOpts: { node?: string; content: string }) => {
      const opts = storageCmd.parent?.opts() ?? {};
      storageContentUpload(storage, file, {
        profile: opts['profile'],
        node: cmdOpts.node,
        content: cmdOpts.content,
      });
    });

  content
    .command('delete <storage> <volid>')
    .description('Delete a storage content item by volume ID')
    .option('--node <name>', 'Node name (required)')
    .action((storage: string, volid: string, cmdOpts: { node?: string }) => {
      const opts = storageCmd.parent?.opts() ?? {};
      storageContentDelete(storage, volid, {
        profile: opts['profile'],
        node: cmdOpts.node,
        yes: opts['yes'] ?? false,
      });
    });
}

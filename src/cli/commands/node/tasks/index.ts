import { Command } from 'commander';
import { nodeTasksList } from './list';
import { nodeTasksLog } from './log';

export function registerNodeTasksCommands(nodeCmd: Command): void {
  const tasks = nodeCmd.command('tasks').description('View tasks on a node');

  tasks
    .command('list <node>')
    .description('List recent tasks on a node')
    .option('--limit <n>', 'Number of tasks to fetch', '20')
    .action((node: string, cmdOpts: { limit: string }) => {
      const opts = nodeCmd.parent?.opts() ?? {};
      nodeTasksList(node, {
        profile: opts['profile'],
        format: opts['format'] ?? 'table',
        limit: parseInt(cmdOpts.limit, 10),
      });
    });

  tasks
    .command('log <node> <upid>')
    .description('Print log lines for a task UPID')
    .action((node: string, upid: string) => {
      const opts = nodeCmd.parent?.opts() ?? {};
      nodeTasksLog(node, upid, { profile: opts['profile'] });
    });
}

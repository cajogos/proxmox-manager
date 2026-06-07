import { Command } from 'commander';
import { nodeList } from './list';
import { nodeStatus } from './status';
import { nodeVersion } from './version';
import { nodeShutdown } from './shutdown';
import { nodeReboot } from './reboot';
import { registerNodeServicesCommands } from './services/index';
import { registerNodeTasksCommands } from './tasks/index';

export function registerNodeCommands(program: Command): void {
  const node = program.command('node').description('Manage Proxmox nodes');

  node
    .command('list')
    .description('List all nodes in the cluster')
    .action(() => {
      const opts = program.opts();
      nodeList({ profile: opts['profile'], format: opts['format'] });
    });

  node
    .command('status <node>')
    .description('Show detailed status of a node')
    .action((name: string) => {
      const opts = program.opts();
      nodeStatus(name, { profile: opts['profile'], format: opts['format'] });
    });

  node
    .command('version <node>')
    .description('Show PVE version of a node')
    .action((name: string) => {
      const opts = program.opts();
      nodeVersion(name, { profile: opts['profile'], format: opts['format'] });
    });

  node
    .command('shutdown <node>')
    .description('Shut down a node (requires typed confirmation)')
    .action((name: string) => {
      const opts = program.opts();
      nodeShutdown(name, {
        profile: opts['profile'],
        dryRun: opts['dryRun'] ?? false,
        yes: opts['yes'] ?? false,
      });
    });

  node
    .command('reboot <node>')
    .description('Reboot a node (requires typed confirmation)')
    .action((name: string) => {
      const opts = program.opts();
      nodeReboot(name, {
        profile: opts['profile'],
        dryRun: opts['dryRun'] ?? false,
        yes: opts['yes'] ?? false,
      });
    });

  registerNodeServicesCommands(node);
  registerNodeTasksCommands(node);
}

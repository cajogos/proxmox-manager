import { Command } from 'commander';
import { nodeServicesList } from './list';
import { nodeServicesRestart } from './restart';

export function registerNodeServicesCommands(nodeCmd: Command): void {
  const services = nodeCmd.command('services').description('Manage Proxmox services on a node');

  services
    .command('list <node>')
    .description('List all services on a node')
    .action((node: string) => {
      const opts = nodeCmd.parent?.opts() ?? {};
      nodeServicesList(node, { profile: opts['profile'], format: opts['format'] ?? 'table' });
    });

  services
    .command('restart <node> <service>')
    .description('Restart a service on a node')
    .action((node: string, service: string) => {
      const opts = nodeCmd.parent?.opts() ?? {};
      nodeServicesRestart(node, service, { profile: opts['profile'], yes: opts['yes'] ?? false });
    });
}

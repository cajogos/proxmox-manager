import { Command } from 'commander';
import { networkList } from './list';
import { networkShow } from './show';

export function registerNetworkCommands(program: Command): void {
  const network = program.command('network').description('View node network configuration');

  network
    .command('list <node>')
    .description('List network interfaces on a node')
    .action((node: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      networkList(node, { profile: globals.profile, format: globals.format });
    });

  network
    .command('show <node> <iface>')
    .description('Show detail for a network interface')
    .action((node: string, iface: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      networkShow(node, iface, { profile: globals.profile, format: globals.format });
    });
}

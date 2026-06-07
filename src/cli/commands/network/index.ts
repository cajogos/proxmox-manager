import { Command } from 'commander';
import { NetworkIfaceType } from '../../../api/endpoints/network';
import { networkList } from './list';
import { networkShow } from './show';
import { networkCreate } from './create';
import { networkUpdate } from './update';
import { networkDelete } from './delete';
import { networkApply } from './apply';

export function registerNetworkCommands(program: Command): void {
  const network = program.command('network').description('Manage node network configuration');

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

  network
    .command('create <node> <iface> <type>')
    .description('Create a new network interface (bridge, bond, eth, vlan, …)')
    .option('--address <ip>', 'IPv4 address')
    .option('--netmask <mask>', 'IPv4 netmask')
    .option('--gateway <gw>', 'Default gateway')
    .option('--bridge-ports <ports>', 'Bridge member ports (space-separated)')
    .option('--bond-slaves <slaves>', 'Bond slave interfaces (space-separated)')
    .option('--bond-mode <mode>', 'Bond mode (e.g. active-backup, 802.3ad)')
    .option('--autostart', 'Bring up on boot')
    .option('--mtu <n>', 'MTU', parseInt)
    .option('--comments <text>', 'Interface comment')
    .action(async (node: string, iface: string, type: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; }>();
      const cmdOpts = cmd.opts<{
        address?: string; netmask?: string; gateway?: string;
        bridgePorts?: string; bondSlaves?: string; bondMode?: string;
        autostart?: boolean; mtu?: number; comments?: string;
      }>();
      await networkCreate(node, iface, type as NetworkIfaceType, {
        profile: globals.profile,
        dryRun: !!globals.dryRun,
        ...cmdOpts,
      });
    });

  network
    .command('update <node> <iface>')
    .description('Update an existing network interface')
    .option('--address <ip>', 'IPv4 address')
    .option('--netmask <mask>', 'IPv4 netmask')
    .option('--gateway <gw>', 'Default gateway')
    .option('--bridge-ports <ports>', 'Bridge member ports')
    .option('--bond-slaves <slaves>', 'Bond slave interfaces')
    .option('--bond-mode <mode>', 'Bond mode')
    .option('--autostart', 'Bring up on boot')
    .option('--mtu <n>', 'MTU', parseInt)
    .option('--comments <text>', 'Interface comment')
    .action(async (node: string, iface: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; }>();
      const cmdOpts = cmd.opts<{
        address?: string; netmask?: string; gateway?: string;
        bridgePorts?: string; bondSlaves?: string; bondMode?: string;
        autostart?: boolean; mtu?: number; comments?: string;
      }>();
      await networkUpdate(node, iface, {
        profile: globals.profile,
        dryRun: !!globals.dryRun,
        ...cmdOpts,
      });
    });

  network
    .command('delete <node> <iface>')
    .description('Delete a network interface (pending until apply)')
    .action(async (node: string, iface: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await networkDelete(node, iface, {
        profile: globals.profile,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });

  network
    .command('apply <node>')
    .description('Apply pending network configuration changes')
    .option('--revert', 'Discard pending changes instead of applying')
    .action(async (node: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean; }>();
      await networkApply(node, {
        profile: globals.profile,
        revert: cmd.opts().revert,
        dryRun: !!globals.dryRun,
        yes: !!globals.yes,
      });
    });
}

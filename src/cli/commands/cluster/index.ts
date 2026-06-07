import { Command } from 'commander';
import { clusterStatus } from './status';
import { clusterResources } from './resources';
import { clusterHA } from './ha';

export function registerClusterCommands(program: Command): void {
  const cluster = program.command('cluster').description('View Proxmox cluster state');

  cluster
    .command('status')
    .description('Show cluster status and node overview')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      clusterStatus({ profile: globals.profile, format: globals.format });
    });

  cluster
    .command('resources')
    .description('List all cluster resources')
    .option('--type <type>', 'Filter by type: vm, node, storage, pool')
    .action((cmdOpts: { type?: string }, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      clusterResources({ profile: globals.profile, format: globals.format, type: cmdOpts.type });
    });

  cluster
    .command('ha')
    .description('Show HA (High Availability) status')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      clusterHA({ profile: globals.profile, format: globals.format });
    });
}

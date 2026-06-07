import { Command } from 'commander';
import { listVMs } from './list';
import { OutputFormat } from '../../../output/formatter';

export function registerVMCommands(program: Command): void {
  const vm = program
    .command('vm')
    .description('Manage QEMU virtual machines');

  vm.command('list')
    .description('List all VMs across all nodes')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{
        profile?: string;
        format: string;
        dryRun: boolean;
      }>();

      await listVMs({
        profile: globals.profile,
        format: globals.format as OutputFormat,
        dryRun: !!globals.dryRun,
      });
    });
}

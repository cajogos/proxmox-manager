import { Command } from 'commander';
import { registerVMCommands } from './commands/vm/index';
import { registerLXCCommands } from './commands/lxc/index';
import { registerNodeCommands } from './commands/node/index';
import { registerStorageCommands } from './commands/storage/index';
import { registerClusterCommands } from './commands/cluster/index';
import { registerNetworkCommands } from './commands/network/index';
import { registerAccessCommands } from './commands/access/index';
import { registerBackupCommands } from './commands/backup/index';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('proxmox-manager')
    .description('Safe, audited Proxmox VE management CLI')
    .version('0.1.0')
    .option('--profile <name>', 'Profile name from config.json')
    .option('--format <format>', 'Output format: table, json, csv', 'table')
    .option('--dry-run', 'Show what would happen without executing')
    .option('--yes', 'Skip confirmation prompts');

  registerVMCommands(program);
  registerLXCCommands(program);
  registerNodeCommands(program);
  registerStorageCommands(program);
  registerClusterCommands(program);
  registerNetworkCommands(program);
  registerAccessCommands(program);
  registerBackupCommands(program);

  program.action(() => {
    program.outputHelp();
  });

  return program;
}

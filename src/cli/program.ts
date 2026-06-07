import { Command } from 'commander';
import { registerVMCommands } from './commands/vm/index';
import { registerLXCCommands } from './commands/lxc/index';
import { registerNodeCommands } from './commands/node/index';
import { registerStorageCommands } from './commands/storage/index';
import { registerClusterCommands } from './commands/cluster/index';
import { registerNetworkCommands } from './commands/network/index';
import { registerAccessCommands } from './commands/access/index';
import { registerBackupCommands } from './commands/backup/index';
import { registerFirewallCommands } from './commands/firewall/index';
import { registerSDNCommands } from './commands/sdn/index';
import { registerConfigCommands } from './commands/config/index';
import { doctor } from './commands/doctor';

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
  registerFirewallCommands(program);
  registerSDNCommands(program);
  registerConfigCommands(program);

  program
    .command('doctor')
    .description('Check configuration and connectivity to all profiles')
    .action(async () => {
      await doctor();
    });

  program.action(() => {
    program.outputHelp();
  });

  return program;
}

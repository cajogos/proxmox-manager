import { Command } from 'commander';
import { registerVMCommands } from './commands/vm/index';

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

  program.action(() => {
    program.outputHelp();
  });

  return program;
}

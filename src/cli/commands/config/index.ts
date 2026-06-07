import { Command } from 'commander';
import { configCheck } from './check';

export function registerConfigCommands(program: Command): void {
  const config = program.command('config').description('Manage and validate CLI configuration');

  config
    .command('check')
    .description('Validate config.json and test connectivity to all profiles')
    .action(async () => {
      await configCheck();
    });
}

import { Command } from 'commander';
import { accessUserList } from './list';
import { accessUserShow } from './show';

export function registerAccessUserCommands(accessCmd: Command): void {
  const user = accessCmd.command('user').description('Manage Proxmox users');

  user
    .command('list')
    .description('List all users')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      accessUserList({ profile: globals.profile, format: globals.format });
    });

  user
    .command('show <userid>')
    .description('Show details for a user')
    .action((userid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      accessUserShow(userid, { profile: globals.profile, format: globals.format });
    });
}

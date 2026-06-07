import { Command } from 'commander';
import { registerAccessUserCommands } from './user/index';
import { registerAccessTokenCommands } from './token/index';
import { accessGroupList } from './group/list';
import { accessRoleList } from './role/list';

export function registerAccessCommands(program: Command): void {
  const access = program.command('access').description('Manage Proxmox users, groups, roles, and API tokens');

  registerAccessUserCommands(access);
  registerAccessTokenCommands(access);

  const group = access.command('group').description('Manage Proxmox groups');
  group
    .command('list')
    .description('List all groups')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      accessGroupList({ profile: globals.profile, format: globals.format });
    });

  const role = access.command('role').description('Manage Proxmox roles');
  role
    .command('list')
    .description('List all roles')
    .action((_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      accessRoleList({ profile: globals.profile, format: globals.format });
    });
}

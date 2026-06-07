import { Command } from 'commander';
import { accessTokenList } from './list';
import { accessTokenCreate } from './create';
import { accessTokenDelete } from './delete';

export function registerAccessTokenCommands(accessCmd: Command): void {
  const token = accessCmd.command('token').description('Manage API tokens for a user');

  token
    .command('list <userid>')
    .description('List API tokens for a user')
    .action((userid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      accessTokenList(userid, { profile: globals.profile, format: globals.format });
    });

  token
    .command('create <userid> <tokenid>')
    .description('Create an API token for a user (secret shown once)')
    .option('--comment <text>', 'Token comment')
    .option('--expire <epoch>', 'Expiry as Unix timestamp (0 = no expiry)', parseInt)
    .option('--privsep <0|1>', 'Privilege separation (1 = limited, 0 = full)', parseInt)
    .action((userid: string, tokenid: string, opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string }>();
      accessTokenCreate(userid, tokenid, {
        profile: globals.profile,
        comment: opts.comment,
        expire: opts.expire,
        privsep: opts.privsep,
      });
    });

  token
    .command('delete <userid> <tokenid>')
    .description('Delete an API token')
    .option('--dry-run', 'Print intent without executing')
    .option('--yes', 'Skip confirmation prompt')
    .action((userid: string, tokenid: string, opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string }>();
      accessTokenDelete(userid, tokenid, {
        profile: globals.profile,
        dryRun: opts.dryRun ?? false,
        yes: opts.yes ?? false,
      });
    });
}

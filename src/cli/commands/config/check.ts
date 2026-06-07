import chalk from 'chalk';
import { loadConfig } from '../../../config/loader';
import { ProxmoxClient } from '../../../api/client';
import { getNodes } from '../../../api/endpoints/vm';
import { successMsg, errorMsg, warnMsg } from '../../../output/colors';
import { startSpinner } from '../../../output/spinner';

export async function configCheck(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(errorMsg(`Config load failed: ${e instanceof Error ? e.message : String(e)}`));
    process.exit(1);
  }

  console.log(chalk.bold('Config file:') + ' OK');

  const profileNames = Object.keys(config.profiles);
  if (profileNames.length === 0) {
    console.error(errorMsg('No profiles found in config.json.'));
    process.exit(1);
  }

  console.log(chalk.bold('Profiles found:') + ` ${profileNames.join(', ')}`);
  if (config.defaultProfile) {
    console.log(chalk.bold('Default profile:') + ` ${config.defaultProfile}`);
  } else {
    console.log(warnMsg('No defaultProfile set (must pass --profile on each command).'));
  }

  console.log(chalk.bold('Audit log:') + ` ${config.auditLog.path}`);
  console.log('');

  let allOk = true;
  for (const name of profileNames) {
    const profile = config.profiles[name]!;
    const spinner = startSpinner(`Testing profile "${name}" (${profile.host}:${profile.port})…`);
    try {
      const client = new ProxmoxClient(profile);
      const nodes = await getNodes(client);
      spinner.stop();
      console.log(successMsg(`  [${name}] Connected — ${nodes.length} node${nodes.length !== 1 ? 's' : ''} visible`));
    } catch (e) {
      spinner.stop();
      const msg = e instanceof Error ? e.message : String(e);
      console.error(errorMsg(`  [${name}] FAILED — ${msg}`));
      allOk = false;
    }
  }

  if (!allOk) {
    process.exit(1);
  }
}

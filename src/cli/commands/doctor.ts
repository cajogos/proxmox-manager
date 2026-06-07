import chalk from 'chalk';
import { loadConfig } from '../../config/loader';
import { ProxmoxClient } from '../../api/client';
import { getNodes } from '../../api/endpoints/vm';
import { getNodeDetail } from '../../api/endpoints/node';
import { successMsg, errorMsg, warnMsg } from '../../output/colors';
import { startSpinner } from '../../output/spinner';
import { humanMB } from '../../output/humanize';

function section(title: string): void {
  console.log('');
  console.log(chalk.bold.underline(title));
}

function ok(msg: string): void {
  console.log(chalk.green('  ✓') + ' ' + msg);
}

function fail(msg: string): void {
  console.log(chalk.red('  ✗') + ' ' + msg);
}

function warn(msg: string): void {
  console.log(chalk.yellow('  ⚠') + ' ' + msg);
}

function info(label: string, value: string): void {
  console.log('  ' + chalk.dim(label + ':') + ' ' + value);
}

export async function doctor(): Promise<void> {
  console.log(chalk.bold('proxmox-manager doctor'));
  console.log(chalk.dim('Checking your configuration and connectivity…'));

  section('Configuration');

  let config;
  try {
    config = loadConfig();
    ok('config.json loaded successfully');
  } catch (e) {
    fail(`Config load failed: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const profileNames = Object.keys(config.profiles);
  info('Profiles', profileNames.join(', ') || '(none)');
  info('Default profile', config.defaultProfile ?? chalk.yellow('(not set)'));
  info('Audit log', config.auditLog.path);

  if (profileNames.length === 0) {
    fail('No profiles configured.');
    process.exit(1);
  }

  if (!config.defaultProfile) {
    warn('No defaultProfile — you must pass --profile on every command.');
  } else {
    ok('defaultProfile is set');
  }

  section('Connectivity');

  let anyFailed = false;
  for (const name of profileNames) {
    const profile = config.profiles[name]!;
    const spinner = startSpinner(`Connecting to "${name}" (${profile.host}:${profile.port})…`);
    try {
      const client = new ProxmoxClient(profile);
      const nodes = await getNodes(client);
      spinner.stop();
      ok(`Profile "${name}" — reachable`);
      info('  Nodes', nodes.map(n => n.node).join(', '));
      info('  TLS', profile.rejectUnauthorized ? 'strict' : 'self-signed allowed');

      section(`Cluster — "${name}"`);
      for (const nodeInfo of nodes) {
        const detailSpinner = startSpinner(`  Fetching node ${nodeInfo.node}…`);
        try {
          const detail = await getNodeDetail(client, nodeInfo.node);
          detailSpinner.stop();
          const memPct = detail.memory
            ? Math.round((detail.memory.used / detail.memory.total) * 100)
            : null;
          const diskPct = detail.maxdisk && detail.disk
            ? Math.round((detail.disk / detail.maxdisk) * 100)
            : null;
          ok(`  ${nodeInfo.node} (${detail.pveversion ?? 'unknown version'})`);
          info('    CPU', `${Math.round((detail.cpu ?? 0) * 100)}%`);
          info('    Memory', memPct !== null ? `${memPct}% of ${humanMB((detail.memory?.total ?? 0) / 1024 / 1024)}` : 'unknown');
          info('    Disk', diskPct !== null ? `${diskPct}%` : 'unknown');
          info('    Uptime', detail.uptime ? `${Math.floor(detail.uptime / 86400)}d` : 'unknown');
        } catch {
          detailSpinner.stop();
          warn(`  ${nodeInfo.node} — could not fetch detail`);
        }
      }
    } catch (e) {
      spinner.stop();
      const msg = e instanceof Error ? e.message : String(e);
      fail(`Profile "${name}" — ${msg}`);
      anyFailed = true;
    }
  }

  console.log('');
  if (anyFailed) {
    console.log(errorMsg('One or more profiles failed. Check your config.json credentials and host reachability.'));
    process.exit(1);
  } else {
    console.log(successMsg('All profiles connected successfully.'));
  }
}

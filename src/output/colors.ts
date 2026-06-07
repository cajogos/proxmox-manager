import chalk from 'chalk';

export function statusColor(status: string): string {
  switch (status) {
    case 'running':   return chalk.green(status);
    case 'stopped':   return chalk.red(status);
    case 'paused':
    case 'suspended': return chalk.yellow(status);
    default:          return chalk.dim(status);
  }
}

export function successMsg(msg: string): string {
  return `${chalk.green('✓')} ${msg}`;
}

export function errorMsg(msg: string): string {
  return `${chalk.red('✗')} ${msg}`;
}

export function warnMsg(msg: string): string {
  return `${chalk.yellow('!')} ${msg}`;
}

export function dryRunMsg(msg: string): string {
  return `${chalk.cyan('[dry-run]')} ${msg}`;
}

import chalk from 'chalk';

export function checkDryRun(isDryRun: boolean, action: string, resource: string): boolean {
  if (isDryRun) {
    console.log(
      chalk.yellow('[DRY RUN]') +
      ` Would execute: ${chalk.bold(action)} on ${chalk.bold(resource)}`
    );
    return true;
  }
  return false;
}

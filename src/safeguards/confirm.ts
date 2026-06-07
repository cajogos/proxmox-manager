import prompts from 'prompts';
import chalk from 'chalk';

export async function confirmAction(
  action: string,
  resource: string,
  skipConfirm: boolean
): Promise<boolean> {
  if (skipConfirm) {
    return true;
  }

  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: `${chalk.red('!')} ${action} ${chalk.bold(resource)}. Are you sure?`,
    initial: false,
  });

  // prompts returns undefined when the user hits Ctrl+C
  return confirmed === true;
}

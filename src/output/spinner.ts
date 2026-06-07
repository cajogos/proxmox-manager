import ora from 'ora';

export function startSpinner(text: string): { stop(): void } {
  const spinner = ora(text).start();
  return { stop: () => spinner.stop() };
}

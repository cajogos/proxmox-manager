import ora from 'ora';

export function startSpinner(text: string): { stop(): void; setText(text: string): void } {
  const spinner = ora(text).start();
  return {
    stop: () => spinner.stop(),
    setText: (t: string) => { spinner.text = t; },
  };
}

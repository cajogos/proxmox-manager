import Table from 'cli-table3';
import chalk from 'chalk';

export type OutputFormat = 'table' | 'json' | 'csv';

export function output(data: Record<string, unknown>[], format: OutputFormat): void {
  if (data.length === 0) {
    console.log(chalk.gray('No results found.'));
    return;
  }

  switch (format) {
    case 'json':
      outputJSON(data);
      break;
    case 'csv':
      outputCSV(data);
      break;
    case 'table':
    default:
      outputTable(data);
      break;
  }
}

function outputTable(data: Record<string, unknown>[]): void {
  const headers = Object.keys(data[0]);
  const table = new Table({
    head: headers.map(h => chalk.cyan(h)),
    style: { head: [], border: [] },
  });

  for (const row of data) {
    table.push(headers.map(h => String(row[h] ?? '')));
  }

  console.log(table.toString());
}

function outputJSON(data: Record<string, unknown>[]): void {
  // Strip ANSI codes for clean JSON output
  const clean = data.map(row => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      cleaned[k] = typeof v === 'string' ? stripAnsi(v) : v;
    }
    return cleaned;
  });
  console.log(JSON.stringify(clean, null, 2));
}

function outputCSV(data: Record<string, unknown>[]): void {
  const headers = Object.keys(data[0]);
  console.log(headers.join(','));
  for (const row of data) {
    const values = headers.map(h => {
      const val = stripAnsi(String(row[h] ?? ''));
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    });
    console.log(values.join(','));
  }
}

// Minimal ANSI escape code stripper
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

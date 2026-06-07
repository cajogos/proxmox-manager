import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

export interface AuditEntry {
  timestamp: string;
  profile: string;
  command: string;
  resource: {
    type: string;
    id?: number | string;
    name?: string;
  };
  dryRun: boolean;
  result: 'success' | 'failed' | 'cancelled' | 'dry-run';
  error: string | null;
}

const DEFAULT_LOG_PATH = resolve(homedir(), '.proxmox-manager', 'audit.log');
let configuredPath = DEFAULT_LOG_PATH;

export function configureAuditLog(path: string): void {
  const resolved = path.replace(/^~/, homedir());
  configuredPath = resolve(resolved);
  ensureDir(configuredPath);
}

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function audit(entry: AuditEntry): void {
  ensureDir(configuredPath);
  appendFileSync(configuredPath, JSON.stringify(entry) + '\n', 'utf-8');
}

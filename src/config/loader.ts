import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { Config, ConfigSchema, Profile } from './types';

const CONFIG_SEARCH_PATHS = [
  resolve(process.cwd(), 'config.json'),
  resolve(homedir(), '.proxmox-manager', 'config.json'),
];

function findConfigFile(): string {
  for (const p of CONFIG_SEARCH_PATHS) {
    if (existsSync(p)) {
      return p;
    }
  }
  throw new Error(
    'No config.json found.\n' +
    'Copy config.example.json to config.json and fill in your credentials.'
  );
}

function normalizeLegacyConfig(raw: Record<string, unknown>): Record<string, unknown> {
  // New format already has a "profiles" key
  if ('profiles' in raw && typeof raw.profiles === 'object') {
    return raw;
  }

  // Legacy format: each top-level key is a profile name
  // e.g. { "homelab": { "API_TOKEN_ID": "...", "API_TOKEN_SECRET": "..." } }
  const profiles: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'object' && value !== null) {
      profiles[key] = value;
    }
  }

  const profileNames = Object.keys(profiles);
  return {
    defaultProfile: profileNames[0],
    profiles,
  };
}

export function loadConfig(): Config {
  const configPath = findConfigFile();

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
  } catch (e) {
    throw new Error(
      `Failed to parse config.json: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const normalized = normalizeLegacyConfig(raw);
  const result = ConfigSchema.safeParse(normalized);

  if (!result.success) {
    const issues = result.error.issues
      .map(i => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid config.json:\n${issues}`);
  }

  return result.data;
}

export function resolveProfile(config: Config, profileName?: string): { profile: Profile; name: string } {
  const name = profileName ?? config.defaultProfile;

  if (!name) {
    const names = Object.keys(config.profiles);
    if (names.length === 1) {
      return { profile: config.profiles[names[0]]!, name: names[0] };
    }
    throw new Error(
      'Multiple profiles found but no --profile specified and no defaultProfile set.\n' +
      `Available profiles: ${names.join(', ')}`
    );
  }

  const profile = config.profiles[name];
  if (!profile) {
    const available = Object.keys(config.profiles).join(', ');
    throw new Error(`Profile "${name}" not found in config.json. Available: ${available}`);
  }

  return { profile, name };
}

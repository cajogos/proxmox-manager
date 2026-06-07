import { describe, it, expect } from 'vitest';
import { resolveProfile } from '../../src/config/loader';
import type { Config } from '../../src/config/types';

const baseConfig: Config = {
  defaultProfile: 'homelab',
  auditLog: { path: '~/.proxmox-manager/audit.log' },
  profiles: {
    homelab: {
      host: '192.168.1.180',
      port: 8006,
      API_TOKEN_ID: 'root@pam!homelab',
      API_TOKEN_SECRET: 'abc123',
      rejectUnauthorized: false,
      safeguards: { protectedVMs: [100, 101], protectedNodes: ['pve'], protectedContainers: [] },
    },
    staging: {
      host: '10.0.0.1',
      port: 8006,
      API_TOKEN_ID: 'root@pam!staging',
      API_TOKEN_SECRET: 'xyz789',
      rejectUnauthorized: true,
      safeguards: { protectedVMs: [], protectedNodes: [], protectedContainers: [] },
    },
  },
};

describe('resolveProfile', () => {
  it('resolves default profile when no name given', () => {
    const { name, profile } = resolveProfile(baseConfig);
    expect(name).toBe('homelab');
    expect(profile.host).toBe('192.168.1.180');
  });

  it('resolves named profile', () => {
    const { name, profile } = resolveProfile(baseConfig, 'staging');
    expect(name).toBe('staging');
    expect(profile.host).toBe('10.0.0.1');
  });

  it('throws when profile not found', () => {
    expect(() => resolveProfile(baseConfig, 'nonexistent')).toThrow('nonexistent');
  });

  it('throws when no default and multiple profiles and no name given', () => {
    const noDefault: Config = { ...baseConfig, defaultProfile: undefined };
    expect(() => resolveProfile(noDefault)).toThrow('Multiple profiles');
  });

  it('auto-selects single profile when no default set', () => {
    const singleProfile: Config = {
      defaultProfile: undefined,
      auditLog: { path: '/tmp/audit.log' },
      profiles: {
        only: {
          host: '1.2.3.4',
          port: 8006,
          API_TOKEN_ID: 'root@pam!only',
          API_TOKEN_SECRET: 'secret',
          rejectUnauthorized: false,
          safeguards: { protectedVMs: [], protectedNodes: [], protectedContainers: [] },
        },
      },
    };
    const { name } = resolveProfile(singleProfile);
    expect(name).toBe('only');
  });
});

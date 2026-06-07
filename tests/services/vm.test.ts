import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Config } from '../../src/config/types';

const { mockListAllVMs, mockGetVMStatus } = vi.hoisted(() => ({
  mockListAllVMs: vi.fn(),
  mockGetVMStatus: vi.fn(),
}));

vi.mock('../../src/api/endpoints/vm', () => ({
  listAllVMs: mockListAllVMs,
  getVMStatus: mockGetVMStatus,
  getVMConfig: vi.fn(),
  startVM: vi.fn(),
  stopVM: vi.fn(),
  shutdownVM: vi.fn(),
  rebootVM: vi.fn(),
  suspendVM: vi.fn(),
  resumeVM: vi.fn(),
  deleteVM: vi.fn(),
  listSnapshots: vi.fn(),
  createSnapshot: vi.fn(),
  deleteSnapshot: vi.fn(),
  rollbackSnapshot: vi.fn(),
  cloneVM: vi.fn(),
  resizeVMDisk: vi.fn(),
  migrateVM: vi.fn(),
  getVMMigrationPreconditions: vi.fn(),
  getNodes: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
  ProxmoxClient: vi.fn().mockImplementation(function () { return {}; }),
}));

import { getVMs, getVMStatusService } from '../../src/services/vm';

const testConfig: Config = {
  defaultProfile: 'test',
  auditLog: { path: '/tmp/test-audit.log' },
  profiles: {
    test: {
      host: '192.168.1.1',
      port: 8006,
      API_TOKEN_ID: 'root@pam!test',
      API_TOKEN_SECRET: 'secret123',
      rejectUnauthorized: false,
      safeguards: { protectedVMs: [], protectedNodes: [], protectedContainers: [] },
    },
  },
};

describe('getVMs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok with VM list on success', async () => {
    const fakeVMs = [
      { vmid: 100, name: 'ubuntu', status: 'running', node: 'pve' },
      { vmid: 101, name: 'debian', status: 'stopped', node: 'pve' },
    ];
    mockListAllVMs.mockResolvedValue(fakeVMs);

    const result = await getVMs(testConfig, 'test');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({ vmid: 100, name: 'ubuntu' });
    }
  });

  it('returns error when API throws', async () => {
    mockListAllVMs.mockRejectedValue(new Error('Connection refused'));

    const result = await getVMs(testConfig, 'test');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Connection refused');
    }
  });
});

describe('getVMStatusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves node automatically when not provided', async () => {
    mockListAllVMs.mockResolvedValue([{ vmid: 100, status: 'running', node: 'pve2' }]);
    mockGetVMStatus.mockResolvedValue({ vmid: 100, status: 'running', node: 'pve2', name: 'myvm' });

    const result = await getVMStatusService(testConfig, 100, { profile: 'test' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.node).toBe('pve2');
    }
  });

  it('returns error when VM not found on any node', async () => {
    mockListAllVMs.mockResolvedValue([{ vmid: 200, status: 'running', node: 'pve' }]);

    const result = await getVMStatusService(testConfig, 999, { profile: 'test' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('999');
    }
  });
});

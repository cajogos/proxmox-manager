import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Config } from '../../src/config/types';

const { mockListAllStorage, mockResolveStorageNode, mockListStorageContent } = vi.hoisted(() => ({
  mockListAllStorage: vi.fn(),
  mockResolveStorageNode: vi.fn(),
  mockListStorageContent: vi.fn(),
}));

vi.mock('../../src/api/endpoints/storage', () => ({
  listAllStorage: mockListAllStorage,
  getStorageStatus: vi.fn(),
  listStorageContent: mockListStorageContent,
  deleteStorageContent: vi.fn(),
  uploadStorageContent: vi.fn(),
  listAllBackups: vi.fn(),
  resolveStorageNode: mockResolveStorageNode,
}));

vi.mock('../../src/api/client', () => ({
  ProxmoxClient: vi.fn().mockImplementation(function () { return {}; }),
}));

import { listStorageService, listStorageContentService } from '../../src/services/storage';

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

describe('listStorageService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns storage list on success', async () => {
    const fakeStorage = [
      { storage: 'local', type: 'dir', total: 100000, used: 30000 },
      { storage: 'local-lvm', type: 'lvmthin', total: 500000, used: 100000 },
    ];
    mockListAllStorage.mockResolvedValue(fakeStorage);

    const result = await listStorageService(testConfig, { profile: 'test' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.storage).toBe('local');
    }
  });

  it('returns error on API failure', async () => {
    mockListAllStorage.mockRejectedValue(new Error('Auth failed'));

    const result = await listStorageService(testConfig, { profile: 'test' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Auth failed');
    }
  });
});

describe('listStorageContentService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('auto-discovers node when --node is omitted', async () => {
    mockResolveStorageNode.mockResolvedValue('pve');
    mockListStorageContent.mockResolvedValue([
      { volid: 'local:iso/ubuntu.iso', content: 'iso', size: 1000000 },
    ]);

    const result = await listStorageContentService(testConfig, 'local', { profile: 'test' });

    expect(result.ok).toBe(true);
    expect(mockResolveStorageNode).toHaveBeenCalledWith(expect.anything(), 'local');
    expect(mockListStorageContent).toHaveBeenCalledWith(expect.anything(), 'pve', 'local', undefined);
  });

  it('uses provided --node without discovery', async () => {
    mockListStorageContent.mockResolvedValue([]);

    await listStorageContentService(testConfig, 'local', { profile: 'test', node: 'pve2' });

    expect(mockResolveStorageNode).not.toHaveBeenCalled();
    expect(mockListStorageContent).toHaveBeenCalledWith(expect.anything(), 'pve2', 'local', undefined);
  });
});

import fs from 'fs';
import path from 'path';
import { ProxmoxClient } from '../client';
import { getNodes } from './vm';

export interface StorageInfo {
  storage: string;
  type: string;
  content?: string;
  avail?: number;
  total?: number;
  used?: number;
  active?: number;
  enabled?: number;
  node?: string;
}

export interface StorageContent {
  volid: string;
  content: string;
  format?: string;
  size?: number;
  ctime?: number;
  notes?: string;
  vmid?: number;
}

export async function listAllStorage(client: ProxmoxClient): Promise<StorageInfo[]> {
  const nodes = await getNodes(client);
  const seen = new Map<string, StorageInfo>();

  await Promise.all(
    nodes.map(async (n) => {
      try {
        const pools = await client.get<StorageInfo[]>(`/nodes/${n.node}/storage`);
        for (const pool of pools) {
          const existing = seen.get(pool.storage);
          if (!existing || (pool.total ?? 0) > (existing.total ?? 0)) {
            seen.set(pool.storage, { ...pool, node: n.node });
          }
        }
      } catch {
        // node unreachable — skip
      }
    }),
  );

  return Array.from(seen.values());
}

export async function getStorageStatus(
  client: ProxmoxClient,
  node: string,
  storage: string,
): Promise<StorageInfo> {
  return client.get<StorageInfo>(`/nodes/${node}/storage/${storage}/status`);
}

export async function listStorageContent(
  client: ProxmoxClient,
  node: string,
  storage: string,
  contentType?: string,
): Promise<StorageContent[]> {
  const qs = contentType ? `?content=${encodeURIComponent(contentType)}` : '';
  return client.get<StorageContent[]>(`/nodes/${node}/storage/${storage}/content${qs}`);
}

export async function deleteStorageContent(
  client: ProxmoxClient,
  node: string,
  storage: string,
  volid: string,
): Promise<void> {
  await client.delete<unknown>(
    `/nodes/${node}/storage/${storage}/content/${encodeURIComponent(volid)}`,
  );
}

export async function uploadStorageContent(
  client: ProxmoxClient,
  node: string,
  storage: string,
  filePath: string,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);
  const fd = new FormData();
  fd.append('content', contentType);
  fd.append('filename', path.basename(filePath));
  fd.append('file', blob, path.basename(filePath));

  await client.upload<unknown>(`/nodes/${node}/storage/${storage}/upload`, fd, onProgress);
}

export async function resolveStorageNode(client: ProxmoxClient, storage: string): Promise<string> {
  const nodes = await getNodes(client);
  for (const { node } of nodes) {
    try {
      const pools = await client.get<StorageInfo[]>(`/nodes/${node}/storage`);
      if (pools.some(p => p.storage === storage)) {
        return node;
      }
    } catch {
      // node unreachable — skip
    }
  }
  throw new Error(`Storage "${storage}" not found on any node. Use --node to specify.`);
}

export async function listAllBackups(client: ProxmoxClient): Promise<StorageContent[]> {
  const nodes = await getNodes(client);
  const results: StorageContent[] = [];

  await Promise.all(
    nodes.map(async (n) => {
      try {
        const pools = await client.get<StorageInfo[]>(`/nodes/${n.node}/storage`);
        const backupPools = pools.filter(p => p.content?.includes('backup'));
        await Promise.all(
          backupPools.map(async (p) => {
            try {
              const items = await client.get<StorageContent[]>(
                `/nodes/${n.node}/storage/${p.storage}/content?content=backup`,
              );
              results.push(...items);
            } catch {
              // storage unreachable — skip
            }
          }),
        );
      } catch {
        // node unreachable — skip
      }
    }),
  );

  return results;
}

import { ProxmoxClient } from '../client';

export interface BackupJob {
  id: string;
  enabled?: number;
  schedule?: string;
  storage?: string;
  node?: string;
  vmid?: string;
  mode?: string;
  compress?: string;
  mailnotification?: string;
  mailto?: string;
  comment?: string;
  dow?: string;
  starttime?: string;
  all?: number;
  exclude?: string;
}

export interface CreateBackupJobParams {
  storage: string;
  schedule?: string;
  node?: string;
  vmid?: string;
  mode?: 'snapshot' | 'suspend' | 'stop';
  compress?: 'lzo' | 'gzip' | 'zstd' | 'none';
  all?: number;
  enabled?: number;
  comment?: string;
  mailto?: string;
}

export async function listBackupJobs(client: ProxmoxClient): Promise<BackupJob[]> {
  return client.get<BackupJob[]>('/cluster/backup');
}

export async function getBackupJob(client: ProxmoxClient, id: string): Promise<BackupJob> {
  return client.get<BackupJob>(`/cluster/backup/${encodeURIComponent(id)}`);
}

export async function createBackupJob(
  client: ProxmoxClient,
  params: CreateBackupJobParams,
): Promise<void> {
  await client.post<unknown>('/cluster/backup', params as unknown as Record<string, unknown>);
}

export async function deleteBackupJob(client: ProxmoxClient, id: string): Promise<void> {
  await client.delete<unknown>(`/cluster/backup/${encodeURIComponent(id)}`);
}

import { ProxmoxClient } from '../client';

export interface ClusterStatusEntry {
  name: string;
  type: string;
  id: string;
  online?: number;
  ip?: string;
  local?: number;
  quorate?: number;
  nodeid?: number;
  version?: number;
  nodes?: number;
}

export interface ClusterResource {
  id: string;
  type: string;
  node?: string;
  status?: string;
  name?: string;
  vmid?: number;
  maxcpu?: number;
  cpu?: number;
  maxmem?: number;
  mem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
  pool?: string;
  hastate?: string;
}

export interface HAStatusEntry {
  sid: string;
  state: string;
  type?: string;
  node?: string;
  crm_state?: string;
  lrm_state?: string;
}

export async function listClusterStatus(client: ProxmoxClient): Promise<ClusterStatusEntry[]> {
  return client.get<ClusterStatusEntry[]>('/cluster/status');
}

export async function listClusterResources(
  client: ProxmoxClient,
  type?: string,
): Promise<ClusterResource[]> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return client.get<ClusterResource[]>(`/cluster/resources${qs}`);
}

export async function listHAStatus(client: ProxmoxClient): Promise<HAStatusEntry[]> {
  return client.get<HAStatusEntry[]>('/cluster/ha/status/current');
}

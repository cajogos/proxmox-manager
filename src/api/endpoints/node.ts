import { ProxmoxClient } from '../client';
import { getNodes, NodeInfo } from './vm';

export { NodeInfo };

export interface NodeDetail {
  node: string;
  status: string;
  cpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
  pveversion?: string;
  kversion?: string;
  cpuinfo?: { cpus: number; model: string; cores: number; sockets: number };
  memory?: { used: number; total: number; free: number };
  swap?: { used: number; total: number; free: number };
  loadavg?: string[];
}

export interface ServiceInfo {
  name: string;
  desc?: string;
  state: string;
  'unit-file-state'?: string;
}

export interface TaskInfo {
  upid: string;
  node: string;
  pid?: number;
  starttime: number;
  type: string;
  id?: string;
  user: string;
  status?: string;
  endtime?: number;
}

export interface TaskLog {
  n: number;
  t: string;
}

export interface NodeVersion {
  version: string;
  release: string;
  repoid: string;
}

export async function listNodes(client: ProxmoxClient): Promise<NodeInfo[]> {
  return getNodes(client);
}

export async function getNodeDetail(client: ProxmoxClient, node: string): Promise<NodeDetail> {
  return client.get<NodeDetail>(`/nodes/${node}/status`);
}

export async function getNodeVersion(client: ProxmoxClient, node: string): Promise<NodeVersion> {
  return client.get<NodeVersion>(`/nodes/${node}/version`);
}

export async function shutdownNode(client: ProxmoxClient, node: string): Promise<void> {
  await client.post<unknown>(`/nodes/${node}/status`, { command: 'shutdown' });
}

export async function rebootNode(client: ProxmoxClient, node: string): Promise<void> {
  await client.post<unknown>(`/nodes/${node}/status`, { command: 'reboot' });
}

export async function listServices(client: ProxmoxClient, node: string): Promise<ServiceInfo[]> {
  return client.get<ServiceInfo[]>(`/nodes/${node}/services`);
}

export async function restartService(client: ProxmoxClient, node: string, service: string): Promise<void> {
  await client.post<unknown>(`/nodes/${node}/services/${service}/restart`);
}

export async function listTasks(
  client: ProxmoxClient,
  node: string,
  limit: number = 50,
): Promise<TaskInfo[]> {
  return client.get<TaskInfo[]>(`/nodes/${node}/tasks?limit=${limit}`);
}

export async function getTaskLog(
  client: ProxmoxClient,
  node: string,
  upid: string,
): Promise<TaskLog[]> {
  return client.get<TaskLog[]>(`/nodes/${node}/tasks/${encodeURIComponent(upid)}/log`);
}

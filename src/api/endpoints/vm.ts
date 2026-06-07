import { ProxmoxClient } from '../client';

export interface VMInfo {
  vmid: number;
  name?: string;
  status: 'running' | 'stopped' | 'paused' | 'suspended' | string;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  pid?: number;
  template?: number;
  tags?: string;
}

export interface NodeVMInfo extends VMInfo {
  node: string;
}

export interface VMStatusDetail {
  vmid: number;
  name?: string;
  status: string;
  uptime?: number;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  pid?: number;
  qmpstatus?: string;
  node: string;
}

export type VMConfig = Record<string, unknown>;

export interface SnapshotInfo {
  snapname: string;
  description?: string;
  snaptime?: number;
  vmstate?: number;
  parent?: string;
}

export interface NodeInfo {
  node: string;
  status: string;
  cpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
  pveversion?: string;
}

export async function getNodes(client: ProxmoxClient): Promise<NodeInfo[]> {
  return client.get<NodeInfo[]>('/nodes');
}

export async function listAllVMs(client: ProxmoxClient): Promise<NodeVMInfo[]> {
  const nodes = await getNodes(client);
  const results: NodeVMInfo[] = [];

  for (const { node } of nodes) {
    const vms = await client.get<VMInfo[]>(`/nodes/${node}/qemu`);
    for (const vm of vms) {
      results.push({ ...vm, node });
    }
  }

  return results;
}

export async function getVMStatus(client: ProxmoxClient, node: string, vmid: number): Promise<VMStatusDetail> {
  const data = await client.get<VMStatusDetail>(`/nodes/${node}/qemu/${vmid}/status/current`);
  return { ...data, node };
}

export async function getVMConfig(client: ProxmoxClient, node: string, vmid: number): Promise<VMConfig> {
  return client.get<VMConfig>(`/nodes/${node}/qemu/${vmid}/config`);
}

export async function startVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/start`);
}

export async function stopVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/stop`);
}

export async function shutdownVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/shutdown`);
}

export async function rebootVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/reboot`);
}

export async function suspendVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/suspend`);
}

export async function resumeVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/status/resume`);
}

export async function deleteVM(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.delete(`/nodes/${node}/qemu/${vmid}`);
}

export async function listSnapshots(client: ProxmoxClient, node: string, vmid: number): Promise<SnapshotInfo[]> {
  return client.get<SnapshotInfo[]>(`/nodes/${node}/qemu/${vmid}/snapshot`);
}

export async function createSnapshot(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  name: string,
  description?: string
): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/snapshot`, {
    snapname: name,
    ...(description ? { description } : {}),
  });
}

export async function deleteSnapshot(client: ProxmoxClient, node: string, vmid: number, name: string): Promise<void> {
  await client.delete(`/nodes/${node}/qemu/${vmid}/snapshot/${name}`);
}

export async function rollbackSnapshot(client: ProxmoxClient, node: string, vmid: number, name: string): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/snapshot/${name}/rollback`);
}

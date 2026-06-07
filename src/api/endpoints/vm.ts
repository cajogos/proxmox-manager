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

export interface NodeInfo {
  node: string;
  status: string;
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

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

export interface CloneVMParams {
  newid: number;
  name?: string;
  target?: string;
  full?: boolean;
  storage?: string;
  description?: string;
}

export async function cloneVM(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  params: CloneVMParams,
): Promise<string> {
  return client.post<string>(`/nodes/${node}/qemu/${vmid}/clone`, {
    newid: params.newid,
    ...(params.name ? { name: params.name } : {}),
    ...(params.target ? { target: params.target } : {}),
    ...(params.full !== undefined ? { full: params.full ? 1 : 0 } : {}),
    ...(params.storage ? { storage: params.storage } : {}),
    ...(params.description ? { description: params.description } : {}),
  });
}

export async function resizeVMDisk(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  disk: string,
  size: string,
): Promise<void> {
  await client.put(`/nodes/${node}/qemu/${vmid}/resize`, { disk, size });
}

export async function getVMMigrationPreconditions(
  client: ProxmoxClient,
  node: string,
  vmid: number,
): Promise<Record<string, unknown>> {
  return client.get<Record<string, unknown>>(`/nodes/${node}/qemu/${vmid}/migrate`);
}

export interface MigrateVMParams {
  target: string;
  online?: boolean;
  'with-local-disks'?: boolean;
}

export async function migrateVM(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  params: MigrateVMParams,
): Promise<string> {
  return client.post<string>(`/nodes/${node}/qemu/${vmid}/migrate`, {
    target: params.target,
    ...(params.online ? { online: 1 } : {}),
    ...(params['with-local-disks'] ? { 'with-local-disks': 1 } : {}),
  });
}

export interface CreateVMParams {
  vmid: number;
  name?: string;
  memory?: number;
  cores?: number;
  sockets?: number;
  cpu?: string;
  ostype?: string;
  disk?: string;
  iso?: string;
  net?: string;
  start?: boolean;
}

export async function createVM(
  client: ProxmoxClient,
  node: string,
  params: CreateVMParams,
): Promise<string> {
  const body: Record<string, unknown> = { vmid: params.vmid };
  if (params.name)    body['name']    = params.name;
  if (params.memory)  body['memory']  = params.memory;
  if (params.cores)   body['cores']   = params.cores;
  if (params.sockets) body['sockets'] = params.sockets;
  if (params.cpu)     body['cpu']     = params.cpu;
  if (params.ostype)  body['ostype']  = params.ostype;
  if (params.disk)    body['scsi0']   = params.disk;
  if (params.iso)     body['ide2']    = `${params.iso},media=cdrom`;
  if (params.net)     body['net0']    = params.net;
  if (params.start)   body['start']   = 1;
  return client.post<string>(`/nodes/${node}/qemu`, body);
}

interface AgentNetworkInterface {
  name: string;
  'ip-addresses'?: { 'ip-address': string; 'ip-address-type': 'ipv4' | 'ipv6'; prefix: number }[];
}

export async function getVMIPs(client: ProxmoxClient, node: string, vmid: number): Promise<string[]> {
  const result = await client.get<{ result: AgentNetworkInterface[] }>(
    `/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`,
  );
  const ifaces = result?.result ?? [];
  return ifaces
    .filter(i => i.name !== 'lo')
    .flatMap(i => (i['ip-addresses'] ?? []))
    .filter(a => a['ip-address-type'] === 'ipv4')
    .map(a => a['ip-address']);
}

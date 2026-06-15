import { spawnSync } from 'child_process';
import { ProxmoxClient } from '../client';
import { getNodes } from './vm';

export interface LXCInfo {
  vmid: number;
  name?: string;
  status: 'running' | 'stopped' | 'paused' | 'suspended' | string;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  template?: number;
  tags?: string;
}

export interface NodeLXCInfo extends LXCInfo {
  node: string;
}

export interface LXCStatusDetail {
  vmid: number;
  name?: string;
  status: string;
  uptime?: number;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  node: string;
}

export type LXCConfig = Record<string, unknown>;

export interface LXCSnapshotInfo {
  snapname: string;
  description?: string;
  snaptime?: number;
  parent?: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function listAllLXC(client: ProxmoxClient): Promise<NodeLXCInfo[]> {
  const nodes = await getNodes(client);
  const results: NodeLXCInfo[] = [];

  for (const { node } of nodes) {
    const containers = await client.get<LXCInfo[]>(`/nodes/${node}/lxc`);
    for (const ct of containers) {
      results.push({ ...ct, node });
    }
  }

  return results;
}

export async function getLXCStatus(client: ProxmoxClient, node: string, vmid: number): Promise<LXCStatusDetail> {
  const data = await client.get<LXCStatusDetail>(`/nodes/${node}/lxc/${vmid}/status/current`);
  return { ...data, node };
}

export async function getLXCConfig(client: ProxmoxClient, node: string, vmid: number): Promise<LXCConfig> {
  return client.get<LXCConfig>(`/nodes/${node}/lxc/${vmid}/config`);
}

export async function startLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/start`);
}

export async function stopLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/stop`);
}

export async function shutdownLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/shutdown`);
}

export async function rebootLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/reboot`);
}

export async function suspendLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/suspend`);
}

export async function resumeLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/status/resume`);
}

export async function deleteLXC(client: ProxmoxClient, node: string, vmid: number): Promise<void> {
  await client.delete(`/nodes/${node}/lxc/${vmid}`);
}

export async function listLXCSnapshots(client: ProxmoxClient, node: string, vmid: number): Promise<LXCSnapshotInfo[]> {
  return client.get<LXCSnapshotInfo[]>(`/nodes/${node}/lxc/${vmid}/snapshot`);
}

export async function createLXCSnapshot(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  name: string,
  description?: string
): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/snapshot`, {
    snapname: name,
    ...(description ? { description } : {}),
  });
}

export async function deleteLXCSnapshot(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  name: string
): Promise<void> {
  await client.delete(`/nodes/${node}/lxc/${vmid}/snapshot/${name}`);
}

export async function rollbackLXCSnapshot(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  name: string
): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/snapshot/${name}/rollback`);
}

export function execLXC(host: string, vmid: number, command: string[]): ExecResult {
  const result = spawnSync('ssh', [`root@${host}`, 'pct', 'exec', String(vmid), '--', ...command], {
    encoding: 'utf-8',
  });

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
}

export interface CreateLXCParams {
  vmid: number;
  hostname: string;
  ostemplate: string;
  rootfs: string;
  memory?: number;
  cores?: number;
  password?: string;
  net?: string;
  unprivileged?: boolean;
  start?: boolean;
}

export async function createLXC(
  client: ProxmoxClient,
  node: string,
  params: CreateLXCParams,
): Promise<string> {
  const body: Record<string, unknown> = {
    vmid: params.vmid,
    hostname: params.hostname,
    ostemplate: params.ostemplate,
    rootfs: params.rootfs,
  };
  if (params.memory)      body['memory']      = params.memory;
  if (params.cores)       body['cores']       = params.cores;
  if (params.password)    body['password']    = params.password;
  if (params.net)         body['net0']        = params.net;
  if (params.unprivileged !== undefined) body['unprivileged'] = params.unprivileged ? 1 : 0;
  if (params.start)       body['start']       = 1;
  return client.post<string>(`/nodes/${node}/lxc`, body);
}

export interface CloneLXCParams {
  newid: number;
  hostname?: string;
  target?: string;
  full?: boolean;
  storage?: string;
  description?: string;
}

export async function cloneLXC(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  params: CloneLXCParams,
): Promise<string> {
  return client.post<string>(`/nodes/${node}/lxc/${vmid}/clone`, {
    newid: params.newid,
    ...(params.hostname ? { hostname: params.hostname } : {}),
    ...(params.target ? { target: params.target } : {}),
    ...(params.full !== undefined ? { full: params.full ? 1 : 0 } : {}),
    ...(params.storage ? { storage: params.storage } : {}),
    ...(params.description ? { description: params.description } : {}),
  });
}

export async function resizeLXCDisk(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  disk: string,
  size: string,
): Promise<void> {
  await client.put(`/nodes/${node}/lxc/${vmid}/resize`, { disk, size });
}

export interface TermProxyResult {
  ticket: string;
  port: string;
  upid: string;
  user: string;
}

export async function createLXCTermProxy(
  client: ProxmoxClient,
  node: string,
  vmid: number,
): Promise<TermProxyResult> {
  return client.post<TermProxyResult>(`/nodes/${node}/lxc/${vmid}/termproxy`);
}

interface LXCNetInterface {
  name: string;
  inet?: string;
  inet6?: string;
}

export async function getLXCIPs(client: ProxmoxClient, node: string, vmid: number): Promise<string[]> {
  const ifaces = await client.get<LXCNetInterface[]>(`/nodes/${node}/lxc/${vmid}/interfaces`);
  return (ifaces ?? [])
    .filter(i => i.name !== 'lo' && i.inet)
    .map(i => (i.inet as string).split('/')[0]);
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, opts);
    const body = await res.json() as ApiResult<T>;
    if (!res.ok) {
      return { ok: false, error: (body as { ok: false; error: string }).error ?? `HTTP ${res.status}` };
    }
    return body;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function qs(profile?: string): string {
  return profile ? `?profile=${encodeURIComponent(profile)}` : '';
}

// --- Types ---

export interface VMInfo {
  vmid: number;
  name: string;
  status: string;
  node: string;
  cpus?: number;
  maxmem?: number;
  mem?: number;
  maxdisk?: number;
  uptime?: number;
  template?: number;
  tags?: string;
}

export interface LXCInfo {
  vmid: number;
  name: string;
  status: string;
  node: string;
  cpus?: number;
  maxmem?: number;
  mem?: number;
  maxdisk?: number;
  uptime?: number;
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
}

export interface StorageInfo {
  storage: string;
  type: string;
  total?: number;
  used?: number;
  avail?: number;
  active?: number;
  enabled?: number;
}

export interface ClusterStatusEntry {
  id: string;
  name: string;
  type: string;
  online?: number;
  ip?: string;
  quorate?: number;
  nodeid?: number;
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

export interface NetworkIface {
  iface: string;
  type: string;
  active?: number;
  autostart?: number;
  address?: string;
  netmask?: string;
  gateway?: string;
  bridge_ports?: string;
  mtu?: number;
  comments?: string;
}

export interface AccessUser {
  userid: string;
  comment?: string;
  enable?: number;
  expire?: number;
  groups?: string;
  firstname?: string;
  lastname?: string;
}

export interface AccessGroup {
  groupid: string;
  comment?: string;
  users?: string;
}

export interface AccessRole {
  roleid: string;
  privs?: string;
  special?: number;
}

export interface BackupJob {
  id: string;
  schedule?: string;
  storage?: string;
  mode?: string;
  enabled?: number;
  comment?: string;
  vmid?: string;
  node?: string;
}

// --- VM ---

export function getVMs(profile?: string): Promise<ApiResult<VMInfo[]>> {
  return apiFetch<VMInfo[]>(`/api/vms${qs(profile)}`);
}

export function getVM(vmid: number, profile?: string): Promise<ApiResult<VMInfo>> {
  return apiFetch<VMInfo>(`/api/vms/${vmid}${qs(profile)}`);
}

export function getVMIPs(vmid: number, profile?: string): Promise<ApiResult<string[]>> {
  return apiFetch<string[]>(`/api/vms/${vmid}/ips${qs(profile)}`);
}

export function vmAction(vmid: number, action: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/vms/${vmid}/${action}${qs(profile)}`, { method: 'POST' });
}

// --- LXC ---

export function getLXC(profile?: string): Promise<ApiResult<LXCInfo[]>> {
  return apiFetch<LXCInfo[]>(`/api/lxc${qs(profile)}`);
}

export function lxcAction(ctid: number, action: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/lxc/${ctid}/${action}${qs(profile)}`, { method: 'POST' });
}

export function getLXCIPs(ctid: number, profile?: string): Promise<ApiResult<string[]>> {
  return apiFetch<string[]>(`/api/lxc/${ctid}/ips${qs(profile)}`);
}

// --- Nodes ---

export function getNodes(profile?: string): Promise<ApiResult<NodeInfo[]>> {
  return apiFetch<NodeInfo[]>(`/api/nodes${qs(profile)}`);
}

// --- Storage ---

export function getStorage(profile?: string): Promise<ApiResult<StorageInfo[]>> {
  return apiFetch<StorageInfo[]>(`/api/storage${qs(profile)}`);
}

// --- Cluster ---

export function getClusterStatus(profile?: string): Promise<ApiResult<ClusterStatusEntry[]>> {
  return apiFetch<ClusterStatusEntry[]>(`/api/cluster/status${qs(profile)}`);
}

export function getClusterResources(profile?: string, type?: string): Promise<ApiResult<ClusterResource[]>> {
  const params = new URLSearchParams();
  if (profile) params.set('profile', profile);
  if (type) params.set('type', type);
  const q = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ClusterResource[]>(`/api/cluster/resources${q}`);
}

export function getClusterHA(profile?: string): Promise<ApiResult<unknown[]>> {
  return apiFetch<unknown[]>(`/api/cluster/ha${qs(profile)}`);
}

// --- Network ---

export function getNetworkIfaces(node: string, profile?: string): Promise<ApiResult<NetworkIface[]>> {
  return apiFetch<NetworkIface[]>(`/api/network/${encodeURIComponent(node)}${qs(profile)}`);
}

export function getNetworkIface(node: string, iface: string, profile?: string): Promise<ApiResult<NetworkIface>> {
  return apiFetch<NetworkIface>(`/api/network/${encodeURIComponent(node)}/${encodeURIComponent(iface)}${qs(profile)}`);
}

// --- Access ---

export function getAccessUsers(profile?: string): Promise<ApiResult<AccessUser[]>> {
  return apiFetch<AccessUser[]>(`/api/access/users${qs(profile)}`);
}

export function getAccessGroups(profile?: string): Promise<ApiResult<AccessGroup[]>> {
  return apiFetch<AccessGroup[]>(`/api/access/groups${qs(profile)}`);
}

export function getAccessRoles(profile?: string): Promise<ApiResult<AccessRole[]>> {
  return apiFetch<AccessRole[]>(`/api/access/roles${qs(profile)}`);
}

// --- Backup jobs ---

export function getBackupJobs(profile?: string): Promise<ApiResult<BackupJob[]>> {
  return apiFetch<BackupJob[]>(`/api/backup${qs(profile)}`);
}

export function deleteBackupJob(id: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/backup/${encodeURIComponent(id)}${qs(profile)}`, { method: 'DELETE' });
}

// --- Docs ---

export interface DocEntry {
  name: string;
  file: string;
}

export function getDocs(): Promise<ApiResult<DocEntry[]>> {
  return apiFetch<DocEntry[]>('/api/docs');
}

export function getDocFile(file: string): Promise<ApiResult<string>> {
  return apiFetch<string>(`/api/docs/${encodeURIComponent(file)}`);
}

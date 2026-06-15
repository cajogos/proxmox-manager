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

export interface CreateVMParams {
  name: string;
  node: string;
  vmid?: number;
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

export function createVM(
  params: CreateVMParams,
  profile?: string,
): Promise<ApiResult<{ vmid: number; node: string; upid: string }>> {
  return apiFetch(`/api/vms${qs(profile)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export function getVMConfig(vmid: number, profile?: string): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch(`/api/vms/${vmid}/config${qs(profile)}`);
}

export function getVMSnapshots(vmid: number, profile?: string): Promise<ApiResult<{ snapname: string; description?: string; snaptime?: number; vmstate?: number; parent?: string }[]>> {
  return apiFetch(`/api/vms/${vmid}/snapshots${qs(profile)}`);
}

export function createVMSnapshot(vmid: number, name: string, description?: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/vms/${vmid}/snapshots${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
}

export function deleteVMSnapshot(vmid: number, name: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/vms/${vmid}/snapshots/${encodeURIComponent(name)}${qs(profile)}`, { method: 'DELETE' });
}

export function rollbackVMSnapshot(vmid: number, name: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/vms/${vmid}/snapshots/${encodeURIComponent(name)}/rollback${qs(profile)}`, { method: 'POST' });
}

export function cloneVM(vmid: number, params: { newid: number; name?: string; target?: string; full?: boolean; storage?: string }, profile?: string): Promise<ApiResult<string>> {
  return apiFetch(`/api/vms/${vmid}/clone${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
}

export function migrateVM(vmid: number, params: { target: string; online?: boolean }, profile?: string): Promise<ApiResult<{ upid: string }>> {
  return apiFetch(`/api/vms/${vmid}/migrate${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
}

export function resizeVMDisk(vmid: number, disk: string, size: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/vms/${vmid}/resize${qs(profile)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disk, size }),
  });
}

// --- LXC ---

export interface CreateLXCParams {
  hostname: string;
  node: string;
  ostemplate: string;
  rootfs: string;
  vmid?: number;
  memory?: number;
  cores?: number;
  password?: string;
  net?: string;
  unprivileged?: boolean;
  start?: boolean;
}

export function getLXC(profile?: string): Promise<ApiResult<LXCInfo[]>> {
  return apiFetch<LXCInfo[]>(`/api/lxc${qs(profile)}`);
}

export function lxcAction(ctid: number, action: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/lxc/${ctid}/${action}${qs(profile)}`, { method: 'POST' });
}

export function getLXCIPs(ctid: number, profile?: string): Promise<ApiResult<string[]>> {
  return apiFetch<string[]>(`/api/lxc/${ctid}/ips${qs(profile)}`);
}

export function createLXC(
  params: CreateLXCParams,
  profile?: string,
): Promise<ApiResult<{ vmid: number; node: string; upid: string }>> {
  return apiFetch(`/api/lxc${qs(profile)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export function getLXCConfig(ctid: number, profile?: string): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch(`/api/lxc/${ctid}/config${qs(profile)}`);
}

export function getLXCSnapshots(ctid: number, profile?: string): Promise<ApiResult<{ snapname: string; description?: string; snaptime?: number; parent?: string }[]>> {
  return apiFetch(`/api/lxc/${ctid}/snapshots${qs(profile)}`);
}

export function createLXCSnapshot(ctid: number, name: string, description?: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/lxc/${ctid}/snapshots${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
}

export function deleteLXCSnapshot(ctid: number, name: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/lxc/${ctid}/snapshots/${encodeURIComponent(name)}${qs(profile)}`, { method: 'DELETE' });
}

export function rollbackLXCSnapshot(ctid: number, name: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/lxc/${ctid}/snapshots/${encodeURIComponent(name)}/rollback${qs(profile)}`, { method: 'POST' });
}

export function cloneLXC(ctid: number, params: { newid: number; hostname?: string; target?: string; full?: boolean; storage?: string }, profile?: string): Promise<ApiResult<string>> {
  return apiFetch(`/api/lxc/${ctid}/clone${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
}

export function resizeLXCDisk(ctid: number, disk: string, size: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/lxc/${ctid}/resize${qs(profile)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disk, size }),
  });
}

// --- Nodes ---

export function getNodes(profile?: string): Promise<ApiResult<NodeInfo[]>> {
  return apiFetch<NodeInfo[]>(`/api/nodes${qs(profile)}`);
}

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

export function getNodeDetail(node: string, profile?: string): Promise<ApiResult<NodeDetail>> {
  return apiFetch<NodeDetail>(`/api/nodes/${encodeURIComponent(node)}${qs(profile)}`);
}

export function getNodeServices(node: string, profile?: string): Promise<ApiResult<ServiceInfo[]>> {
  return apiFetch<ServiceInfo[]>(`/api/nodes/${encodeURIComponent(node)}/services${qs(profile)}`);
}

export function getNodeTasks(node: string, profile?: string): Promise<ApiResult<TaskInfo[]>> {
  return apiFetch<TaskInfo[]>(`/api/nodes/${encodeURIComponent(node)}/tasks${qs(profile)}`);
}

// --- Storage ---

export function getStorage(profile?: string): Promise<ApiResult<StorageInfo[]>> {
  return apiFetch<StorageInfo[]>(`/api/storage${qs(profile)}`);
}

// --- Cluster ---

export function getNextVMID(profile?: string): Promise<ApiResult<number>> {
  return apiFetch<number>(`/api/cluster/nextid${qs(profile)}`);
}

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

export interface AccessToken {
  tokenid: string;
  comment?: string;
  expire?: number;
  privsep?: number;
}

export interface CreatedTokenSecret {
  'full-tokenid': string;
  info: AccessToken;
  value: string;
}

// --- Access ---

export function getAccessUsers(profile?: string): Promise<ApiResult<AccessUser[]>> {
  return apiFetch<AccessUser[]>(`/api/access/users${qs(profile)}`);
}

export function createAccessUser(
  params: { userid: string; password?: string; firstname?: string; lastname?: string; email?: string; groups?: string; enable?: number; comment?: string },
  profile?: string,
): Promise<ApiResult<null>> {
  return apiFetch(`/api/access/users${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteAccessUser(userid: string, profile?: string): Promise<ApiResult<null>> {
  return apiFetch(`/api/access/users/${encodeURIComponent(userid)}${qs(profile)}`, { method: 'DELETE' });
}

export function getAccessGroups(profile?: string): Promise<ApiResult<AccessGroup[]>> {
  return apiFetch<AccessGroup[]>(`/api/access/groups${qs(profile)}`);
}

export function createAccessGroup(params: { groupid: string; comment?: string }, profile?: string): Promise<ApiResult<null>> {
  return apiFetch(`/api/access/groups${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteAccessGroup(groupid: string, profile?: string): Promise<ApiResult<null>> {
  return apiFetch(`/api/access/groups/${encodeURIComponent(groupid)}${qs(profile)}`, { method: 'DELETE' });
}

export function getAccessRoles(profile?: string): Promise<ApiResult<AccessRole[]>> {
  return apiFetch<AccessRole[]>(`/api/access/roles${qs(profile)}`);
}

export function getAccessUserTokens(userid: string, profile?: string): Promise<ApiResult<AccessToken[]>> {
  return apiFetch<AccessToken[]>(`/api/access/users/${encodeURIComponent(userid)}/tokens${qs(profile)}`);
}

export function createAccessToken(
  userid: string,
  tokenid: string,
  params: { comment?: string; expire?: number; privsep?: number },
  profile?: string,
): Promise<ApiResult<CreatedTokenSecret>> {
  return apiFetch<CreatedTokenSecret>(`/api/access/users/${encodeURIComponent(userid)}/tokens/${encodeURIComponent(tokenid)}${qs(profile)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
}

export function deleteAccessToken(userid: string, tokenid: string, profile?: string): Promise<ApiResult<null>> {
  return apiFetch(`/api/access/users/${encodeURIComponent(userid)}/tokens/${encodeURIComponent(tokenid)}${qs(profile)}`, { method: 'DELETE' });
}

// --- SDN ---

export interface SDNZone {
  zone: string;
  type: string;
  nodes?: string;
  bridge?: string;
  pending?: number;
  state?: string;
}

export interface SDNVNet {
  vnet: string;
  zone: string;
  alias?: string;
  tag?: number;
  pending?: number;
  state?: string;
}

export interface SDNSubnet {
  subnet: string;
  cidr?: string;
  gateway?: string;
  snat?: number;
  type?: string;
}

export function getSDNZones(profile?: string): Promise<ApiResult<SDNZone[]>> {
  return apiFetch<SDNZone[]>(`/api/sdn/zones${qs(profile)}`);
}

export function getSDNVNets(profile?: string): Promise<ApiResult<SDNVNet[]>> {
  return apiFetch<SDNVNet[]>(`/api/sdn/vnets${qs(profile)}`);
}

export function getSDNSubnets(vnet: string, profile?: string): Promise<ApiResult<SDNSubnet[]>> {
  return apiFetch<SDNSubnet[]>(`/api/sdn/vnets/${encodeURIComponent(vnet)}/subnets${qs(profile)}`);
}

// --- Firewall ---

export interface FirewallRule {
  pos: number;
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  type: 'in' | 'out' | 'group';
  enable?: number;
  comment?: string;
  source?: string;
  dest?: string;
  proto?: string;
  dport?: string;
}

export interface CreateFirewallRuleParams {
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  type: 'in' | 'out';
  enable?: boolean;
  comment?: string;
  source?: string;
  dest?: string;
  proto?: string;
  dport?: string;
}

export function getClusterFirewallRules(profile?: string): Promise<ApiResult<FirewallRule[]>> {
  return apiFetch<FirewallRule[]>(`/api/firewall/cluster${qs(profile)}`);
}

export function createClusterFirewallRule(params: CreateFirewallRuleParams, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/cluster${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteClusterFirewallRule(pos: number, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/cluster/${pos}${qs(profile)}`, { method: 'DELETE' });
}

export function getVMFirewallRules(vmid: number, profile?: string): Promise<ApiResult<FirewallRule[]>> {
  return apiFetch<FirewallRule[]>(`/api/firewall/vms/${vmid}${qs(profile)}`);
}

export function createVMFirewallRule(vmid: number, params: CreateFirewallRuleParams, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/vms/${vmid}${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteVMFirewallRule(vmid: number, pos: number, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/vms/${vmid}/${pos}${qs(profile)}`, { method: 'DELETE' });
}

export function getLXCFirewallRules(ctid: number, profile?: string): Promise<ApiResult<FirewallRule[]>> {
  return apiFetch<FirewallRule[]>(`/api/firewall/lxc/${ctid}${qs(profile)}`);
}

export function createLXCFirewallRule(ctid: number, params: CreateFirewallRuleParams, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/lxc/${ctid}${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteLXCFirewallRule(ctid: number, pos: number, profile?: string): Promise<ApiResult<void>> {
  return apiFetch(`/api/firewall/lxc/${ctid}/${pos}${qs(profile)}`, { method: 'DELETE' });
}

// --- Backup jobs ---

export function getBackupJobs(profile?: string): Promise<ApiResult<BackupJob[]>> {
  return apiFetch<BackupJob[]>(`/api/backup${qs(profile)}`);
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
}

export function createBackupJob(params: CreateBackupJobParams, profile?: string): Promise<ApiResult<null>> {
  return apiFetch(`/api/backup${qs(profile)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
}

export function deleteBackupJob(id: string, profile?: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/backup/${encodeURIComponent(id)}${qs(profile)}`, { method: 'DELETE' });
}

// --- Docs ---

export interface DocEntry {
  name: string;
  file: string;
}

export interface DocSection {
  name: string;
  section: string;
  files: DocEntry[];
}

export function getDocs(): Promise<ApiResult<{ sections: DocSection[] }>> {
  return apiFetch<{ sections: DocSection[] }>('/api/docs');
}

export function getDocFile(section: string, file: string): Promise<ApiResult<string>> {
  return apiFetch<string>(`/api/docs/${encodeURIComponent(section)}/${encodeURIComponent(file)}`);
}

export function getLLMContext(): Promise<ApiResult<string>> {
  return apiFetch<string>('/api/docs/llms-context');
}

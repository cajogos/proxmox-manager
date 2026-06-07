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

export interface VMInfo {
  vmid: number;
  name: string;
  status: string;
  node: string;
  cpus?: number;
  maxmem?: number;
  mem?: number;
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

export function getVMs(profile?: string): Promise<ApiResult<VMInfo[]>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<VMInfo[]>(`/api/vms${qs}`);
}

export function getVM(vmid: number, profile?: string): Promise<ApiResult<VMInfo>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<VMInfo>(`/api/vms/${vmid}${qs}`);
}

export function vmAction(vmid: number, action: string, profile?: string): Promise<ApiResult<void>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<void>(`/api/vms/${vmid}/${action}${qs}`, { method: 'POST' });
}

export function getLXC(profile?: string): Promise<ApiResult<LXCInfo[]>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<LXCInfo[]>(`/api/lxc${qs}`);
}

export function lxcAction(ctid: number, action: string, profile?: string): Promise<ApiResult<void>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<void>(`/api/lxc/${ctid}/${action}${qs}`, { method: 'POST' });
}

export function getNodes(profile?: string): Promise<ApiResult<NodeInfo[]>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<NodeInfo[]>(`/api/nodes${qs}`);
}

export function getStorage(profile?: string): Promise<ApiResult<StorageInfo[]>> {
  const qs = profile ? `?profile=${encodeURIComponent(profile)}` : '';
  return apiFetch<StorageInfo[]>(`/api/storage${qs}`);
}

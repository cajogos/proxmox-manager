import { ProxmoxClient } from '../client';

export interface NetworkIface {
  iface: string;
  type: string;
  active?: number;
  autostart?: number;
  method?: string;
  method6?: string;
  address?: string;
  netmask?: string;
  gateway?: string;
  address6?: string;
  netmask6?: string;
  gateway6?: string;
  bridge_ports?: string;
  bridge_stp?: string;
  bridge_fd?: string;
  bond_slaves?: string;
  bond_mode?: string;
  mtu?: number;
  comments?: string;
  priority?: number;
}

export async function listNetworkIfaces(
  client: ProxmoxClient,
  node: string,
): Promise<NetworkIface[]> {
  return client.get<NetworkIface[]>(`/nodes/${node}/network`);
}

export async function getNetworkIface(
  client: ProxmoxClient,
  node: string,
  iface: string,
): Promise<NetworkIface> {
  return client.get<NetworkIface>(`/nodes/${node}/network/${iface}`);
}

export type NetworkIfaceType =
  | 'bridge'
  | 'bond'
  | 'eth'
  | 'alias'
  | 'vlan'
  | 'OVSBridge'
  | 'OVSBond'
  | 'OVSPort'
  | 'OVSIntPort';

export interface CreateNetworkIfaceParams {
  iface: string;
  type: NetworkIfaceType;
  address?: string;
  netmask?: string;
  gateway?: string;
  address6?: string;
  netmask6?: string;
  gateway6?: string;
  bridge_ports?: string;
  bond_slaves?: string;
  bond_mode?: string;
  autostart?: boolean;
  mtu?: number;
  comments?: string;
}

export type UpdateNetworkIfaceParams = Partial<Omit<CreateNetworkIfaceParams, 'iface' | 'type'>>;

export async function createNetworkIface(
  client: ProxmoxClient,
  node: string,
  params: CreateNetworkIfaceParams,
): Promise<void> {
  const { autostart, ...rest } = params;
  await client.post(`/nodes/${node}/network`, {
    ...rest,
    ...(autostart !== undefined ? { autostart: autostart ? 1 : 0 } : {}),
  });
}

export async function updateNetworkIface(
  client: ProxmoxClient,
  node: string,
  iface: string,
  params: UpdateNetworkIfaceParams,
): Promise<void> {
  const { autostart, ...rest } = params;
  await client.put(`/nodes/${node}/network/${iface}`, {
    ...rest,
    ...(autostart !== undefined ? { autostart: autostart ? 1 : 0 } : {}),
  });
}

export async function deleteNetworkIface(
  client: ProxmoxClient,
  node: string,
  iface: string,
): Promise<void> {
  await client.delete<unknown>(`/nodes/${node}/network/${iface}`);
}

export async function applyNetworkConfig(client: ProxmoxClient, node: string): Promise<void> {
  await client.put(`/nodes/${node}/network`);
}

export async function revertNetworkConfig(client: ProxmoxClient, node: string): Promise<void> {
  await client.delete<unknown>(`/nodes/${node}/network`);
}

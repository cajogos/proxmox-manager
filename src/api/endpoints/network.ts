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

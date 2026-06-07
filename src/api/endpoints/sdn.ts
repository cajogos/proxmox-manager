import { ProxmoxClient } from '../client';

export interface SDNZone {
  zone: string;
  type: string;
  nodes?: string;
  bridge?: string;
  dns?: string;
  reversedns?: string;
  dnszone?: string;
  pending?: number;
  state?: string;
  dhcp?: string;
  ipam?: string;
  mtu?: number;
}

export interface SDNVNet {
  vnet: string;
  zone: string;
  alias?: string;
  tag?: number;
  vlanaware?: number;
  pending?: number;
  state?: string;
}

export interface SDNSubnet {
  subnet: string;
  cidr?: string;
  gateway?: string;
  snat?: number;
  dnszoneprefix?: string;
  type?: string;
}

export async function listSDNZones(client: ProxmoxClient): Promise<SDNZone[]> {
  return client.get<SDNZone[]>('/cluster/sdn/zones');
}

export async function listSDNVNets(client: ProxmoxClient): Promise<SDNVNet[]> {
  return client.get<SDNVNet[]>('/cluster/sdn/vnets');
}

export async function listSDNSubnets(
  client: ProxmoxClient,
  vnet: string,
): Promise<SDNSubnet[]> {
  return client.get<SDNSubnet[]>(`/cluster/sdn/vnets/${vnet}/subnets`);
}

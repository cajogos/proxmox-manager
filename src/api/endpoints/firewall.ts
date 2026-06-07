import { ProxmoxClient } from '../client';

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
  sport?: string;
  macro?: string;
  iface?: string;
  log?: string;
}

export interface CreateFirewallRuleParams {
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  type: 'in' | 'out' | 'group';
  enable?: boolean;
  comment?: string;
  source?: string;
  dest?: string;
  proto?: string;
  dport?: string;
  sport?: string;
  macro?: string;
  pos?: number;
  iface?: string;
}

function ruleParamsToBody(params: CreateFirewallRuleParams): Record<string, unknown> {
  const { enable, ...rest } = params;
  return {
    ...rest,
    ...(enable !== undefined ? { enable: enable ? 1 : 0 } : {}),
  };
}

export async function listClusterFirewallRules(client: ProxmoxClient): Promise<FirewallRule[]> {
  return client.get<FirewallRule[]>('/cluster/firewall/rules');
}

export async function createClusterFirewallRule(
  client: ProxmoxClient,
  params: CreateFirewallRuleParams,
): Promise<void> {
  await client.post('/cluster/firewall/rules', ruleParamsToBody(params));
}

export async function deleteClusterFirewallRule(
  client: ProxmoxClient,
  pos: number,
): Promise<void> {
  await client.delete<unknown>(`/cluster/firewall/rules/${pos}`);
}

export async function listVMFirewallRules(
  client: ProxmoxClient,
  node: string,
  vmid: number,
): Promise<FirewallRule[]> {
  return client.get<FirewallRule[]>(`/nodes/${node}/qemu/${vmid}/firewall/rules`);
}

export async function createVMFirewallRule(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  params: CreateFirewallRuleParams,
): Promise<void> {
  await client.post(`/nodes/${node}/qemu/${vmid}/firewall/rules`, ruleParamsToBody(params));
}

export async function deleteVMFirewallRule(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  pos: number,
): Promise<void> {
  await client.delete<unknown>(`/nodes/${node}/qemu/${vmid}/firewall/rules/${pos}`);
}

export async function listLXCFirewallRules(
  client: ProxmoxClient,
  node: string,
  vmid: number,
): Promise<FirewallRule[]> {
  return client.get<FirewallRule[]>(`/nodes/${node}/lxc/${vmid}/firewall/rules`);
}

export async function createLXCFirewallRule(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  params: CreateFirewallRuleParams,
): Promise<void> {
  await client.post(`/nodes/${node}/lxc/${vmid}/firewall/rules`, ruleParamsToBody(params));
}

export async function deleteLXCFirewallRule(
  client: ProxmoxClient,
  node: string,
  vmid: number,
  pos: number,
): Promise<void> {
  await client.delete<unknown>(`/nodes/${node}/lxc/${vmid}/firewall/rules/${pos}`);
}

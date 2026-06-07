import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listClusterFirewallRules,
  createClusterFirewallRule,
  deleteClusterFirewallRule,
  listVMFirewallRules,
  createVMFirewallRule,
  deleteVMFirewallRule,
  listLXCFirewallRules,
  createLXCFirewallRule,
  deleteLXCFirewallRule,
  FirewallRule,
  CreateFirewallRuleParams,
} from '../api/endpoints/firewall';
import { resolveVMNode } from './vm';
import { resolveLXCNode } from './lxc';
import { CommandResult } from './types';

export interface FirewallOpts {
  profile?: string;
  node?: string;
}

export async function listClusterFirewallRulesService(
  config: Config,
  opts: FirewallOpts,
): Promise<CommandResult<FirewallRule[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listClusterFirewallRules(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createClusterFirewallRuleService(
  config: Config,
  params: CreateFirewallRuleParams,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await createClusterFirewallRule(client, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteClusterFirewallRuleService(
  config: Config,
  pos: number,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await deleteClusterFirewallRule(client, pos);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listVMFirewallRulesService(
  config: Config,
  vmid: number,
  opts: FirewallOpts,
): Promise<CommandResult<FirewallRule[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const data = await listVMFirewallRules(client, node, vmid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createVMFirewallRuleService(
  config: Config,
  vmid: number,
  params: CreateFirewallRuleParams,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await createVMFirewallRule(client, node, vmid, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteVMFirewallRuleService(
  config: Config,
  vmid: number,
  pos: number,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await deleteVMFirewallRule(client, node, vmid, pos);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listLXCFirewallRulesService(
  config: Config,
  ctid: number,
  opts: FirewallOpts,
): Promise<CommandResult<FirewallRule[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const data = await listLXCFirewallRules(client, node, ctid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createLXCFirewallRuleService(
  config: Config,
  ctid: number,
  params: CreateFirewallRuleParams,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await createLXCFirewallRule(client, node, ctid, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteLXCFirewallRuleService(
  config: Config,
  ctid: number,
  pos: number,
  opts: FirewallOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await deleteLXCFirewallRule(client, node, ctid, pos);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type { FirewallRule, CreateFirewallRuleParams };

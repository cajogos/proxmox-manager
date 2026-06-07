import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listNetworkIfaces,
  getNetworkIface,
  createNetworkIface,
  updateNetworkIface,
  deleteNetworkIface,
  applyNetworkConfig,
  revertNetworkConfig,
  CreateNetworkIfaceParams,
  UpdateNetworkIfaceParams,
  NetworkIface,
} from '../api/endpoints/network';
import { CommandResult } from './types';

export interface NetworkOpts {
  profile?: string;
}

export async function listNetworkIfacesService(
  config: Config,
  node: string,
  opts: NetworkOpts,
): Promise<CommandResult<NetworkIface[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listNetworkIfaces(client, node);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getNetworkIfaceService(
  config: Config,
  node: string,
  iface: string,
  opts: NetworkOpts,
): Promise<CommandResult<NetworkIface>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getNetworkIface(client, node, iface);
    return { ok: true, data: { ...data, iface } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createNetworkIfaceService(
  config: Config,
  node: string,
  params: CreateNetworkIfaceParams,
  opts: NetworkOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await createNetworkIface(client, node, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function updateNetworkIfaceService(
  config: Config,
  node: string,
  iface: string,
  params: UpdateNetworkIfaceParams,
  opts: NetworkOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await updateNetworkIface(client, node, iface, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteNetworkIfaceService(
  config: Config,
  node: string,
  iface: string,
  opts: NetworkOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await deleteNetworkIface(client, node, iface);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function applyNetworkConfigService(
  config: Config,
  node: string,
  opts: NetworkOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await applyNetworkConfig(client, node);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function revertNetworkConfigService(
  config: Config,
  node: string,
  opts: NetworkOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await revertNetworkConfig(client, node);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type { CreateNetworkIfaceParams, UpdateNetworkIfaceParams };

import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listNetworkIfaces,
  getNetworkIface,
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

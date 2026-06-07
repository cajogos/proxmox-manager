import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listSDNZones,
  listSDNVNets,
  listSDNSubnets,
  SDNZone,
  SDNVNet,
  SDNSubnet,
} from '../api/endpoints/sdn';
import { CommandResult } from './types';

export interface SDNOpts {
  profile?: string;
}

export async function listSDNZonesService(
  config: Config,
  opts: SDNOpts,
): Promise<CommandResult<SDNZone[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listSDNZones(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listSDNVNetsService(
  config: Config,
  opts: SDNOpts,
): Promise<CommandResult<SDNVNet[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listSDNVNets(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listSDNSubnetsService(
  config: Config,
  vnet: string,
  opts: SDNOpts,
): Promise<CommandResult<SDNSubnet[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listSDNSubnets(client, vnet);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type { SDNZone, SDNVNet, SDNSubnet };

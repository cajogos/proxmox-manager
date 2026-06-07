import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listClusterStatus,
  listClusterResources,
  listHAStatus,
  ClusterStatusEntry,
  ClusterResource,
  HAStatusEntry,
} from '../api/endpoints/cluster';
import { CommandResult } from './types';

export interface ClusterOpts {
  profile?: string;
}

export interface ClusterResourcesOpts extends ClusterOpts {
  resourceType?: string;
}

export async function listClusterStatusService(
  config: Config,
  opts: ClusterOpts,
): Promise<CommandResult<ClusterStatusEntry[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listClusterStatus(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listClusterResourcesService(
  config: Config,
  opts: ClusterResourcesOpts,
): Promise<CommandResult<ClusterResource[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listClusterResources(client, opts.resourceType);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listHAStatusService(
  config: Config,
  opts: ClusterOpts,
): Promise<CommandResult<HAStatusEntry[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listHAStatus(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

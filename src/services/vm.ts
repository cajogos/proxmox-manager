import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import { listAllVMs, NodeVMInfo } from '../api/endpoints/vm';
import { CommandResult } from './types';

export async function getVMs(
  config: Config,
  profileName?: string
): Promise<CommandResult<NodeVMInfo[]>> {
  try {
    const { profile } = resolveProfile(config, profileName);
    const client = new ProxmoxClient(profile);
    const vms = await listAllVMs(client);
    return { ok: true, data: vms };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

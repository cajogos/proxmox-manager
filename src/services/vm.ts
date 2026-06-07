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

    if (vms.length === 0) {
      const hasAccess = await client.hasPermission('/vms');
      if (!hasAccess) {
        return {
          ok: false,
          error:
            'No permission to list VMs. Your API token may have privilege separation enabled.\n' +
            'Fix in Proxmox: Datacenter → Permissions → Add → API Token Permission\n' +
            '  Path: /  |  Token: ' + profile.API_TOKEN_ID + '  |  Role: Administrator\n' +
            'Or disable "Privilege Separation" on the token to inherit the user\'s permissions.',
        };
      }
    }

    return { ok: true, data: vms };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

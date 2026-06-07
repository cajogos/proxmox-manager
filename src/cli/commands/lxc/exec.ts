import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import { execLXCService } from '../../../services/lxc';
import { confirmAction } from '../../../safeguards/confirm';
import { warnMsg, errorMsg } from '../../../output/colors';

interface LXCExecOptions {
  profile?: string;
  node?: string;
  yes: boolean;
}

export async function lxcExec(ctid: number, command: string[], opts: LXCExecOptions): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'lxc exec',
    resource: { type: 'container', id: ctid, name: command.join(' ') },
    dryRun: false,
    source: 'cli' as const,
  };

  console.warn(warnMsg(`This will execute a command inside container ${ctid} via SSH to the Proxmox node.`));
  console.warn(warnMsg('Requires SSH key-based root access to the node.'));

  const confirmed = await confirmAction(`Execute "${command.join(' ')}" inside container`, String(ctid), opts.yes);
  if (!confirmed) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
    return;
  }

  const result = await execLXCService(config, ctid, command, { profile: opts.profile, node: opts.node });

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  if (result.data.stdout) {
    process.stdout.write(result.data.stdout);
  }

  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}

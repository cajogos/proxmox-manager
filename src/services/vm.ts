import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listAllVMs,
  getVMStatus,
  getVMConfig,
  startVM,
  stopVM,
  shutdownVM,
  rebootVM,
  suspendVM,
  resumeVM,
  deleteVM,
  listSnapshots,
  createSnapshot,
  deleteSnapshot,
  rollbackSnapshot,
  cloneVM,
  resizeVMDisk,
  migrateVM,
  getVMMigrationPreconditions,
  getVMIPs,
  createVM,
  CloneVMParams,
  MigrateVMParams,
  CreateVMParams,
  NodeVMInfo,
  VMStatusDetail,
  VMConfig,
  SnapshotInfo,
} from '../api/endpoints/vm';
import { getNextVMID } from '../api/endpoints/cluster';
import { CommandResult } from './types';

export interface VMActionOpts {
  profile?: string;
  node?: string;
}

async function resolveVMNode(client: ProxmoxClient, vmid: number, nodeName?: string): Promise<string> {
  if (nodeName) {
    return nodeName;
  }
  const vms = await listAllVMs(client);
  const vm = vms.find(v => v.vmid === vmid);
  if (!vm) {
    throw new Error(`VM ${vmid} not found on any node.`);
  }
  return vm.node;
}

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

export async function getVMStatusService(
  config: Config,
  vmid: number,
  opts: VMActionOpts
): Promise<CommandResult<VMStatusDetail>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const data = await getVMStatus(client, node, vmid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getVMConfigService(
  config: Config,
  vmid: number,
  opts: VMActionOpts
): Promise<CommandResult<VMConfig>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const data = await getVMConfig(client, node, vmid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function vmActionService(
  config: Config,
  vmid: number,
  action: 'start' | 'stop' | 'shutdown' | 'reboot' | 'suspend' | 'resume',
  opts: VMActionOpts
): Promise<CommandResult<void>> {
  const actionMap = { start: startVM, stop: stopVM, shutdown: shutdownVM, reboot: rebootVM, suspend: suspendVM, resume: resumeVM };
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await actionMap[action](client, node, vmid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteVMService(
  config: Config,
  vmid: number,
  opts: VMActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await deleteVM(client, node, vmid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listSnapshotsService(
  config: Config,
  vmid: number,
  opts: VMActionOpts
): Promise<CommandResult<SnapshotInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const data = await listSnapshots(client, node, vmid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createSnapshotService(
  config: Config,
  vmid: number,
  name: string,
  opts: VMActionOpts & { description?: string }
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await createSnapshot(client, node, vmid, name, opts.description);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteSnapshotService(
  config: Config,
  vmid: number,
  name: string,
  opts: VMActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await deleteSnapshot(client, node, vmid, name);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function rollbackSnapshotService(
  config: Config,
  vmid: number,
  name: string,
  opts: VMActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await rollbackSnapshot(client, node, vmid, name);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloneVMService(
  config: Config,
  vmid: number,
  params: CloneVMParams,
  opts: VMActionOpts,
): Promise<CommandResult<string>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const upid = await cloneVM(client, node, vmid, params);
    return { ok: true, data: upid };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function resizeVMDiskService(
  config: Config,
  vmid: number,
  disk: string,
  size: string,
  opts: VMActionOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    await resizeVMDisk(client, node, vmid, disk, size);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function migrateVMService(
  config: Config,
  vmid: number,
  params: MigrateVMParams,
  opts: VMActionOpts,
): Promise<CommandResult<{ upid: string; preconditions: Record<string, unknown> }>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const preconditions = await getVMMigrationPreconditions(client, node, vmid);
    const upid = await migrateVM(client, node, vmid, params);
    return { ok: true, data: { upid, preconditions } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getVMIPsService(
  config: Config,
  vmid: number,
  opts: VMActionOpts,
): Promise<CommandResult<string[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveVMNode(client, vmid, opts.node);
    const ips = await getVMIPs(client, node, vmid);
    return { ok: true, data: ips };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface CreateVMOpts {
  profile?: string;
  node: string;
}

export async function createVMService(
  config: Config,
  params: Omit<CreateVMParams, 'vmid'> & { vmid?: number },
  opts: CreateVMOpts,
): Promise<CommandResult<{ vmid: number; node: string; upid: string }>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const vmid = params.vmid ?? await getNextVMID(client);
    const upid = await createVM(client, opts.node, { ...params, vmid });
    return { ok: true, data: { vmid, node: opts.node, upid } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export { resolveVMNode };

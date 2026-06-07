import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listAllLXC,
  getLXCStatus,
  getLXCConfig,
  startLXC,
  stopLXC,
  shutdownLXC,
  rebootLXC,
  suspendLXC,
  resumeLXC,
  deleteLXC,
  listLXCSnapshots,
  createLXCSnapshot,
  deleteLXCSnapshot,
  rollbackLXCSnapshot,
  execLXC,
  cloneLXC,
  resizeLXCDisk,
  createLXCTermProxy,
  CloneLXCParams,
  TermProxyResult,
  NodeLXCInfo,
  LXCStatusDetail,
  LXCConfig,
  LXCSnapshotInfo,
  ExecResult,
} from '../api/endpoints/lxc';
import { CommandResult } from './types';

export interface LXCActionOpts {
  profile?: string;
  node?: string;
}

async function resolveLXCNode(client: ProxmoxClient, ctid: number, nodeName?: string): Promise<string> {
  if (nodeName) {
    return nodeName;
  }
  const containers = await listAllLXC(client);
  const ct = containers.find(c => c.vmid === ctid);
  if (!ct) {
    throw new Error(`Container ${ctid} not found on any node.`);
  }
  return ct.node;
}

export async function getLXCList(
  config: Config,
  profileName?: string
): Promise<CommandResult<NodeLXCInfo[]>> {
  try {
    const { profile } = resolveProfile(config, profileName);
    const client = new ProxmoxClient(profile);
    const containers = await listAllLXC(client);
    return { ok: true, data: containers };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getLXCStatusService(
  config: Config,
  ctid: number,
  opts: LXCActionOpts
): Promise<CommandResult<LXCStatusDetail>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const data = await getLXCStatus(client, node, ctid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getLXCConfigService(
  config: Config,
  ctid: number,
  opts: LXCActionOpts
): Promise<CommandResult<LXCConfig>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const data = await getLXCConfig(client, node, ctid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function lxcActionService(
  config: Config,
  ctid: number,
  action: 'start' | 'stop' | 'shutdown' | 'reboot' | 'suspend' | 'resume',
  opts: LXCActionOpts
): Promise<CommandResult<void>> {
  const actionMap = { start: startLXC, stop: stopLXC, shutdown: shutdownLXC, reboot: rebootLXC, suspend: suspendLXC, resume: resumeLXC };
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await actionMap[action](client, node, ctid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteLXCService(
  config: Config,
  ctid: number,
  opts: LXCActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await deleteLXC(client, node, ctid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listLXCSnapshotsService(
  config: Config,
  ctid: number,
  opts: LXCActionOpts
): Promise<CommandResult<LXCSnapshotInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const data = await listLXCSnapshots(client, node, ctid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createLXCSnapshotService(
  config: Config,
  ctid: number,
  name: string,
  opts: LXCActionOpts & { description?: string }
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await createLXCSnapshot(client, node, ctid, name, opts.description);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteLXCSnapshotService(
  config: Config,
  ctid: number,
  name: string,
  opts: LXCActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await deleteLXCSnapshot(client, node, ctid, name);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function rollbackLXCSnapshotService(
  config: Config,
  ctid: number,
  name: string,
  opts: LXCActionOpts
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await rollbackLXCSnapshot(client, node, ctid, name);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function execLXCService(
  config: Config,
  ctid: number,
  command: string[],
  opts: LXCActionOpts
): Promise<CommandResult<ExecResult>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await resolveLXCNode(client, ctid, opts.node);
    const result = execLXC(profile.host, ctid, command);
    if (result.exitCode !== 0) {
      return { ok: false, error: result.stderr || `Command exited with code ${result.exitCode}` };
    }
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloneLXCService(
  config: Config,
  ctid: number,
  params: CloneLXCParams,
  opts: LXCActionOpts,
): Promise<CommandResult<string>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const upid = await cloneLXC(client, node, ctid, params);
    return { ok: true, data: upid };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function resizeLXCDiskService(
  config: Config,
  ctid: number,
  disk: string,
  size: string,
  opts: LXCActionOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    await resizeLXCDisk(client, node, ctid, disk, size);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createLXCTermProxyService(
  config: Config,
  ctid: number,
  opts: LXCActionOpts,
): Promise<CommandResult<TermProxyResult & { node: string }>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = await resolveLXCNode(client, ctid, opts.node);
    const result = await createLXCTermProxy(client, node, ctid);
    return { ok: true, data: { ...result, node } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export { resolveLXCNode };

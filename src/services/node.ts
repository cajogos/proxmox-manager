import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listNodes,
  getNodeDetail,
  getNodeVersion,
  shutdownNode,
  rebootNode,
  listServices,
  restartService,
  listTasks,
  getTaskLog,
  NodeInfo,
  NodeDetail,
  NodeVersion,
  ServiceInfo,
  TaskInfo,
  TaskLog,
} from '../api/endpoints/node';
import { CommandResult } from './types';

export interface NodeActionOpts {
  profile?: string;
}

export interface ListTasksOpts extends NodeActionOpts {
  limit?: number;
}

export async function listNodesService(
  config: Config,
  opts: NodeActionOpts,
): Promise<CommandResult<NodeInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listNodes(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getNodeDetailService(
  config: Config,
  node: string,
  opts: NodeActionOpts,
): Promise<CommandResult<NodeDetail>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getNodeDetail(client, node);
    return { ok: true, data: { ...data, node } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getNodeVersionService(
  config: Config,
  node: string,
  opts: NodeActionOpts,
): Promise<CommandResult<NodeVersion>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getNodeVersion(client, node);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function nodeShutdownService(
  config: Config,
  node: string,
  opts: NodeActionOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await shutdownNode(client, node);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function nodeRebootService(
  config: Config,
  node: string,
  opts: NodeActionOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await rebootNode(client, node);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listServicesService(
  config: Config,
  node: string,
  opts: NodeActionOpts,
): Promise<CommandResult<ServiceInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listServices(client, node);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function restartServiceService(
  config: Config,
  node: string,
  service: string,
  opts: NodeActionOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await restartService(client, node, service);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listTasksService(
  config: Config,
  node: string,
  opts: ListTasksOpts,
): Promise<CommandResult<TaskInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listTasks(client, node, opts.limit);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getTaskLogService(
  config: Config,
  node: string,
  upid: string,
  opts: NodeActionOpts,
): Promise<CommandResult<TaskLog[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getTaskLog(client, node, upid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

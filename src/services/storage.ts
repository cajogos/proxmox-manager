import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listAllStorage,
  getStorageStatus,
  listStorageContent,
  deleteStorageContent,
  uploadStorageContent,
  listAllBackups,
  resolveStorageNode,
  StorageInfo,
  StorageContent,
} from '../api/endpoints/storage';
import { CommandResult } from './types';

export interface StorageOpts {
  profile?: string;
  node?: string;
}

export interface ListStorageContentOpts extends StorageOpts {
  contentType?: string;
}

export async function listStorageService(
  config: Config,
  opts: StorageOpts,
): Promise<CommandResult<StorageInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listAllStorage(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getStorageStatusService(
  config: Config,
  storage: string,
  opts: StorageOpts,
): Promise<CommandResult<StorageInfo>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = opts.node ?? await resolveStorageNode(client, storage);
    const data = await getStorageStatus(client, node, storage);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listStorageContentService(
  config: Config,
  storage: string,
  opts: ListStorageContentOpts,
): Promise<CommandResult<StorageContent[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = opts.node ?? await resolveStorageNode(client, storage);
    const data = await listStorageContent(client, node, storage, opts.contentType);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteStorageContentService(
  config: Config,
  storage: string,
  volid: string,
  opts: StorageOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = opts.node ?? await resolveStorageNode(client, storage);
    await deleteStorageContent(client, node, storage, volid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function uploadStorageContentService(
  config: Config,
  storage: string,
  filePath: string,
  contentType: string,
  opts: StorageOpts,
  onProgress?: (pct: number) => void,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const node = opts.node ?? await resolveStorageNode(client, storage);
    await uploadStorageContent(client, node, storage, filePath, contentType, onProgress);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listBackupsService(
  config: Config,
  opts: StorageOpts,
): Promise<CommandResult<StorageContent[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listAllBackups(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

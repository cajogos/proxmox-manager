import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listBackupJobs,
  getBackupJob,
  createBackupJob,
  deleteBackupJob,
  BackupJob,
  CreateBackupJobParams,
} from '../api/endpoints/vzdump';
import { CommandResult } from './types';

export interface BackupJobOpts {
  profile?: string;
}

export async function listBackupJobsService(
  config: Config,
  opts: BackupJobOpts,
): Promise<CommandResult<BackupJob[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listBackupJobs(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getBackupJobService(
  config: Config,
  id: string,
  opts: BackupJobOpts,
): Promise<CommandResult<BackupJob>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getBackupJob(client, id);
    return { ok: true, data: { ...data, id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createBackupJobService(
  config: Config,
  params: CreateBackupJobParams,
  opts: BackupJobOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await createBackupJob(client, params);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteBackupJobService(
  config: Config,
  id: string,
  opts: BackupJobOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await deleteBackupJob(client, id);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';
import {
  listUsers,
  getUser,
  listGroups,
  listRoles,
  listUserTokens,
  createUserToken,
  deleteUserToken,
  UserInfo,
  GroupInfo,
  RoleInfo,
  APIToken,
  CreatedTokenSecret,
} from '../api/endpoints/access';
import { CommandResult } from './types';

export interface AccessOpts {
  profile?: string;
}

export async function listUsersService(
  config: Config,
  opts: AccessOpts,
): Promise<CommandResult<UserInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listUsers(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getUserService(
  config: Config,
  userid: string,
  opts: AccessOpts,
): Promise<CommandResult<UserInfo>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await getUser(client, userid);
    return { ok: true, data: { ...data, userid } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listGroupsService(
  config: Config,
  opts: AccessOpts,
): Promise<CommandResult<GroupInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listGroups(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listRolesService(
  config: Config,
  opts: AccessOpts,
): Promise<CommandResult<RoleInfo[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listRoles(client);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function listUserTokensService(
  config: Config,
  userid: string,
  opts: AccessOpts,
): Promise<CommandResult<APIToken[]>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await listUserTokens(client, userid);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function createUserTokenService(
  config: Config,
  userid: string,
  tokenid: string,
  params: { comment?: string; expire?: number; privsep?: number },
  opts: AccessOpts,
): Promise<CommandResult<CreatedTokenSecret>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    const data = await createUserToken(client, userid, tokenid, params);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteUserTokenService(
  config: Config,
  userid: string,
  tokenid: string,
  opts: AccessOpts,
): Promise<CommandResult<void>> {
  try {
    const { profile } = resolveProfile(config, opts.profile);
    const client = new ProxmoxClient(profile);
    await deleteUserToken(client, userid, tokenid);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

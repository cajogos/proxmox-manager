import { ProxmoxClient } from '../client';

export interface UserInfo {
  userid: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  enable?: number;
  expire?: number;
  groups?: string;
  comment?: string;
  tokens?: Record<string, unknown>;
}

export interface GroupInfo {
  groupid: string;
  members?: string[];
  comment?: string;
}

export interface RoleInfo {
  roleid: string;
  privs?: string;
  special?: number;
}

export async function listUsers(client: ProxmoxClient): Promise<UserInfo[]> {
  return client.get<UserInfo[]>('/access/users');
}

export async function getUser(client: ProxmoxClient, userid: string): Promise<UserInfo> {
  return client.get<UserInfo>(`/access/users/${encodeURIComponent(userid)}`);
}

export async function listGroups(client: ProxmoxClient): Promise<GroupInfo[]> {
  return client.get<GroupInfo[]>('/access/groups');
}

export async function listRoles(client: ProxmoxClient): Promise<RoleInfo[]> {
  return client.get<RoleInfo[]>('/access/roles');
}

export interface APIToken {
  tokenid: string;
  comment?: string;
  expire?: number;
  privsep?: number;
}

export interface CreatedTokenSecret {
  'full-tokenid': string;
  info: APIToken;
  value: string;
}

export async function listUserTokens(client: ProxmoxClient, userid: string): Promise<APIToken[]> {
  return client.get<APIToken[]>(`/access/users/${encodeURIComponent(userid)}/token`);
}

export async function createUserToken(
  client: ProxmoxClient,
  userid: string,
  tokenid: string,
  params: { comment?: string; expire?: number; privsep?: number },
): Promise<CreatedTokenSecret> {
  return client.post<CreatedTokenSecret>(
    `/access/users/${encodeURIComponent(userid)}/token/${encodeURIComponent(tokenid)}`,
    params,
  );
}

export async function deleteUserToken(
  client: ProxmoxClient,
  userid: string,
  tokenid: string,
): Promise<void> {
  await client.delete(`/access/users/${encodeURIComponent(userid)}/token/${encodeURIComponent(tokenid)}`);
}

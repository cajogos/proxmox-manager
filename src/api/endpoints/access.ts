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

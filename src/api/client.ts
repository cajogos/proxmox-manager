import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import { Profile } from '../config/types';

export class ProxmoxClient {
  private http: AxiosInstance;

  constructor(profile: Profile) {
    this.http = axios.create({
      baseURL: `https://${profile.host}:${profile.port}/api2/json`,
      headers: {
        Authorization: `PVEAPIToken=${profile.API_TOKEN_ID}=${profile.API_TOKEN_SECRET}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: profile.rejectUnauthorized,
      }),
      timeout: 15000,
    });
  }

  async get<T>(path: string): Promise<T> {
    try {
      const response = await this.http.get<{ data: T }>(path);
      return response.data.data;
    } catch (e) {
      throw wrapAxiosError(e);
    }
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.http.post<{ data: T }>(path, body);
      return response.data.data;
    } catch (e) {
      throw wrapAxiosError(e);
    }
  }

  async put<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.http.put<{ data: T }>(path, body);
      return response.data.data;
    } catch (e) {
      throw wrapAxiosError(e);
    }
  }

  async delete<T>(path: string): Promise<T> {
    try {
      const response = await this.http.delete<{ data: T }>(path);
      return response.data.data;
    } catch (e) {
      throw wrapAxiosError(e);
    }
  }
}

function wrapAxiosError(e: unknown): Error {
  if (e instanceof AxiosError) {
    const status = e.response?.status;
    const data = e.response?.data as { errors?: Record<string, string> } | undefined;

    if (status === 401) {
      return new Error('Authentication failed. Check your API_TOKEN_ID and API_TOKEN_SECRET in config.json.');
    }
    if (status === 403) {
      return new Error('Permission denied. Ensure your API token has the required privileges in Proxmox.');
    }
    if (data?.errors) {
      const msgs = Object.entries(data.errors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return new Error(`Proxmox API error: ${msgs}`);
    }
    if (e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET') {
      return new Error(`Could not connect to Proxmox. Is the host reachable? (${e.config?.baseURL})`);
    }
    return new Error(`API request failed (HTTP ${status ?? 'unknown'}): ${e.message}`);
  }
  return e instanceof Error ? e : new Error(String(e));
}

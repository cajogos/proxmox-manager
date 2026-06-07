import { z } from 'zod';

export const SafeguardsSchema = z.object({
  protectedVMs: z.array(z.number()).default([]),
  protectedNodes: z.array(z.string()).default([]),
  protectedContainers: z.array(z.number()).default([]),
});

export const ProfileSchema = z.object({
  host: z.string().default('192.168.1.180'),
  port: z.number().default(8006),
  API_TOKEN_ID: z.string(),
  API_TOKEN_SECRET: z.string(),
  rejectUnauthorized: z.boolean().default(false),
  safeguards: SafeguardsSchema.default({
    protectedVMs: [],
    protectedNodes: [],
    protectedContainers: [],
  }),
});

export const AuditLogConfigSchema = z.object({
  path: z.string().default('~/.proxmox-manager/audit.log'),
});

export const ConfigSchema = z.object({
  defaultProfile: z.string().optional(),
  serverPort: z.number().int().min(1).max(65535).default(3000),
  auditLog: AuditLogConfigSchema.default({ path: '~/.proxmox-manager/audit.log' }),
  profiles: z.record(z.string(), ProfileSchema),
});

export type Safeguards = z.infer<typeof SafeguardsSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type AuditLogConfig = z.infer<typeof AuditLogConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

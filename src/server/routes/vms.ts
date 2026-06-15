import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import {
  getVMs, getVMStatusService, vmActionService, getVMIPsService, createVMService,
  getVMConfigService, listSnapshotsService, createSnapshotService, deleteSnapshotService,
  rollbackSnapshotService, cloneVMService, migrateVMService, resizeVMDiskService,
} from '../../services/vm';

const VALID_ACTIONS = new Set(['start', 'stop', 'shutdown', 'reboot', 'suspend', 'resume']);

export function vmsRouter(config: Config): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const { name, node, vmid, memory, cores, sockets, cpu, ostype, disk, iso, net, start } = req.body as {
      name?: string;
      node?: string;
      vmid?: number;
      memory?: number;
      cores?: number;
      sockets?: number;
      cpu?: string;
      ostype?: string;
      disk?: string;
      iso?: string;
      net?: string;
      start?: boolean;
    };
    if (!node) { res.status(400).json({ ok: false, error: 'node is required' }); return; }
    const result = await createVMService(
      config,
      { name, vmid, memory, cores, sockets, cpu, ostype, disk, iso, net, start },
      { profile: req.profileName, node },
    );
    audit({
      timestamp: new Date().toISOString(),
      profile: req.profileName,
      command: 'vm create',
      resource: { type: 'vm', id: result.ok ? String(result.data.vmid) : undefined },
      dryRun: false,
      result: result.ok ? 'success' : 'failed',
      error: result.ok ? null : result.error,
      source: 'web',
    });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: result.data });
  });

  router.get('/', async (req: Request, res: Response) => {
    const result = await getVMs(config, req.profileName);
    audit({
      timestamp: new Date().toISOString(),
      profile: req.profileName,
      command: 'vm list',
      resource: { type: 'vm' },
      dryRun: false,
      result: result.ok ? 'success' : 'failed',
      error: result.ok ? null : result.error,
      source: 'web',
    });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:vmid/config', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const result = await getVMConfigService(config, vmid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:vmid/snapshots', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const result = await listSnapshotsService(config, vmid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/:vmid/snapshots', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name) { res.status(400).json({ ok: false, error: 'name is required' }); return; }
    const result = await createSnapshotService(config, vmid, name, { profile: req.profileName, description });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm snapshot create', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.delete('/:vmid/snapshots/:name', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const name = req.params['name'] as string;
    const result = await deleteSnapshotService(config, vmid, name, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm snapshot delete', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.post('/:vmid/snapshots/:name/rollback', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const name = req.params['name'] as string;
    const result = await rollbackSnapshotService(config, vmid, name, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm snapshot rollback', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.post('/:vmid/clone', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const { newid, name, target, full, storage } = req.body as { newid?: number; name?: string; target?: string; full?: boolean; storage?: string };
    if (!newid) { res.status(400).json({ ok: false, error: 'newid is required' }); return; }
    const result = await cloneVMService(config, vmid, { newid, name, target, full, storage }, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm clone', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/:vmid/migrate', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const { target, online } = req.body as { target?: string; online?: boolean };
    if (!target) { res.status(400).json({ ok: false, error: 'target is required' }); return; }
    const result = await migrateVMService(config, vmid, { target, online }, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm migrate', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.put('/:vmid/resize', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const { disk, size } = req.body as { disk?: string; size?: string };
    if (!disk || !size) { res.status(400).json({ ok: false, error: 'disk and size are required' }); return; }
    const result = await resizeVMDiskService(config, vmid, disk, size, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'vm resize', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.get('/:vmid/ips', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const result = await getVMIPsService(config, vmid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:vmid', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const result = await getVMStatusService(config, vmid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/:vmid/:action', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const action = req.params['action'] as string;
    if (!VALID_ACTIONS.has(action)) {
      res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
      return;
    }

    const result = await vmActionService(
      config,
      vmid,
      action as 'start' | 'stop' | 'shutdown' | 'reboot' | 'suspend' | 'resume',
      { profile: req.profileName },
    );
    audit({
      timestamp: new Date().toISOString(),
      profile: req.profileName,
      command: `vm ${action}`,
      resource: { type: 'vm', id: String(vmid) },
      dryRun: false,
      result: result.ok ? 'success' : 'failed',
      error: result.ok ? null : result.error,
      source: 'web',
    });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  return router;
}

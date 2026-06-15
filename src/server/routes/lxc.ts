import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import {
  getLXCList, getLXCStatusService, lxcActionService, getLXCIPsService, createLXCService,
  getLXCConfigService, listLXCSnapshotsService, createLXCSnapshotService, deleteLXCSnapshotService,
  rollbackLXCSnapshotService, cloneLXCService, resizeLXCDiskService,
} from '../../services/lxc';

const VALID_ACTIONS = new Set(['start', 'stop', 'shutdown', 'reboot', 'suspend', 'resume']);

export function lxcRouter(config: Config): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const { hostname, node, vmid, ostemplate, rootfs, memory, cores, password, net, unprivileged, start } = req.body as {
      hostname?: string; node?: string; vmid?: number; ostemplate?: string; rootfs?: string;
      memory?: number; cores?: number; password?: string; net?: string; unprivileged?: boolean; start?: boolean;
    };
    if (!node) { res.status(400).json({ ok: false, error: 'node is required' }); return; }
    if (!hostname) { res.status(400).json({ ok: false, error: 'hostname is required' }); return; }
    if (!ostemplate) { res.status(400).json({ ok: false, error: 'ostemplate is required' }); return; }
    if (!rootfs) { res.status(400).json({ ok: false, error: 'rootfs is required' }); return; }
    const result = await createLXCService(
      config,
      { hostname, vmid, ostemplate, rootfs, memory, cores, password, net, unprivileged, start },
      { profile: req.profileName, node },
    );
    audit({
      timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc create',
      resource: { type: 'lxc', id: result.ok ? String(result.data.vmid) : undefined },
      dryRun: false, result: result.ok ? 'success' : 'failed',
      error: result.ok ? null : result.error, source: 'web',
    });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: result.data });
  });

  router.get('/', async (req: Request, res: Response) => {
    const result = await getLXCList(config, req.profileName);
    audit({
      timestamp: new Date().toISOString(),
      profile: req.profileName,
      command: 'lxc list',
      resource: { type: 'lxc' },
      dryRun: false,
      result: result.ok ? 'success' : 'failed',
      error: result.ok ? null : result.error,
      source: 'web',
    });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:ctid/config', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const result = await getLXCConfigService(config, ctid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:ctid/snapshots', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const result = await listLXCSnapshotsService(config, ctid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/:ctid/snapshots', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name) { res.status(400).json({ ok: false, error: 'name is required' }); return; }
    const result = await createLXCSnapshotService(config, ctid, name, { profile: req.profileName, description });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc snapshot create', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.delete('/:ctid/snapshots/:name', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const name = req.params['name'] as string;
    const result = await deleteLXCSnapshotService(config, ctid, name, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc snapshot delete', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.post('/:ctid/snapshots/:name/rollback', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const name = req.params['name'] as string;
    const result = await rollbackLXCSnapshotService(config, ctid, name, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc snapshot rollback', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.post('/:ctid/clone', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const { newid, hostname, target, full, storage } = req.body as { newid?: number; hostname?: string; target?: string; full?: boolean; storage?: string };
    if (!newid) { res.status(400).json({ ok: false, error: 'newid is required' }); return; }
    const result = await cloneLXCService(config, ctid, { newid, hostname, target, full, storage }, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc clone', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.put('/:ctid/resize', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const { disk, size } = req.body as { disk?: string; size?: string };
    if (!disk || !size) { res.status(400).json({ ok: false, error: 'disk and size are required' }); return; }
    const result = await resizeLXCDiskService(config, ctid, disk, size, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'lxc resize', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.get('/:ctid/ips', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const result = await getLXCIPsService(config, ctid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:ctid', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const result = await getLXCStatusService(config, ctid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/:ctid/:action', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const action = req.params['action'] as string;
    if (!VALID_ACTIONS.has(action)) {
      res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
      return;
    }

    const result = await lxcActionService(
      config,
      ctid,
      action as 'start' | 'stop' | 'shutdown' | 'reboot' | 'suspend' | 'resume',
      { profile: req.profileName },
    );
    audit({
      timestamp: new Date().toISOString(),
      profile: req.profileName,
      command: `lxc ${action}`,
      resource: { type: 'lxc', id: String(ctid) },
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

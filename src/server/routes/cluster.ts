import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { listClusterStatusService, listClusterResourcesService, listHAStatusService, getNextVMIDService } from '../../services/cluster';

export function clusterRouter(config: Config): Router {
  const router = Router();

  router.get('/status', async (req: Request, res: Response) => {
    const result = await listClusterStatusService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/resources', async (req: Request, res: Response) => {
    const resourceType = typeof req.query['type'] === 'string' ? req.query['type'] : undefined;
    const result = await listClusterResourcesService(config, { profile: req.profileName, resourceType });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/ha', async (req: Request, res: Response) => {
    const result = await listHAStatusService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/nextid', async (req: Request, res: Response) => {
    const result = await getNextVMIDService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

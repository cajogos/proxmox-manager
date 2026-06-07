import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { listNetworkIfacesService, getNetworkIfaceService } from '../../services/network';

export function networkRouter(config: Config): Router {
  const router = Router();

  router.get('/:node', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const result = await listNetworkIfacesService(config, node, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:node/:iface', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const iface = req.params['iface'] as string;
    const result = await getNetworkIfaceService(config, node, iface, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

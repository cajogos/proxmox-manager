import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { listSDNZonesService, listSDNVNetsService, listSDNSubnetsService } from '../../services/sdn';

export function sdnRouter(config: Config): Router {
  const router = Router();

  router.get('/zones', async (req: Request, res: Response) => {
    const result = await listSDNZonesService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/vnets', async (req: Request, res: Response) => {
    const result = await listSDNVNetsService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/vnets/:vnet/subnets', async (req: Request, res: Response) => {
    const vnet = req.params['vnet'] as string;
    const result = await listSDNSubnetsService(config, vnet, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

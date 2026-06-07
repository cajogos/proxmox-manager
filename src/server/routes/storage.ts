import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { listStorageService, listStorageContentService } from '../../services/storage';

export function storageRouter(config: Config): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const result = await listStorageService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:storage/content', async (req: Request, res: Response) => {
    const storage = req.params['storage'] as string;
    const node = req.query['node'] as string | undefined;
    if (!node) { res.status(400).json({ ok: false, error: 'node query param required' }); return; }
    const result = await listStorageContentService(config, storage, { profile: req.profileName, node });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

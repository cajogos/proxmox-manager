import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import {
  listBackupJobsService,
  getBackupJobService,
  createBackupJobService,
  deleteBackupJobService,
} from '../../services/vzdump';

export function backupRouter(config: Config): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const result = await listBackupJobsService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await getBackupJobService(config, id, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/', async (req: Request, res: Response) => {
    const result = await createBackupJobService(config, req.body, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: result.data });
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await deleteBackupJobService(config, id, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  return router;
}

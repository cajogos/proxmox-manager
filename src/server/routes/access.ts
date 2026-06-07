import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import {
  listUsersService,
  listGroupsService,
  listRolesService,
} from '../../services/access';

export function accessRouter(config: Config): Router {
  const router = Router();

  router.get('/users', async (req: Request, res: Response) => {
    const result = await listUsersService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/groups', async (req: Request, res: Response) => {
    const result = await listGroupsService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/roles', async (req: Request, res: Response) => {
    const result = await listRolesService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

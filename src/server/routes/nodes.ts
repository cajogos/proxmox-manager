import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import {
  listNodesService,
  getNodeDetailService,
  listServicesService,
  listTasksService,
  getTaskLogService,
} from '../../services/node';

export function nodesRouter(config: Config): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const result = await listNodesService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:node', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const result = await getNodeDetailService(config, node, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:node/services', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const result = await listServicesService(config, node, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:node/tasks', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const result = await listTasksService(config, node, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.get('/:node/tasks/:upid/log', async (req: Request, res: Response) => {
    const node = req.params['node'] as string;
    const upid = req.params['upid'] as string;
    const result = await getTaskLogService(config, node, upid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

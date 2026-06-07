import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import { getLXCList, getLXCStatusService, lxcActionService, getLXCIPsService } from '../../services/lxc';

const VALID_ACTIONS = new Set(['start', 'stop', 'shutdown', 'reboot', 'suspend', 'resume']);

export function lxcRouter(config: Config): Router {
  const router = Router();

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

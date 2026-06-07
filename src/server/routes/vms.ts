import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import { getVMs, getVMStatusService, vmActionService } from '../../services/vm';

const VALID_ACTIONS = new Set(['start', 'stop', 'shutdown', 'reboot', 'suspend', 'resume']);

export function vmsRouter(config: Config): Router {
  const router = Router();

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

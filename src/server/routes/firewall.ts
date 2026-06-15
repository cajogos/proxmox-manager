import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import {
  listClusterFirewallRulesService, createClusterFirewallRuleService, deleteClusterFirewallRuleService,
  listVMFirewallRulesService, createVMFirewallRuleService, deleteVMFirewallRuleService,
  listLXCFirewallRulesService, createLXCFirewallRuleService, deleteLXCFirewallRuleService,
  CreateFirewallRuleParams,
} from '../../services/firewall';

export function firewallRouter(config: Config): Router {
  const router = Router();

  router.get('/cluster', async (req: Request, res: Response) => {
    const result = await listClusterFirewallRulesService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/cluster', async (req: Request, res: Response) => {
    const params = req.body as CreateFirewallRuleParams;
    const result = await createClusterFirewallRuleService(config, params, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall cluster create', resource: { type: 'cluster' }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.delete('/cluster/:pos', async (req: Request, res: Response) => {
    const pos = parseInt(req.params['pos'] as string, 10);
    if (isNaN(pos)) { res.status(400).json({ ok: false, error: 'pos must be a number' }); return; }
    const result = await deleteClusterFirewallRuleService(config, pos, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall cluster delete', resource: { type: 'cluster' }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.get('/vms/:vmid', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    if (isNaN(vmid)) { res.status(400).json({ ok: false, error: 'vmid must be a number' }); return; }
    const result = await listVMFirewallRulesService(config, vmid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/vms/:vmid', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    if (isNaN(vmid)) { res.status(400).json({ ok: false, error: 'vmid must be a number' }); return; }
    const params = req.body as CreateFirewallRuleParams;
    const result = await createVMFirewallRuleService(config, vmid, params, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall vm create', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.delete('/vms/:vmid/:pos', async (req: Request, res: Response) => {
    const vmid = parseInt(req.params['vmid'] as string, 10);
    const pos = parseInt(req.params['pos'] as string, 10);
    if (isNaN(vmid) || isNaN(pos)) { res.status(400).json({ ok: false, error: 'vmid and pos must be numbers' }); return; }
    const result = await deleteVMFirewallRuleService(config, vmid, pos, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall vm delete', resource: { type: 'vm', id: String(vmid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.get('/lxc/:ctid', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    if (isNaN(ctid)) { res.status(400).json({ ok: false, error: 'ctid must be a number' }); return; }
    const result = await listLXCFirewallRulesService(config, ctid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/lxc/:ctid', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    if (isNaN(ctid)) { res.status(400).json({ ok: false, error: 'ctid must be a number' }); return; }
    const params = req.body as CreateFirewallRuleParams;
    const result = await createLXCFirewallRuleService(config, ctid, params, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall lxc create', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  router.delete('/lxc/:ctid/:pos', async (req: Request, res: Response) => {
    const ctid = parseInt(req.params['ctid'] as string, 10);
    const pos = parseInt(req.params['pos'] as string, 10);
    if (isNaN(ctid) || isNaN(pos)) { res.status(400).json({ ok: false, error: 'ctid and pos must be numbers' }); return; }
    const result = await deleteLXCFirewallRuleService(config, ctid, pos, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'firewall lxc delete', resource: { type: 'lxc', id: String(ctid) }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true });
  });

  return router;
}

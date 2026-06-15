import { Router, Request, Response } from 'express';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import {
  listUsersService,
  listGroupsService,
  listRolesService,
  listUserTokensService,
  createUserService,
  deleteUserService,
  updateUserService,
  createGroupService,
  deleteGroupService,
  createUserTokenService,
  deleteUserTokenService,
} from '../../services/access';
import { CreateUserParams, CreateGroupParams } from '../../api/endpoints/access';

export function accessRouter(config: Config): Router {
  const router = Router();

  // Users
  router.get('/users', async (req: Request, res: Response) => {
    const result = await listUsersService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/users', async (req: Request, res: Response) => {
    const body = req.body as CreateUserParams;
    if (!body.userid) { res.status(400).json({ ok: false, error: 'userid is required' }); return; }
    const result = await createUserService(config, body, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access user create', resource: { type: 'user', id: body.userid }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: null });
  });

  router.put('/users/:userid', async (req: Request, res: Response) => {
    const userid = req.params['userid'] as string;
    const body = { ...(req.body as Partial<Omit<CreateUserParams, 'userid'>>) };
    delete (body as Record<string, unknown>)['userid'];
    const result = await updateUserService(config, userid, body, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access user update', resource: { type: 'user', id: userid }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: null });
  });

  router.delete('/users/:userid', async (req: Request, res: Response) => {
    const userid = req.params['userid'] as string;
    const result = await deleteUserService(config, userid, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access user delete', resource: { type: 'user', id: userid }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: null });
  });

  // User tokens
  router.get('/users/:userid/tokens', async (req: Request, res: Response) => {
    const userid = req.params['userid'] as string;
    const result = await listUserTokensService(config, userid, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/users/:userid/tokens/:tokenid', async (req: Request, res: Response) => {
    const userid = req.params['userid'] as string;
    const tokenid = req.params['tokenid'] as string;
    const { comment, expire, privsep } = req.body as { comment?: string; expire?: number; privsep?: number };
    const result = await createUserTokenService(config, userid, tokenid, { comment, expire, privsep }, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access token create', resource: { type: 'token', id: `${userid}!${tokenid}` }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: result.data });
  });

  router.delete('/users/:userid/tokens/:tokenid', async (req: Request, res: Response) => {
    const userid = req.params['userid'] as string;
    const tokenid = req.params['tokenid'] as string;
    const result = await deleteUserTokenService(config, userid, tokenid, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access token delete', resource: { type: 'token', id: `${userid}!${tokenid}` }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: null });
  });

  // Groups
  router.get('/groups', async (req: Request, res: Response) => {
    const result = await listGroupsService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  router.post('/groups', async (req: Request, res: Response) => {
    const body = req.body as CreateGroupParams;
    if (!body.groupid) { res.status(400).json({ ok: false, error: 'groupid is required' }); return; }
    const result = await createGroupService(config, body, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access group create', resource: { type: 'group', id: body.groupid }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.status(201).json({ ok: true, data: null });
  });

  router.delete('/groups/:groupid', async (req: Request, res: Response) => {
    const groupid = req.params['groupid'] as string;
    const result = await deleteGroupService(config, groupid, { profile: req.profileName });
    audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'access group delete', resource: { type: 'group', id: groupid }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: null });
  });

  // Roles
  router.get('/roles', async (req: Request, res: Response) => {
    const result = await listRolesService(config, { profile: req.profileName });
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: result.data });
  });

  return router;
}

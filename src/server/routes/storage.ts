import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Config } from '../../config/types';
import { audit } from '../../audit/logger';
import { listStorageService, listStorageContentService, uploadStorageContentService } from '../../services/storage';

const ALLOWED_CONTENT_TYPES = ['iso', 'vztmpl'];
const upload = multer({ dest: '/tmp/proxmox-uploads/' });

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

  router.post('/:storage/upload', upload.single('file'), async (req: Request, res: Response) => {
    const storage = req.params['storage'] as string;
    const node = req.query['node'] as string | undefined;
    const contentType = (req.body as { contentType?: string }).contentType ?? 'iso';
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      res.status(400).json({ ok: false, error: `contentType must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}` }); return;
    }
    if (!req.file) { res.status(400).json({ ok: false, error: 'file is required' }); return; }
    const tmpPath = req.file.path;
    const safeName = path.basename(req.file.originalname);
    const renamedPath = `${tmpPath}_${safeName}`;
    fs.renameSync(tmpPath, renamedPath);
    try {
      const result = await uploadStorageContentService(config, storage, renamedPath, contentType, { profile: req.profileName, node });
      audit({ timestamp: new Date().toISOString(), profile: req.profileName, command: 'storage upload', resource: { type: 'storage', id: storage }, dryRun: false, result: result.ok ? 'success' : 'failed', error: result.ok ? null : result.error, source: 'web' });
      if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
      res.json({ ok: true, data: null });
    } finally {
      fs.unlink(renamedPath, () => {});
    }
  });

  return router;
}

import fs from 'fs';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Config } from '../../config/types';
import { listStorageService, listStorageContentService, uploadStorageContentService } from '../../services/storage';

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
    if (!req.file) { res.status(400).json({ ok: false, error: 'file is required' }); return; }
    const tmpPath = req.file.path;
    const originalName = req.file.originalname;
    const renamedPath = `${tmpPath}_${originalName}`;
    fs.renameSync(tmpPath, renamedPath);
    const result = await uploadStorageContentService(config, storage, renamedPath, contentType, { profile: req.profileName, node });
    fs.unlink(renamedPath, () => {});
    if (!result.ok) { res.status(500).json({ ok: false, error: result.error }); return; }
    res.json({ ok: true, data: null });
  });

  return router;
}

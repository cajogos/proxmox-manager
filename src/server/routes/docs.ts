import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const DOCS_DIR = path.resolve(__dirname, '../../../docs/commands');

const DOC_FILES: { name: string; file: string }[] = [
  { name: 'Global Flags', file: 'global.md' },
  { name: 'vm', file: 'vm.md' },
  { name: 'lxc', file: 'lxc.md' },
  { name: 'node', file: 'node.md' },
  { name: 'storage', file: 'storage.md' },
  { name: 'cluster', file: 'cluster.md' },
  { name: 'network', file: 'network.md' },
  { name: 'access', file: 'access.md' },
  { name: 'backup', file: 'backup.md' },
  { name: 'firewall', file: 'firewall.md' },
  { name: 'sdn', file: 'sdn.md' },
  { name: 'config', file: 'config.md' },
  { name: 'doctor', file: 'doctor.md' },
];

export function docsRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ ok: true, data: DOC_FILES });
  });

  router.get('/:file', (req, res) => {
    const file = req.params.file;
    if (!file.endsWith('.md') || file.includes('/') || file.includes('..')) {
      res.status(400).json({ ok: false, error: 'Invalid file name' });
      return;
    }

    const filePath = path.join(DOCS_DIR, file);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ ok: false, error: 'File not found' });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ ok: true, data: content });
  });

  return router;
}

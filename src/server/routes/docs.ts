import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const COMMANDS_DIR = path.resolve(__dirname, '../../../docs/commands');
const SETUP_DIR = path.resolve(__dirname, '../../../docs/setup');

const COMMAND_FILES: { name: string; file: string }[] = [
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

const SETUP_FILES: { name: string; file: string }[] = [
  { name: 'Quick Start', file: 'quickstart.md' },
  { name: 'Proxmox API Tokens', file: 'proxmox-api-tokens.md' },
  { name: 'Configuration', file: 'configuration.md' },
  { name: 'Web UI', file: 'web-ui.md' },
  { name: 'Troubleshooting', file: 'troubleshooting.md' },
];

function isValidDocFile(file: string): boolean {
  return file.endsWith('.md') && !file.includes('/') && !file.includes('..');
}

function readDocFile(dir: string, file: string): string | null {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

export function docsRouter(): Router {
  const router = Router();

  // Sections listing
  router.get('/', (_req, res) => {
    res.json({
      ok: true,
      data: {
        sections: [
          { name: 'Setup & Configuration', section: 'setup', files: SETUP_FILES },
          { name: 'Command Reference', section: 'commands', files: COMMAND_FILES },
        ],
      },
    });
  });

  // LLM context: all setup docs concatenated
  router.get('/llms-context', (_req, res) => {
    const parts = SETUP_FILES.map(f => {
      const content = readDocFile(SETUP_DIR, f.file);
      return content ? `## ${f.name}\n\n${content}` : null;
    }).filter(Boolean);
    const markdown = `# proxmox-manager — Setup Guides\n\n${parts.join('\n\n---\n\n')}`;
    res.json({ ok: true, data: markdown });
  });

  // Section + file
  router.get('/setup/:file', (req, res) => {
    const file = req.params['file'] as string;
    if (!isValidDocFile(file)) { res.status(400).json({ ok: false, error: 'Invalid file name' }); return; }
    const content = readDocFile(SETUP_DIR, file);
    if (!content) { res.status(404).json({ ok: false, error: 'File not found' }); return; }
    res.json({ ok: true, data: content });
  });

  router.get('/commands/:file', (req, res) => {
    const file = req.params['file'] as string;
    if (!isValidDocFile(file)) { res.status(400).json({ ok: false, error: 'Invalid file name' }); return; }
    const content = readDocFile(COMMANDS_DIR, file);
    if (!content) { res.status(404).json({ ok: false, error: 'File not found' }); return; }
    res.json({ ok: true, data: content });
  });

  // Backward-compat: commands only
  router.get('/:file', (req, res) => {
    const file = req.params['file'] as string;
    if (!isValidDocFile(file)) { res.status(400).json({ ok: false, error: 'Invalid file name' }); return; }
    const content = readDocFile(COMMANDS_DIR, file);
    if (!content) { res.status(404).json({ ok: false, error: 'File not found' }); return; }
    res.json({ ok: true, data: content });
  });

  return router;
}

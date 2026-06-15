import { useState } from 'react';
import { createBackupJob, type CreateBackupJobParams } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateBackupJobDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<{
    storage: string;
    schedule: string;
    node: string;
    vmid: string;
    mode: 'snapshot' | 'suspend' | 'stop';
    compress: 'lzo' | 'gzip' | 'zstd' | 'none';
    all: boolean;
    enabled: boolean;
    comment: string;
  }>({
    storage: '', schedule: '', node: '', vmid: '', mode: 'snapshot', compress: 'zstd',
    all: true, enabled: true, comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.storage) { setError('Storage is required'); return; }
    setLoading(true); setError(null);
    const params: CreateBackupJobParams = {
      storage: form.storage,
      schedule: form.schedule || undefined,
      node: form.node || undefined,
      vmid: form.vmid || undefined,
      mode: form.mode,
      compress: form.compress,
      all: form.all ? 1 : 0,
      enabled: form.enabled ? 1 : 0,
      comment: form.comment || undefined,
    };
    const result = await createBackupJob(params);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setForm({ storage: '', schedule: '', node: '', vmid: '', mode: 'snapshot', compress: 'zstd', all: true, enabled: true, comment: '' });
    onSuccess();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create Backup Job</h2>

        <div>
          <label className={labelCls}>Storage <span className="text-destructive">*</span></label>
          <input className={inputCls} value={form.storage} onChange={e => set('storage', e.target.value)} placeholder="local" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Schedule</label>
            <input className={inputCls} value={form.schedule} onChange={e => set('schedule', e.target.value)} placeholder="0 2 * * *" />
          </div>
          <div>
            <label className={labelCls}>Node</label>
            <input className={inputCls} value={form.node} onChange={e => set('node', e.target.value)} placeholder="all nodes" />
          </div>
        </div>

        <div>
          <label className={labelCls}>VM IDs (comma-separated)</label>
          <input className={inputCls} value={form.vmid} onChange={e => set('vmid', e.target.value)} placeholder="100,101,102" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Mode</label>
            <select className={inputCls} value={form.mode} onChange={e => set('mode', e.target.value as typeof form.mode)}>
              <option value="snapshot">Snapshot</option>
              <option value="suspend">Suspend</option>
              <option value="stop">Stop</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Compression</label>
            <select className={inputCls} value={form.compress} onChange={e => set('compress', e.target.value as typeof form.compress)}>
              <option value="zstd">zstd</option>
              <option value="gzip">gzip</option>
              <option value="lzo">lzo</option>
              <option value="none">none</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Comment</label>
          <input className={inputCls} value={form.comment} onChange={e => set('comment', e.target.value)} />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="bj-all" checked={form.all} onChange={e => set('all', e.target.checked)} />
            <label htmlFor="bj-all" className="text-sm">Backup all VMs</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="bj-enabled" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} />
            <label htmlFor="bj-enabled" className="text-sm">Enabled</label>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create Job'}</Button>
        </div>
      </div>
    </div>
  );
}

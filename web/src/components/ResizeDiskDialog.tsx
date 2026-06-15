import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  config: Record<string, unknown>;
  onClose: () => void;
  onResize: (disk: string, size: string) => Promise<{ ok: boolean; error?: string }>;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

const DISK_KEYS = ['scsi0','scsi1','scsi2','scsi3','virtio0','virtio1','ide0','ide1','ide2','rootfs','sata0','sata1'];

export default function ResizeDiskDialog({ open, config, onClose, onResize }: Props) {
  const disks = DISK_KEYS.filter(k => config[k]);
  const [disk, setDisk] = useState(disks[0] ?? '');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSubmit() {
    if (!disk) { setError('Disk is required.'); return; }
    if (!size.trim()) { setError('Size is required (e.g. +10G or 50G).'); return; }
    setLoading(true);
    setError(null);
    const r = await onResize(disk, size.trim());
    setLoading(false);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    onClose();
  }

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Resize Disk</h2>
        <div>
          <label className={labelCls}>Disk <span className="text-destructive">*</span></label>
          <select className={inputCls} value={disk} onChange={e => setDisk(e.target.value)}>
            {disks.length > 0 ? disks.map(d => <option key={d} value={d}>{d}</option>) : <option value="">No disks found</option>}
          </select>
        </div>
        <div>
          <label className={labelCls}>New Size <span className="text-destructive">*</span></label>
          <input className={inputCls} type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="+10G or 50G" />
          <p className="text-xs text-muted-foreground mt-1">Prefix with + to add capacity, or enter absolute size.</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || disks.length === 0}>{loading ? 'Resizing…' : 'Resize'}</Button>
        </div>
      </div>
    </div>
  );
}

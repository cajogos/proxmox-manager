import { useEffect, useRef, useState } from 'react';
import { getNextVMID, getNodes, type NodeInfo } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  currentNode: string;
  onClose: () => void;
  onClone: (params: { newid: number; name?: string; target?: string; full: boolean; storage?: string }) => Promise<{ ok: boolean; error?: string }>;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CloneDialog({ open, currentNode, onClose, onClone }: Props) {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [newid, setNewid] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState(currentNode);
  const [full, setFull] = useState(false);
  const [storage, setStorage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void getNodes().then(r => { if (r.ok) setNodes(r.data); });
    void getNextVMID().then(r => { if (r.ok) setNewid(String(r.data)); });
    setTarget(currentNode);
  }, [open, currentNode]);

  async function handleSubmit() {
    if (!newid) { setError('New VMID is required.'); return; }
    setLoading(true);
    setError(null);
    const r = await onClone({ newid: Number(newid), name: name || undefined, target: target || undefined, full, storage: storage || undefined });
    setLoading(false);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    onClose();
  }

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Clone</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>New VMID <span className="text-destructive">*</span></label>
            <input className={inputCls} type="number" value={newid} onChange={e => setNewid(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="clone name" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Target Node</label>
          <select className={inputCls} value={target} onChange={e => setTarget(e.target.value)}>
            {nodes.map(n => <option key={n.node} value={n.node}>{n.node}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Storage</label>
          <input className={inputCls} type="text" value={storage} onChange={e => setStorage(e.target.value)} placeholder="optional" />
        </div>
        <div className="flex items-center gap-2">
          <input id="clone-full" type="checkbox" checked={full} onChange={e => setFull(e.target.checked)} />
          <label htmlFor="clone-full" className="text-sm">Full clone (independent copy)</label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Cloning…' : 'Clone'}</Button>
        </div>
      </div>
    </div>
  );
}

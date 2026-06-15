import { useEffect, useRef, useState } from 'react';
import { getNodes, type NodeInfo } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  currentNode: string;
  onClose: () => void;
  onMigrate: (params: { target: string; online: boolean }) => Promise<{ ok: boolean; error?: string }>;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function MigrateDialog({ open, currentNode, onClose, onMigrate }: Props) {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [target, setTarget] = useState('');
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void getNodes().then(r => {
      if (r.ok) {
        setNodes(r.data);
        const others = r.data.filter(n => n.node !== currentNode);
        if (others.length > 0) setTarget(others[0].node);
      }
    });
  }, [open, currentNode]);

  async function handleSubmit() {
    if (!target) { setError('Target node is required.'); return; }
    if (target === currentNode) { setError('Target must differ from current node.'); return; }
    setLoading(true);
    setError(null);
    const r = await onMigrate({ target, online });
    setLoading(false);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    onClose();
  }

  if (!open) return null;

  const otherNodes = nodes.filter(n => n.node !== currentNode);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Migrate</h2>
        <p className="text-sm text-muted-foreground">Current node: <strong>{currentNode}</strong></p>
        <div>
          <label className={labelCls}>Target Node <span className="text-destructive">*</span></label>
          <select className={inputCls} value={target} onChange={e => setTarget(e.target.value)}>
            {otherNodes.map(n => <option key={n.node} value={n.node}>{n.node}</option>)}
          </select>
          {otherNodes.length === 0 && <p className="text-xs text-muted-foreground mt-1">No other nodes available.</p>}
        </div>
        <div className="flex items-center gap-2">
          <input id="mig-online" type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} />
          <label htmlFor="mig-online" className="text-sm">Live migration (no downtime)</label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || otherNodes.length === 0}>{loading ? 'Migrating…' : 'Migrate'}</Button>
        </div>
      </div>
    </div>
  );
}

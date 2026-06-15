import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Snapshot {
  snapname: string;
  description?: string;
  snaptime?: number;
  parent?: string;
}

interface Props {
  vmid: number;
  type: 'vm' | 'lxc';
  fetchSnapshots: (vmid: number) => Promise<{ ok: boolean; data?: Snapshot[]; error?: string }>;
  createSnapshot: (vmid: number, name: string, description?: string) => Promise<{ ok: boolean; error?: string }>;
  deleteSnapshot: (vmid: number, name: string) => Promise<{ ok: boolean; error?: string }>;
  rollbackSnapshot: (vmid: number, name: string) => Promise<{ ok: boolean; error?: string }>;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

function formatTime(ts?: number) {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString();
}

export default function SnapshotTab({ vmid, fetchSnapshots, createSnapshot, deleteSnapshot, rollbackSnapshot }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmRollback, setConfirmRollback] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const r = await fetchSnapshots(vmid);
    setLoading(false);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    setSnapshots((r.data ?? []).filter(s => s.snapname !== 'current').sort((a, b) => (b.snaptime ?? 0) - (a.snaptime ?? 0)));
  }

  useEffect(() => { void load(); }, [vmid]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const r = await createSnapshot(vmid, newName.trim(), newDesc.trim() || undefined);
    setCreating(false);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    setNewName(''); setNewDesc('');
    void load();
  }

  async function handleDelete(name: string) {
    const r = await deleteSnapshot(vmid, name);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    setConfirmDelete(null);
    void load();
  }

  async function handleRollback(name: string) {
    const r = await rollbackSnapshot(vmid, name);
    if (!r.ok) { setError(r.error ?? 'Failed'); return; }
    setConfirmRollback(null);
    void load();
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading snapshots…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="border border-border rounded p-4 space-y-3">
        <h3 className="text-sm font-semibold">Create Snapshot</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name <span className="text-destructive">*</span></label>
            <input className={inputCls} value={newName} onChange={e => setNewName(e.target.value)} placeholder="before-update" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input className={inputCls} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
          {creating ? 'Creating…' : 'Create Snapshot'}
        </Button>
      </div>

      {snapshots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No snapshots.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Description</th>
              <th className="pb-2 pr-4">Created</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map(s => (
              <tr key={s.snapname} className="border-b border-border last:border-0">
                <td className="py-2 pr-4 font-mono">{s.snapname}</td>
                <td className="py-2 pr-4 text-muted-foreground">{s.description ?? '-'}</td>
                <td className="py-2 pr-4">{formatTime(s.snaptime)}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setConfirmRollback(s.snapname)}>Rollback</Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(s.snapname)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirmDelete && (
        <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-sm w-full mx-4">
            <p className="text-sm">Delete snapshot <strong>{confirmDelete}</strong>? This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(confirmDelete)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {confirmRollback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-sm w-full mx-4">
            <p className="text-sm text-destructive font-medium">Warning: Rollback is destructive.</p>
            <p className="text-sm">All changes since snapshot <strong>{confirmRollback}</strong> will be lost.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmRollback(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleRollback(confirmRollback)}>Rollback</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

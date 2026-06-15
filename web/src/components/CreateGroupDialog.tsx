import { useState } from 'react';
import { createAccessGroup } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateGroupDialog({ open, onClose, onSuccess }: Props) {
  const [groupid, setGroupid] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!groupid) { setError('Group ID is required'); return; }
    setLoading(true); setError(null);
    const result = await createAccessGroup({ groupid, comment: comment || undefined });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setGroupid(''); setComment('');
    onSuccess();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create Group</h2>

        <div>
          <label className={labelCls}>Group ID <span className="text-destructive">*</span></label>
          <input className={inputCls} value={groupid} onChange={e => setGroupid(e.target.value)} placeholder="admins" />
        </div>

        <div>
          <label className={labelCls}>Comment</label>
          <input className={inputCls} value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create Group'}</Button>
        </div>
      </div>
    </div>
  );
}

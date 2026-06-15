import { useState } from 'react';
import { createAccessUser } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateUserDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ userid: '', password: '', firstname: '', lastname: '', email: '', groups: '', comment: '', enable: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.userid) { setError('User ID is required'); return; }
    setLoading(true); setError(null);
    const result = await createAccessUser({
      userid: form.userid,
      password: form.password || undefined,
      firstname: form.firstname || undefined,
      lastname: form.lastname || undefined,
      email: form.email || undefined,
      groups: form.groups || undefined,
      comment: form.comment || undefined,
      enable: form.enable ? 1 : 0,
    });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setForm({ userid: '', password: '', firstname: '', lastname: '', email: '', groups: '', comment: '', enable: true });
    onSuccess();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create User</h2>

        <div>
          <label className={labelCls}>User ID <span className="text-destructive">*</span></label>
          <input className={inputCls} value={form.userid} onChange={e => set('userid', e.target.value)} placeholder="user@pam" />
        </div>

        <div>
          <label className={labelCls}>Password</label>
          <input className={inputCls} type="password" value={form.password} onChange={e => set('password', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First Name</label>
            <input className={inputCls} value={form.firstname} onChange={e => set('firstname', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input className={inputCls} value={form.lastname} onChange={e => set('lastname', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Groups</label>
          <input className={inputCls} value={form.groups} onChange={e => set('groups', e.target.value)} placeholder="group1,group2" />
        </div>

        <div>
          <label className={labelCls}>Comment</label>
          <input className={inputCls} value={form.comment} onChange={e => set('comment', e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="cu-enable" checked={form.enable} onChange={e => set('enable', e.target.checked)} />
          <label htmlFor="cu-enable" className="text-sm">Enabled</label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create User'}</Button>
        </div>
      </div>
    </div>
  );
}

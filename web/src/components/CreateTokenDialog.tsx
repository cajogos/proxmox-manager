import { useState } from 'react';
import { createAccessToken, type CreatedTokenSecret } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  userid: string;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateTokenDialog({ open, userid, onClose, onSuccess }: Props) {
  const [tokenid, setTokenid] = useState('');
  const [comment, setComment] = useState('');
  const [privsep, setPrivsep] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTokenSecret | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    if (!tokenid) { setError('Token ID is required'); return; }
    setLoading(true); setError(null);
    const result = await createAccessToken(userid, tokenid, { comment: comment || undefined, privsep: privsep ? 1 : 0 });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setCreated(result.data);
  }

  function handleCopy() {
    if (!created) return;
    void navigator.clipboard.writeText(created.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    setTokenid(''); setComment(''); setPrivsep(true); setCreated(null); setCopied(false);
    onSuccess();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget && !created) onClose(); }}>
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create API Token</h2>
        <p className="text-sm text-muted-foreground">For user: <span className="font-mono">{userid}</span></p>

        {!created ? (
          <>
            <div>
              <label className={labelCls}>Token ID <span className="text-destructive">*</span></label>
              <input className={inputCls} value={tokenid} onChange={e => setTokenid(e.target.value)} placeholder="mytoken" />
            </div>

            <div>
              <label className={labelCls}>Comment</label>
              <input className={inputCls} value={comment} onChange={e => setComment(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="ct-privsep" checked={privsep} onChange={e => setPrivsep(e.target.checked)} />
              <label htmlFor="ct-privsep" className="text-sm">Privilege separation (restrict token to user's ACL subset)</label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create Token'}</Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded bg-green-50 border border-green-200 p-3 dark:bg-green-950 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Token created — save this secret now!</p>
              <p className="text-xs text-green-700 dark:text-green-300">It will not be shown again.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Full token ID</p>
              <p className="font-mono text-sm break-all">{created['full-tokenid']}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Secret</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm break-all bg-muted rounded px-2 py-1">{created.value}</code>
                <Button size="sm" variant="outline" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleDone}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

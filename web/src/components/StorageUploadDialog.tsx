import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  storage: string;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function StorageUploadDialog({ open, storage, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [node, setNode] = useState('');
  const [contentType, setContentType] = useState<'iso' | 'vztmpl'>('iso');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file) { setError('Please select a file'); return; }
    if (!node) { setError('Node is required'); return; }
    setLoading(true); setError(null); setProgress(0);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('contentType', contentType);
    const url = `/api/storage/${encodeURIComponent(storage)}/upload?node=${encodeURIComponent(node)}`;
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) { resolve(); }
          else {
            try { reject(new Error((JSON.parse(xhr.responseText) as { error: string }).error ?? `HTTP ${xhr.status}`)); }
            catch { reject(new Error(`HTTP ${xhr.status}`)); }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });
      setLoading(false); setProgress(null);
      setFile(null); setNode('');
      onSuccess();
    } catch (e) {
      setLoading(false); setProgress(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Upload to {storage}</h2>

        <div>
          <label className={labelCls}>Content Type</label>
          <select className={inputCls} value={contentType} onChange={e => setContentType(e.target.value as 'iso' | 'vztmpl')}>
            <option value="iso">ISO image</option>
            <option value="vztmpl">Container template</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Node <span className="text-destructive">*</span></label>
          <input className={inputCls} value={node} onChange={e => setNode(e.target.value)} placeholder="pve" />
        </div>

        <div>
          <label className={labelCls}>File <span className="text-destructive">*</span></label>
          <input type="file" className="text-sm" accept={contentType === 'iso' ? '.iso' : '.tar.gz,.tar.xz,.tar.zst'} onChange={e => setFile(e.target.files?.[0] ?? null)} />
          {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
        </div>

        {progress !== null && (
          <div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !file}>{loading ? 'Uploading…' : 'Upload'}</Button>
        </div>
      </div>
    </div>
  );
}

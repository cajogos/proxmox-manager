import { useEffect, useRef, useState } from 'react';
import { createLXC, getNextVMID, getNodes, type NodeInfo } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateLXCDialog({ open, onClose, onSuccess }: Props) {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [vmid, setVmid] = useState('');
  const [hostname, setHostname] = useState('');
  const [node, setNode] = useState('');
  const [ostemplate, setOstemplate] = useState('');
  const [rootfs, setRootfs] = useState('local-lvm:8');
  const [memory, setMemory] = useState('512');
  const [cores, setCores] = useState('1');
  const [password, setPassword] = useState('');
  const [net, setNet] = useState('name=eth0,bridge=vmbr0,ip=dhcp');
  const [unprivileged, setUnprivileged] = useState(true);
  const [start, setStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { return; }
    setError(null);
    void getNodes().then(r => {
      if (r.ok) {
        setNodes(r.data);
        if (r.data.length > 0 && !node) setNode(r.data[0].node);
      }
    });
    void getNextVMID().then(r => {
      if (r.ok) setVmid(String(r.data));
    });
  }, [open]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit() {
    if (!hostname.trim()) { setError('Hostname is required.'); return; }
    if (!node) { setError('Node is required.'); return; }
    if (!ostemplate.trim()) { setError('Template is required.'); return; }
    if (!rootfs.trim()) { setError('Root filesystem is required.'); return; }
    setLoading(true);
    setError(null);
    const result = await createLXC({
      hostname: hostname.trim(),
      node,
      ostemplate: ostemplate.trim(),
      rootfs: rootfs.trim(),
      vmid: vmid ? Number(vmid) : undefined,
      memory: memory ? Number(memory) : undefined,
      cores: cores ? Number(cores) : undefined,
      password: password || undefined,
      net: net || undefined,
      unprivileged,
      start,
    });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onSuccess();
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create LXC Container</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>VMID</label>
              <input className={inputCls} type="number" value={vmid} onChange={e => setVmid(e.target.value)} placeholder="auto" />
            </div>
            <div>
              <label className={labelCls}>Node <span className="text-destructive">*</span></label>
              <select className={inputCls} value={node} onChange={e => setNode(e.target.value)}>
                {nodes.map(n => <option key={n.node} value={n.node}>{n.node}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Hostname <span className="text-destructive">*</span></label>
            <input className={inputCls} type="text" value={hostname} onChange={e => setHostname(e.target.value)} placeholder="my-container" />
          </div>

          <div>
            <label className={labelCls}>Template <span className="text-destructive">*</span></label>
            <input className={inputCls} type="text" value={ostemplate} onChange={e => setOstemplate(e.target.value)} placeholder="local:vztmpl/debian-12-standard.tar.zst" />
          </div>

          <div>
            <label className={labelCls}>Root Filesystem <span className="text-destructive">*</span></label>
            <input className={inputCls} type="text" value={rootfs} onChange={e => setRootfs(e.target.value)} placeholder="local-lvm:8" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Memory (MB)</label>
              <input className={inputCls} type="number" value={memory} onChange={e => setMemory(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Cores</label>
              <input className={inputCls} type="number" value={cores} onChange={e => setCores(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Root Password</label>
            <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="(optional)" />
          </div>

          <div>
            <label className={labelCls}>Network</label>
            <input className={inputCls} type="text" value={net} onChange={e => setNet(e.target.value)} placeholder="name=eth0,bridge=vmbr0,ip=dhcp" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input id="lxc-unpriv" type="checkbox" checked={unprivileged} onChange={e => setUnprivileged(e.target.checked)} />
              <label htmlFor="lxc-unpriv" className="text-sm">Unprivileged container</label>
            </div>
            <div className="flex items-center gap-2">
              <input id="lxc-start" type="checkbox" checked={start} onChange={e => setStart(e.target.checked)} />
              <label htmlFor="lxc-start" className="text-sm">Start after creation</label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating…' : 'Create LXC'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

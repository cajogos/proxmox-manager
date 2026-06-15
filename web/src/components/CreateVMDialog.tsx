import { useEffect, useRef, useState } from 'react';
import { createVM, getNextVMID, getNodes, type NodeInfo } from '@/api/client';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

export default function CreateVMDialog({ open, onClose, onSuccess }: Props) {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [vmid, setVmid] = useState('');
  const [name, setName] = useState('');
  const [node, setNode] = useState('');
  const [memory, setMemory] = useState('512');
  const [cores, setCores] = useState('1');
  const [sockets, setSockets] = useState('1');
  const [cpu, setCpu] = useState('kvm64');
  const [ostype, setOstype] = useState('l26');
  const [disk, setDisk] = useState('');
  const [iso, setIso] = useState('');
  const [net, setNet] = useState('');
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
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!node) { setError('Node is required.'); return; }
    setLoading(true);
    setError(null);
    const result = await createVM({
      name: name.trim(),
      node,
      vmid: vmid ? Number(vmid) : undefined,
      memory: memory ? Number(memory) : undefined,
      cores: cores ? Number(cores) : undefined,
      sockets: sockets ? Number(sockets) : undefined,
      cpu: cpu || undefined,
      ostype: ostype || undefined,
      disk: disk || undefined,
      iso: iso || undefined,
      net: net || undefined,
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
          <h2 className="text-lg font-semibold">Create VM</h2>

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
            <label className={labelCls}>Name <span className="text-destructive">*</span></label>
            <input className={inputCls} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="my-vm" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Memory (MB)</label>
              <input className={inputCls} type="number" value={memory} onChange={e => setMemory(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Cores</label>
              <input className={inputCls} type="number" value={cores} onChange={e => setCores(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Sockets</label>
              <input className={inputCls} type="number" value={sockets} onChange={e => setSockets(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>CPU Type</label>
              <input className={inputCls} type="text" value={cpu} onChange={e => setCpu(e.target.value)} placeholder="kvm64" />
            </div>
            <div>
              <label className={labelCls}>OS Type</label>
              <select className={inputCls} value={ostype} onChange={e => setOstype(e.target.value)}>
                <option value="l26">Linux 2.6/3.x/4.x/5.x/6.x</option>
                <option value="l24">Linux 2.4</option>
                <option value="win11">Windows 11/2022</option>
                <option value="win10">Windows 10/2016/2019</option>
                <option value="win8">Windows 8.x/2012/2012r2</option>
                <option value="win7">Windows 7/2008r2</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Disk</label>
            <input className={inputCls} type="text" value={disk} onChange={e => setDisk(e.target.value)} placeholder="local-lvm:32" />
          </div>

          <div>
            <label className={labelCls}>ISO Image</label>
            <input className={inputCls} type="text" value={iso} onChange={e => setIso(e.target.value)} placeholder="local:iso/debian-12.iso" />
          </div>

          <div>
            <label className={labelCls}>Network Adapter</label>
            <input className={inputCls} type="text" value={net} onChange={e => setNet(e.target.value)} placeholder="virtio,bridge=vmbr0" />
          </div>

          <div className="flex items-center gap-2">
            <input id="vm-start" type="checkbox" checked={start} onChange={e => setStart(e.target.checked)} />
            <label htmlFor="vm-start" className="text-sm">Start VM after creation</label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating…' : 'Create VM'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

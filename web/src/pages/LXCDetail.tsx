import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getLXC, getLXCConfig, getLXCSnapshots, getLXCIPs,
  createLXCSnapshot, deleteLXCSnapshot, rollbackLXCSnapshot,
  lxcAction, cloneLXC, resizeLXCDisk,
} from '@/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Terminal from '@/components/Terminal';
import SnapshotTab from '@/components/SnapshotTab';
import CloneDialog from '@/components/CloneDialog';
import ResizeDiskDialog from '@/components/ResizeDiskDialog';
import type { LXCInfo } from '@/api/client';

function humanBytes(bytes?: number): string {
  if (!bytes) return '-';
  const gb = bytes / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
}

function humanSeconds(s?: number): string {
  if (!s) return '-';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function statusBadge(status: string) {
  if (status === 'running') return <Badge variant="success">running</Badge>;
  if (status === 'stopped') return <Badge variant="destructive">stopped</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

const TABS = ['Overview', 'Config', 'Snapshots'] as const;
type Tab = typeof TABS[number];

export default function LXCDetail() {
  const { ctid: ctidStr } = useParams<{ ctid: string }>();
  const ctid = Number(ctidStr);
  const [ct, setCt] = useState<LXCInfo | null>(null);
  const [ips, setIps] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('Overview');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showResize, setShowResize] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [listRes, cfgRes] = await Promise.all([getLXC(), getLXCConfig(ctid)]);
    setLoading(false);
    if (!listRes.ok) { setError(listRes.error); return; }
    const found = listRes.data.find(c => c.vmid === ctid);
    if (!found) { setError(`Container ${ctid} not found`); return; }
    setCt(found);
    if (cfgRes.ok) setConfig(cfgRes.data);
    if (found.status === 'running') {
      const ipRes = await getLXCIPs(ctid);
      if (ipRes.ok) setIps(ipRes.data);
    }
  }

  useEffect(() => { void load(); }, [ctid]);

  async function handleAction(action: string) {
    setActionError(null);
    const r = await lxcAction(ctid, action);
    if (!r.ok) { setActionError(r.error); return; }
    void load();
  }

  if (loading) return <p className="text-muted-foreground">Loading container {ctid}…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!ct) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/lxc" className="hover:text-foreground">LXC</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{ct.name ?? ctid}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{ct.name ?? `Container ${ctid}`}</h2>
          <p className="text-sm text-muted-foreground">CTID {ctid} · {ct.node} · {statusBadge(ct.status)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ct.status === 'stopped' && <Button size="sm" variant="outline" onClick={() => handleAction('start')}>Start</Button>}
          {ct.status === 'running' && <>
            <Button size="sm" variant="outline" onClick={() => setShowTerminal(v => !v)}>Terminal</Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('shutdown')}>Shutdown</Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction('stop')}>Stop</Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('reboot')}>Reboot</Button>
          </>}
          <Button size="sm" variant="outline" onClick={() => setShowClone(true)}>Clone</Button>
          <Button size="sm" variant="outline" onClick={() => setShowResize(true)}>Resize Disk</Button>
        </div>
      </div>
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {showTerminal && ct.status === 'running' && (
        <Terminal ctid={ctid} onClose={() => setShowTerminal(false)} />
      )}

      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{statusBadge(ct.status)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Node</span><span>{ct.node}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CPUs</span><span>{ct.cpus ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Memory</span><span>{humanBytes(ct.maxmem)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Disk</span><span>{humanBytes(ct.maxdisk)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span>{humanSeconds(ct.uptime)}</span></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">IP Addresses</span><span>{ips.length > 0 ? ips.join(', ') : '-'}</span></div>
          </div>
        </div>
      )}

      {tab === 'Config' && (
        <div className="text-sm font-mono space-y-1">
          {Object.entries(config).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <span className="text-muted-foreground w-40 shrink-0">{k}</span>
              <span className="break-all">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Snapshots' && (
        <SnapshotTab
          vmid={ctid}
          type="lxc"
          fetchSnapshots={id => getLXCSnapshots(id) as Promise<{ ok: boolean; data?: { snapname: string; description?: string; snaptime?: number; parent?: string }[]; error?: string }>}
          createSnapshot={(id, name, desc) => createLXCSnapshot(id, name, desc) as Promise<{ ok: boolean; error?: string }>}
          deleteSnapshot={(id, name) => deleteLXCSnapshot(id, name) as Promise<{ ok: boolean; error?: string }>}
          rollbackSnapshot={(id, name) => rollbackLXCSnapshot(id, name) as Promise<{ ok: boolean; error?: string }>}
        />
      )}

      <CloneDialog
        open={showClone}
        currentNode={ct.node}
        onClose={() => setShowClone(false)}
        onClone={params => cloneLXC(ctid, { newid: params.newid, hostname: params.name, target: params.target, full: params.full, storage: params.storage }) as Promise<{ ok: boolean; error?: string }>}
      />
      <ResizeDiskDialog
        open={showResize}
        config={config}
        onClose={() => setShowResize(false)}
        onResize={(disk, size) => resizeLXCDisk(ctid, disk, size) as Promise<{ ok: boolean; error?: string }>}
      />
    </div>
  );
}

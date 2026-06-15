import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getVM, getVMConfig, getVMSnapshots, getVMIPs,
  createVMSnapshot, deleteVMSnapshot, rollbackVMSnapshot,
  vmAction, cloneVM, migrateVM, resizeVMDisk,
} from '@/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SnapshotTab from '@/components/SnapshotTab';
import CloneDialog from '@/components/CloneDialog';
import MigrateDialog from '@/components/MigrateDialog';
import ResizeDiskDialog from '@/components/ResizeDiskDialog';
import type { VMInfo } from '@/api/client';

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

export default function VMDetail() {
  const { vmid: vmidStr } = useParams<{ vmid: string }>();
  const vmid = Number(vmidStr);
  const [vm, setVm] = useState<VMInfo | null>(null);
  const [ips, setIps] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('Overview');
  const [showClone, setShowClone] = useState(false);
  const [showMigrate, setShowMigrate] = useState(false);
  const [showResize, setShowResize] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [vmRes, cfgRes] = await Promise.all([getVM(vmid), getVMConfig(vmid)]);
    setLoading(false);
    if (!vmRes.ok) { setError(vmRes.error); return; }
    setVm(vmRes.data);
    if (cfgRes.ok) setConfig(cfgRes.data);
    if (vmRes.data.status === 'running') {
      const ipRes = await getVMIPs(vmid);
      if (ipRes.ok) setIps(ipRes.data);
    }
  }

  useEffect(() => { void load(); }, [vmid]);

  async function handleAction(action: string) {
    setActionError(null);
    const r = await vmAction(vmid, action);
    if (!r.ok) { setActionError(r.error); return; }
    void load();
  }

  if (loading) return <p className="text-muted-foreground">Loading VM {vmid}…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!vm) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">VMs</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{vm.name ?? vmid}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{vm.name ?? `VM ${vmid}`}</h2>
          <p className="text-sm text-muted-foreground">VMID {vmid} · {vm.node} · {statusBadge(vm.status)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {vm.status === 'stopped' && <Button size="sm" variant="outline" onClick={() => handleAction('start')}>Start</Button>}
          {vm.status === 'running' && <>
            <Button size="sm" variant="outline" onClick={() => handleAction('shutdown')}>Shutdown</Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction('stop')}>Stop</Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('reboot')}>Reboot</Button>
          </>}
          <Button size="sm" variant="outline" onClick={() => setShowClone(true)}>Clone</Button>
          <Button size="sm" variant="outline" onClick={() => setShowMigrate(true)}>Migrate</Button>
          <Button size="sm" variant="outline" onClick={() => setShowResize(true)}>Resize Disk</Button>
        </div>
      </div>
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

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
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{statusBadge(vm.status)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Node</span><span>{vm.node}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CPUs</span><span>{vm.cpus ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Memory</span><span>{humanBytes(vm.maxmem)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Disk</span><span>{humanBytes(vm.maxdisk)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span>{humanSeconds(vm.uptime)}</span></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">IP Addresses</span><span>{ips.length > 0 ? ips.join(', ') : '-'}</span></div>
            {vm.tags && <div className="flex justify-between"><span className="text-muted-foreground">Tags</span><span>{vm.tags}</span></div>}
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
          vmid={vmid}
          type="vm"
          fetchSnapshots={id => getVMSnapshots(id) as Promise<{ ok: boolean; data?: { snapname: string; description?: string; snaptime?: number; parent?: string }[]; error?: string }>}
          createSnapshot={(id, name, desc) => createVMSnapshot(id, name, desc) as Promise<{ ok: boolean; error?: string }>}
          deleteSnapshot={(id, name) => deleteVMSnapshot(id, name) as Promise<{ ok: boolean; error?: string }>}
          rollbackSnapshot={(id, name) => rollbackVMSnapshot(id, name) as Promise<{ ok: boolean; error?: string }>}
        />
      )}

      <CloneDialog
        open={showClone}
        currentNode={vm.node}
        onClose={() => setShowClone(false)}
        onClone={params => cloneVM(vmid, params) as Promise<{ ok: boolean; error?: string }>}
      />
      <MigrateDialog
        open={showMigrate}
        currentNode={vm.node}
        onClose={() => setShowMigrate(false)}
        onMigrate={params => migrateVM(vmid, params) as Promise<{ ok: boolean; error?: string }>}
      />
      <ResizeDiskDialog
        open={showResize}
        config={config}
        onClose={() => setShowResize(false)}
        onResize={(disk, size) => resizeVMDisk(vmid, disk, size) as Promise<{ ok: boolean; error?: string }>}
      />
    </div>
  );
}

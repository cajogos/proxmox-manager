import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNodeDetail, getNodeServices, getNodeTasks, type NodeDetail, type ServiceInfo, type TaskInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Tab = 'overview' | 'services' | 'tasks';

function humanSeconds(s?: number): string {
  if (!s) return '-';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function bytes(b?: number, unit: 'GB' | 'MB' = 'GB'): string {
  if (b == null) return '-';
  const div = unit === 'GB' ? 1024 ** 3 : 1024 ** 2;
  return `${(b / div).toFixed(1)} ${unit}`;
}

export default function NodeDetail() {
  const { node } = useParams<{ node: string }>();
  const [tab, setTab] = useState<Tab>('overview');
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node) return;
    setLoading(true);
    void Promise.all([
      getNodeDetail(node),
      getNodeServices(node),
      getNodeTasks(node),
    ]).then(([d, s, t]) => {
      setLoading(false);
      if (!d.ok) { setError(d.error); return; }
      if (!s.ok) { setError(s.error); return; }
      if (!t.ok) { setError(t.error); return; }
      setDetail(d.data);
      setServices(s.data);
      setTasks(t.data);
    });
  }, [node]);

  if (loading) return <p className="text-muted-foreground">Loading node…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!detail) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'services', label: `Services (${services.length})` },
    { key: 'tasks', label: `Tasks (${tasks.length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/nodes" className="hover:text-foreground">Nodes</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{detail.node}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-mono">{detail.node}</h2>
          <div className="flex items-center gap-2 mt-1">
            {detail.status === 'online'
              ? <Badge variant="success">online</Badge>
              : <Badge variant="destructive">{detail.status}</Badge>}
            {detail.pveversion && <span className="text-xs text-muted-foreground">PVE {detail.pveversion}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-3 rounded border border-border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>CPU</span><span className="font-mono">{detail.cpu != null ? `${(detail.cpu * 100).toFixed(1)}%` : '-'}</span></div>
              <div className="flex justify-between"><span>Memory</span><span className="font-mono">{detail.memory ? `${bytes(detail.memory.used)} / ${bytes(detail.memory.total)}` : (detail.mem != null ? `${bytes(detail.mem)} / ${bytes(detail.maxmem)}` : '-')}</span></div>
              <div className="flex justify-between"><span>Swap</span><span className="font-mono">{detail.swap ? `${bytes(detail.swap.used)} / ${bytes(detail.swap.total)}` : '-'}</span></div>
              <div className="flex justify-between"><span>Disk</span><span className="font-mono">{detail.disk != null ? `${bytes(detail.disk)} / ${bytes(detail.maxdisk)}` : '-'}</span></div>
              <div className="flex justify-between"><span>Uptime</span><span className="font-mono">{humanSeconds(detail.uptime)}</span></div>
              {detail.loadavg && <div className="flex justify-between"><span>Load avg</span><span className="font-mono">{detail.loadavg.join(' / ')}</span></div>}
            </div>
          </div>
          <div className="space-y-3 rounded border border-border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">System</h3>
            <div className="space-y-2 text-sm">
              {detail.kversion && <div className="flex justify-between gap-4"><span>Kernel</span><span className="font-mono text-xs break-all">{detail.kversion}</span></div>}
              {detail.cpuinfo && (
                <>
                  <div className="flex justify-between"><span>CPU model</span><span className="font-mono text-xs">{detail.cpuinfo.model}</span></div>
                  <div className="flex justify-between"><span>Sockets</span><span className="font-mono">{detail.cpuinfo.sockets}</span></div>
                  <div className="flex justify-between"><span>Cores</span><span className="font-mono">{detail.cpuinfo.cores}</span></div>
                  <div className="flex justify-between"><span>Total CPUs</span><span className="font-mono">{detail.cpuinfo.cpus}</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Unit File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(s => (
              <TableRow key={s.name}>
                <TableCell className="font-mono text-sm font-medium">{s.name}</TableCell>
                <TableCell className="text-sm">{s.desc ?? '-'}</TableCell>
                <TableCell>
                  {s.state === 'running'
                    ? <Badge variant="success">running</Badge>
                    : s.state === 'dead' || s.state === 'failed'
                      ? <Badge variant="destructive">{s.state}</Badge>
                      : <Badge variant="secondary">{s.state}</Badge>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s['unit-file-state'] ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'tasks' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.slice(0, 50).map(t => (
              <TableRow key={t.upid}>
                <TableCell className="font-mono text-sm">{t.type}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{t.id ?? '-'}</TableCell>
                <TableCell className="text-sm">{t.user}</TableCell>
                <TableCell className="text-sm">{new Date(t.starttime * 1000).toLocaleString()}</TableCell>
                <TableCell>
                  {t.status === 'OK'
                    ? <Badge variant="success">OK</Badge>
                    : t.status
                      ? <Badge variant="destructive">{t.status}</Badge>
                      : <Badge variant="secondary">running</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

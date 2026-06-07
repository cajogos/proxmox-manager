import { useEffect, useState } from 'react';
import { getClusterResources, getClusterStatus, type ClusterResource, type ClusterStatusEntry } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function statusBadge(status?: string) {
  if (!status) return <Badge variant="secondary">-</Badge>;
  if (status === 'running') return <Badge variant="success">{status}</Badge>;
  if (status === 'stopped' || status === 'offline') return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function humanMB(bytes?: number): string {
  if (!bytes) return '-';
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

export default function Cluster() {
  const [resources, setResources] = useState<ClusterResource[]>([]);
  const [status, setStatus] = useState<ClusterStatusEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [r, s] = await Promise.all([getClusterResources(), getClusterStatus()]);
      setLoading(false);
      if (!r.ok) { setError(r.error); return; }
      if (!s.ok) { setError(s.error); return; }
      setResources(r.data);
      setStatus(s.data);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading cluster…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  const nodes = status.filter(e => e.type === 'node');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Cluster</h2>
        <p className="text-sm text-muted-foreground">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {resources.length} resource{resources.length !== 1 ? 's' : ''}
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-base font-medium">Nodes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Quorate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map(n => (
              <TableRow key={n.id}>
                <TableCell className="font-mono">{n.name}</TableCell>
                <TableCell>{n.online ? <Badge variant="success">online</Badge> : <Badge variant="destructive">offline</Badge>}</TableCell>
                <TableCell className="font-mono">{n.ip ?? '-'}</TableCell>
                <TableCell>{n.quorate ? 'yes' : 'no'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 text-base font-medium">Resources</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>HA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{r.vmid ?? r.id}</TableCell>
                <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                <TableCell>{r.name ?? '-'}</TableCell>
                <TableCell>{r.node ?? '-'}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
                <TableCell>{r.cpu != null ? `${Math.round(r.cpu * 100)}%` : '-'}</TableCell>
                <TableCell>{humanMB(r.mem)}</TableCell>
                <TableCell>{r.hastate ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

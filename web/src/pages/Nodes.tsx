import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNodes, type NodeInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function statusBadge(status: string) {
  if (status === 'online') return <Badge variant="success">online</Badge>;
  if (status === 'offline') return <Badge variant="destructive">offline</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function humanSeconds(s?: number): string {
  if (!s) return '-';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Nodes() {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getNodes();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setNodes(result.data);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading nodes…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Nodes</h2>
        <p className="text-sm text-muted-foreground">{nodes.length} node(s)</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Uptime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.map(n => (
            <TableRow key={n.node}>
              <TableCell className="font-medium"><Link to={`/nodes/${n.node}`} className="hover:underline">{n.node}</Link></TableCell>
              <TableCell>{statusBadge(n.status)}</TableCell>
              <TableCell>{n.cpu != null ? `${(n.cpu * 100).toFixed(1)}%` : '-'}</TableCell>
              <TableCell>
                {n.mem != null && n.maxmem != null
                  ? `${(n.mem / 1024 ** 3).toFixed(1)} / ${(n.maxmem / 1024 ** 3).toFixed(1)} GB`
                  : '-'}
              </TableCell>
              <TableCell>{humanSeconds(n.uptime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getLXC, lxcAction, type LXCInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function statusBadge(status: string) {
  if (status === 'running') return <Badge variant="success">running</Badge>;
  if (status === 'stopped') return <Badge variant="destructive">stopped</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function humanMB(mb?: number): string {
  if (!mb) return '-';
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

export default function LXC() {
  const [containers, setContainers] = useState<LXCInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await getLXC();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setContainers(result.data);
  }

  useEffect(() => { void load(); }, []);

  async function handleAction(ctid: number, action: string) {
    await lxcAction(ctid, action);
    void load();
  }

  if (loading) return <p className="text-muted-foreground">Loading containers…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">LXC Containers</h2>
        <p className="text-sm text-muted-foreground">{containers.length} container(s)</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CTID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Node</TableHead>
            <TableHead>CPUs</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.map(ct => (
            <TableRow key={ct.vmid}>
              <TableCell className="font-mono">{ct.vmid}</TableCell>
              <TableCell>{ct.name ?? '-'}</TableCell>
              <TableCell>{statusBadge(ct.status)}</TableCell>
              <TableCell>{ct.node}</TableCell>
              <TableCell>{ct.cpus ?? '-'}</TableCell>
              <TableCell>{humanMB(ct.maxmem != null ? ct.maxmem / (1024 * 1024) : undefined)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {ct.status === 'stopped' && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(ct.vmid, 'start')}>
                      Start
                    </Button>
                  )}
                  {ct.status === 'running' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAction(ct.vmid, 'shutdown')}>
                        Shutdown
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(ct.vmid, 'stop')}>
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

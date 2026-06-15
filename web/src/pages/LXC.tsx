import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLXC, getLXCIPs, lxcAction, type LXCInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreateLXCDialog from '@/components/CreateLXCDialog';
import Terminal from '@/components/Terminal';

function statusBadge(status: string) {
  if (status === 'running') return <Badge variant="success">running</Badge>;
  if (status === 'stopped') return <Badge variant="destructive">stopped</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function humanBytes(bytes?: number): string {
  if (!bytes) return '-';
  const gb = bytes / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
}

export default function LXC() {
  const [containers, setContainers] = useState<LXCInfo[]>([]);
  const [ips, setIPs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [terminalCtid, setTerminalCtid] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const result = await getLXC();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setContainers(result.data);
    setIPs({});
    const running = result.data.filter(c => c.status === 'running');
    void Promise.all(
      running.map(async c => {
        const r = await getLXCIPs(c.vmid);
        if (r.ok && r.data.length > 0) {
          setIPs(prev => ({ ...prev, [c.vmid]: r.data[0] }));
        }
      }),
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">LXC Containers</h2>
          <p className="text-sm text-muted-foreground">{containers.length} container(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>Refresh</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create LXC</Button>
        </div>
      </div>
      <CreateLXCDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); void load(); }}
      />
      {terminalCtid !== null && (
        <Terminal ctid={terminalCtid} onClose={() => setTerminalCtid(null)} />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CTID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Node</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>CPUs</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Disk</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...containers].sort((a, b) => a.vmid - b.vmid).map(ct => (
            <TableRow key={ct.vmid}>
              <TableCell className="font-mono"><Link to={`/lxc/${ct.vmid}`} className="hover:underline text-primary">{ct.vmid}</Link></TableCell>
              <TableCell>{ct.name ?? '-'}</TableCell>
              <TableCell>{statusBadge(ct.status)}</TableCell>
              <TableCell>{ct.node}</TableCell>
              <TableCell className="font-mono text-sm">{ips[ct.vmid] ?? (ct.status === 'running' ? <span className="text-muted-foreground">…</span> : '-')}</TableCell>
              <TableCell>{ct.cpus ?? '-'}</TableCell>
              <TableCell>{humanBytes(ct.maxmem)}</TableCell>
              <TableCell>{humanBytes(ct.maxdisk)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {ct.status === 'stopped' && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(ct.vmid, 'start')}>
                      Start
                    </Button>
                  )}
                  {ct.status === 'running' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setTerminalCtid(ct.vmid)}>
                        Terminal
                      </Button>
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

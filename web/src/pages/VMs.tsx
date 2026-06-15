import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVMs, getVMIPs, vmAction, type VMInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreateVMDialog from '@/components/CreateVMDialog';

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

export default function VMs() {
  const [vms, setVMs] = useState<VMInfo[]>([]);
  const [ips, setIPs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const result = await getVMs();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setVMs(result.data);
    setIPs({});
    const running = result.data.filter(v => v.status === 'running');
    void Promise.all(
      running.map(async v => {
        const r = await getVMIPs(v.vmid);
        if (r.ok && r.data.length > 0) {
          setIPs(prev => ({ ...prev, [v.vmid]: r.data[0] }));
        }
      }),
    );
  }

  useEffect(() => { void load(); }, []);

  async function handleAction(vmid: number, action: string) {
    await vmAction(vmid, action);
    void load();
  }

  if (loading) return <p className="text-muted-foreground">Loading VMs…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Virtual Machines</h2>
          <p className="text-sm text-muted-foreground">{vms.length} VM(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>Refresh</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create VM</Button>
        </div>
      </div>
      <CreateVMDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); void load(); }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VMID</TableHead>
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
          {[...vms].sort((a, b) => a.vmid - b.vmid).map(vm => (
            <TableRow key={vm.vmid}>
              <TableCell className="font-mono"><Link to={`/vms/${vm.vmid}`} className="hover:underline text-primary">{vm.vmid}</Link></TableCell>
              <TableCell>{vm.name ?? '-'}</TableCell>
              <TableCell>{statusBadge(vm.status)}</TableCell>
              <TableCell>{vm.node}</TableCell>
              <TableCell className="font-mono text-sm">{ips[vm.vmid] ?? (vm.status === 'running' ? <span className="text-muted-foreground">…</span> : '-')}</TableCell>
              <TableCell>{vm.cpus ?? '-'}</TableCell>
              <TableCell>{humanBytes(vm.maxmem)}</TableCell>
              <TableCell>{humanBytes(vm.maxdisk)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {vm.status === 'stopped' && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(vm.vmid, 'start')}>
                      Start
                    </Button>
                  )}
                  {vm.status === 'running' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAction(vm.vmid, 'shutdown')}>
                        Shutdown
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(vm.vmid, 'stop')}>
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

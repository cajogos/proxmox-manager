import { useEffect, useState } from 'react';
import { getVMs, vmAction, type VMInfo } from '@/api/client';
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

export default function VMs() {
  const [vms, setVMs] = useState<VMInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await getVMs();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setVMs(result.data);
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
      <div>
        <h2 className="text-xl font-semibold">Virtual Machines</h2>
        <p className="text-sm text-muted-foreground">{vms.length} VM(s)</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VMID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Node</TableHead>
            <TableHead>CPUs</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vms.map(vm => (
            <TableRow key={vm.vmid}>
              <TableCell className="font-mono">{vm.vmid}</TableCell>
              <TableCell>{vm.name ?? '-'}</TableCell>
              <TableCell>{statusBadge(vm.status)}</TableCell>
              <TableCell>{vm.node}</TableCell>
              <TableCell>{vm.cpus ?? '-'}</TableCell>
              <TableCell>{humanMB(vm.maxmem != null ? vm.maxmem / (1024 * 1024) : undefined)}</TableCell>
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

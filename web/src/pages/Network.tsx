import { useEffect, useState } from 'react';
import { getNodes, getNetworkIfaces, type NodeInfo, type NetworkIface } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Network() {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [ifaces, setIfaces] = useState<NetworkIface[]>([]);
  const [loading, setLoading] = useState(true);
  const [ifaceLoading, setIfaceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getNodes();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setNodes(result.data);
      if (result.data.length > 0) {
        setSelected(result.data[0]!.node);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    void (async () => {
      setIfaceLoading(true);
      const result = await getNetworkIfaces(selected);
      setIfaceLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setIfaces(result.data);
    })();
  }, [selected]);

  if (loading) return <p className="text-muted-foreground">Loading nodes…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Network</h2>
        <p className="text-sm text-muted-foreground">Network interfaces per node</p>
      </div>

      <div className="flex gap-2">
        {nodes.map(n => (
          <button
            key={n.node}
            onClick={() => setSelected(n.node)}
            className={`rounded px-3 py-1 text-sm ${selected === n.node ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {n.node}
          </button>
        ))}
      </div>

      {ifaceLoading ? (
        <p className="text-muted-foreground">Loading interfaces…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interface</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Autostart</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Bridge Ports</TableHead>
              <TableHead>MTU</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ifaces.map(iface => (
              <TableRow key={iface.iface}>
                <TableCell className="font-mono font-medium">{iface.iface}</TableCell>
                <TableCell><Badge variant="outline">{iface.type}</Badge></TableCell>
                <TableCell>{iface.active ? <Badge variant="success">yes</Badge> : <Badge variant="secondary">no</Badge>}</TableCell>
                <TableCell>{iface.autostart ? 'yes' : 'no'}</TableCell>
                <TableCell className="font-mono">{iface.address ? `${iface.address}/${iface.netmask ?? ''}` : '-'}</TableCell>
                <TableCell className="font-mono">{iface.gateway ?? '-'}</TableCell>
                <TableCell className="font-mono">{iface.bridge_ports ?? '-'}</TableCell>
                <TableCell>{iface.mtu ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

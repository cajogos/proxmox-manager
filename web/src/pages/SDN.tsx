import { useEffect, useState } from 'react';
import { getSDNZones, getSDNVNets, getSDNSubnets, type SDNZone, type SDNVNet, type SDNSubnet } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Tab = 'zones' | 'vnets' | 'subnets';

export default function SDN() {
  const [tab, setTab] = useState<Tab>('zones');
  const [zones, setZones] = useState<SDNZone[]>([]);
  const [vnets, setVNets] = useState<SDNVNet[]>([]);
  const [subnets, setSubnets] = useState<SDNSubnet[]>([]);
  const [selectedVNet, setSelectedVNet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true); setError(null);
    const [z, v] = await Promise.all([getSDNZones(), getSDNVNets()]);
    setLoading(false);
    if (!z.ok) { setError(z.error); return; }
    if (!v.ok) { setError(v.error); return; }
    setZones(z.data);
    setVNets(v.data);
    if (v.data.length > 0 && !selectedVNet) setSelectedVNet(v.data[0].vnet);
  }

  useEffect(() => { void fetchData(); }, []);

  useEffect(() => {
    if (tab !== 'subnets' || !selectedVNet) return;
    setLoading(true);
    void getSDNSubnets(selectedVNet).then(r => {
      setLoading(false);
      if (!r.ok) { setError(r.error); return; }
      setSubnets(r.data);
    });
  }, [tab, selectedVNet]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'zones', label: 'Zones' },
    { key: 'vnets', label: 'VNets' },
    { key: 'subnets', label: 'Subnets' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">SDN</h2>
          <p className="text-sm text-muted-foreground">Software Defined Networking</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void fetchData()}>Refresh</Button>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${tab === t.key ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >{t.label}</button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <>
          {tab === 'zones' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-muted-foreground text-sm">No SDN zones configured.</TableCell></TableRow>
                ) : zones.map(z => (
                  <TableRow key={z.zone}>
                    <TableCell className="font-mono font-medium">{z.zone}</TableCell>
                    <TableCell><Badge variant="secondary">{z.type}</Badge></TableCell>
                    <TableCell className="text-sm">{z.nodes ?? '-'}</TableCell>
                    <TableCell>{z.pending ? <Badge variant="secondary">pending</Badge> : <Badge variant="success">ok</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 'vnets' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VNet</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vnets.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground text-sm">No VNets configured.</TableCell></TableRow>
                ) : vnets.map(v => (
                  <TableRow key={v.vnet}>
                    <TableCell className="font-mono font-medium">{v.vnet}</TableCell>
                    <TableCell className="font-mono text-sm">{v.zone}</TableCell>
                    <TableCell>{v.alias ?? '-'}</TableCell>
                    <TableCell>{v.tag ?? '-'}</TableCell>
                    <TableCell>{v.pending ? <Badge variant="secondary">pending</Badge> : <Badge variant="success">ok</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 'subnets' && (
            <>
              {vnets.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">VNet:</span>
                  <select className="border border-border rounded px-2 py-1 text-sm bg-background" value={selectedVNet ?? ''} onChange={e => setSelectedVNet(e.target.value)}>
                    {vnets.map(v => <option key={v.vnet} value={v.vnet}>{v.vnet}</option>)}
                  </select>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subnet</TableHead>
                    <TableHead>CIDR</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>SNAT</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subnets.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-muted-foreground text-sm">No subnets configured.</TableCell></TableRow>
                  ) : subnets.map(s => (
                    <TableRow key={s.subnet}>
                      <TableCell className="font-mono text-sm">{s.subnet}</TableCell>
                      <TableCell className="font-mono text-sm">{s.cidr ?? '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{s.gateway ?? '-'}</TableCell>
                      <TableCell>{s.snat ? 'yes' : 'no'}</TableCell>
                      <TableCell>{s.type ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}
    </div>
  );
}

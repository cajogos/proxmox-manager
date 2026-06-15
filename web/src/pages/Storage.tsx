import { useEffect, useState } from 'react';
import { getStorage, type StorageInfo } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StorageUploadDialog from '@/components/StorageUploadDialog';

function humanBytes(b?: number): string {
  if (b == null) return '-';
  if (b >= 1024 ** 4) return `${(b / 1024 ** 4).toFixed(1)} TiB`;
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)} GiB`;
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(1)} MiB`;
  return `${b} B`;
}

export default function Storage() {
  const [pools, setPools] = useState<StorageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getStorage();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setPools(result.data);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading storage…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Storage</h2>
          <p className="text-sm text-muted-foreground">{pools.length} pool(s)</p>
        </div>
      </div>
      {uploadTarget && (
        <StorageUploadDialog
          open={true}
          storage={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onSuccess={() => setUploadTarget(null)}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Storage</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map(p => (
            <TableRow key={p.storage}>
              <TableCell className="font-medium">{p.storage}</TableCell>
              <TableCell>{p.type}</TableCell>
              <TableCell>{humanBytes(p.total)}</TableCell>
              <TableCell>{humanBytes(p.used)}</TableCell>
              <TableCell>{humanBytes(p.avail)}</TableCell>
              <TableCell>
                {p.active
                  ? <Badge variant="success">active</Badge>
                  : <Badge variant="secondary">inactive</Badge>}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => setUploadTarget(p.storage)}>Upload</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

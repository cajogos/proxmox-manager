import { useEffect, useState } from 'react';
import { getBackupJobs, deleteBackupJob, type BackupJob } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Backup() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await getBackupJobs();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setJobs(result.data);
  }

  useEffect(() => { void load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm(`Delete backup job ${id}?`)) return;
    const result = await deleteBackupJob(id);
    if (!result.ok) { alert(`Delete failed: ${result.error}`); return; }
    void load();
  }

  if (loading) return <p className="text-muted-foreground">Loading backup jobs…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Backup Jobs</h2>
        <p className="text-sm text-muted-foreground">{jobs.length} scheduled job{jobs.length !== 1 ? 's' : ''}</p>
      </div>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No scheduled backup jobs.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-sm">{job.id}</TableCell>
                <TableCell className="font-mono">{job.schedule ?? '-'}</TableCell>
                <TableCell>{job.storage ?? '-'}</TableCell>
                <TableCell>{job.mode ?? '-'}</TableCell>
                <TableCell>
                  {job.enabled !== 0
                    ? <Badge variant="success">yes</Badge>
                    : <Badge variant="secondary">no</Badge>}
                </TableCell>
                <TableCell>{job.comment ?? '-'}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

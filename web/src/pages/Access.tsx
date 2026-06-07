import { useEffect, useState } from 'react';
import { getAccessUsers, getAccessGroups, getAccessRoles, type AccessUser, type AccessGroup, type AccessRole } from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Tab = 'users' | 'groups' | 'roles';

export default function Access() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [u, g, r] = await Promise.all([getAccessUsers(), getAccessGroups(), getAccessRoles()]);
      setLoading(false);
      if (!u.ok) { setError(u.error); return; }
      if (!g.ok) { setError(g.error); return; }
      if (!r.ok) { setError(r.error); return; }
      setUsers(u.data);
      setGroups(g.data);
      setRoles(r.data);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading access data…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'users', label: 'Users', count: users.length },
    { key: 'groups', label: 'Groups', count: groups.length },
    { key: 'roles', label: 'Roles', count: roles.length },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Access</h2>
        <p className="text-sm text-muted-foreground">Users, groups, and roles</p>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${tab === t.key ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label} <span className="ml-1 text-xs text-muted-foreground">({t.count})</span>
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Expire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.userid}>
                <TableCell className="font-mono">{u.userid}</TableCell>
                <TableCell>{u.comment ?? '-'}</TableCell>
                <TableCell>{u.enable !== 0 ? <Badge variant="success">yes</Badge> : <Badge variant="secondary">no</Badge>}</TableCell>
                <TableCell className="font-mono text-sm">{u.groups ?? '-'}</TableCell>
                <TableCell>{u.expire ? new Date(u.expire * 1000).toLocaleDateString() : 'never'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'groups' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group ID</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(g => (
              <TableRow key={g.groupid}>
                <TableCell className="font-mono">{g.groupid}</TableCell>
                <TableCell>{g.comment ?? '-'}</TableCell>
                <TableCell className="font-mono text-sm">{g.users ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'roles' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role ID</TableHead>
              <TableHead>Special</TableHead>
              <TableHead>Privs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(r => (
              <TableRow key={r.roleid}>
                <TableCell className="font-mono">{r.roleid}</TableCell>
                <TableCell>{r.special ? <Badge variant="secondary">built-in</Badge> : '-'}</TableCell>
                <TableCell className="max-w-sm truncate text-sm font-mono">{r.privs ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

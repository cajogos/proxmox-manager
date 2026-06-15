import { useEffect, useState } from 'react';
import {
  getAccessUsers, getAccessGroups, getAccessRoles,
  deleteAccessUser, deleteAccessGroup,
  type AccessUser, type AccessGroup, type AccessRole,
} from '@/api/client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreateUserDialog from '@/components/CreateUserDialog';
import CreateGroupDialog from '@/components/CreateGroupDialog';
import CreateTokenDialog from '@/components/CreateTokenDialog';

type Tab = 'users' | 'groups' | 'roles';

export default function Access() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [tokenTarget, setTokenTarget] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'group'; id: string } | null>(null);

  async function fetchAll() {
    setLoading(true); setError(null);
    const [u, g, r] = await Promise.all([getAccessUsers(), getAccessGroups(), getAccessRoles()]);
    setLoading(false);
    if (!u.ok) { setError(u.error); return; }
    if (!g.ok) { setError(g.error); return; }
    if (!r.ok) { setError(r.error); return; }
    setUsers(u.data);
    setGroups(g.data);
    setRoles(r.data);
  }

  useEffect(() => { void fetchAll(); }, []);

  async function handleDelete() {
    if (!confirmDelete) return;
    const result = confirmDelete.type === 'user'
      ? await deleteAccessUser(confirmDelete.id)
      : await deleteAccessGroup(confirmDelete.id);
    if (!result.ok) { setError(result.error); return; }
    setConfirmDelete(null);
    void fetchAll();
  }

  if (loading) return <p className="text-muted-foreground">Loading access data…</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'users', label: 'Users', count: users.length },
    { key: 'groups', label: 'Groups', count: groups.length },
    { key: 'roles', label: 'Roles', count: roles.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Access</h2>
          <p className="text-sm text-muted-foreground">Users, groups, and roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchAll()}>Refresh</Button>
          {tab === 'users' && <Button size="sm" onClick={() => setShowCreateUser(true)}>Create User</Button>}
          {tab === 'groups' && <Button size="sm" onClick={() => setShowCreateGroup(true)}>Create Group</Button>}
        </div>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Expire</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...users].sort((a, b) => a.userid.localeCompare(b.userid)).map(u => (
              <TableRow key={u.userid}>
                <TableCell className="font-mono">{u.userid}</TableCell>
                <TableCell>{[u.firstname, u.lastname].filter(Boolean).join(' ') || '-'}</TableCell>
                <TableCell>{u.comment ?? '-'}</TableCell>
                <TableCell>{u.enable !== 0 ? <Badge variant="success">yes</Badge> : <Badge variant="secondary">no</Badge>}</TableCell>
                <TableCell className="font-mono text-sm">{u.groups ?? '-'}</TableCell>
                <TableCell>{u.expire ? new Date(u.expire * 1000).toLocaleDateString() : 'never'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setTokenTarget(u.userid)}>Token</Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete({ type: 'user', id: u.userid })}>Delete</Button>
                  </div>
                </TableCell>
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
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...groups].sort((a, b) => a.groupid.localeCompare(b.groupid)).map(g => (
              <TableRow key={g.groupid}>
                <TableCell className="font-mono">{g.groupid}</TableCell>
                <TableCell>{g.comment ?? '-'}</TableCell>
                <TableCell className="font-mono text-sm">{g.users ?? '-'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDelete({ type: 'group', id: g.groupid })}>Delete</Button>
                </TableCell>
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
            {[...roles].sort((a, b) => a.roleid.localeCompare(b.roleid)).map(r => (
              <TableRow key={r.roleid}>
                <TableCell className="font-mono">{r.roleid}</TableCell>
                <TableCell>{r.special ? <Badge variant="secondary">built-in</Badge> : '-'}</TableCell>
                <TableCell className="max-w-sm truncate text-sm font-mono">{r.privs ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateUserDialog open={showCreateUser} onClose={() => setShowCreateUser(false)} onSuccess={() => { setShowCreateUser(false); void fetchAll(); }} />
      <CreateGroupDialog open={showCreateGroup} onClose={() => setShowCreateGroup(false)} onSuccess={() => { setShowCreateGroup(false); void fetchAll(); }} />
      {tokenTarget && (
        <CreateTokenDialog open={true} userid={tokenTarget} onClose={() => setTokenTarget(null)} onSuccess={() => setTokenTarget(null)} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">Confirm Delete</h2>
            <p className="text-sm">Delete {confirmDelete.type} <span className="font-mono font-medium">{confirmDelete.id}</span>?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

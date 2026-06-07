import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'VMs', end: true },
  { to: '/lxc', label: 'LXC', end: false },
  { to: '/nodes', label: 'Nodes', end: false },
  { to: '/storage', label: 'Storage', end: false },
  { to: '/cluster', label: 'Cluster', end: false },
  { to: '/network', label: 'Network', end: false },
  { to: '/access', label: 'Access', end: false },
  { to: '/backup', label: 'Backup', end: false },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <nav className="flex w-52 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar p-5">
        <span className="mb-4 text-base font-bold text-sidebar-foreground">Proxmox Manager</span>
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

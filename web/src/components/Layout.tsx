import { NavLink, Outlet } from 'react-router-dom';

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 180,
  minHeight: '100vh',
  background: '#1a1a2e',
  padding: '24px 16px',
  gap: 8,
  flexShrink: 0,
};

const linkStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  color: '#ccc',
  textDecoration: 'none',
  fontSize: 14,
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: '#16213e',
  color: '#e2e8f0',
  fontWeight: 600,
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: 32,
  fontFamily: 'monospace',
  color: '#e2e8f0',
  background: '#0f0f23',
  minHeight: '100vh',
};

export default function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <nav style={navStyle}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 24, fontSize: 16 }}>
          Proxmox Manager
        </div>
        <NavLink to="/" end style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>VMs</NavLink>
        <NavLink to="/lxc" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>LXC</NavLink>
        <NavLink to="/nodes" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Nodes</NavLink>
        <NavLink to="/storage" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Storage</NavLink>
      </nav>
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}

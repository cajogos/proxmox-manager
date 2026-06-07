import { useEffect, useState } from 'react';
import { getLXC, lxcAction, type LXCInfo } from '../api/client';

function statusColor(s: string): string {
  if (s === 'running') return '#68d391';
  if (s === 'stopped') return '#fc8181';
  return '#e2e8f0';
}

function humanMB(mb?: number): string {
  if (!mb) return '-';
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

export default function LXC() {
  const [containers, setContainers] = useState<LXCInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await getLXC();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setContainers(result.data);
  }

  useEffect(() => { void load(); }, []);

  async function handleAction(ctid: number, action: string) {
    await lxcAction(ctid, action);
    void load();
  }

  if (loading) return <p>Loading containers…</p>;
  if (error) return <p style={{ color: '#fc8181' }}>Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>LXC Containers</h2>
      <p style={{ color: '#718096', fontSize: 13 }}>{containers.length} container(s)</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2d3748', color: '#718096', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>CTID</th>
            <th style={{ padding: '8px 12px' }}>Name</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Node</th>
            <th style={{ padding: '8px 12px' }}>CPUs</th>
            <th style={{ padding: '8px 12px' }}>Memory</th>
            <th style={{ padding: '8px 12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {containers.map(ct => (
            <tr key={ct.vmid} style={{ borderBottom: '1px solid #2d3748' }}>
              <td style={{ padding: '8px 12px' }}>{ct.vmid}</td>
              <td style={{ padding: '8px 12px' }}>{ct.name ?? '-'}</td>
              <td style={{ padding: '8px 12px', color: statusColor(ct.status) }}>{ct.status}</td>
              <td style={{ padding: '8px 12px' }}>{ct.node}</td>
              <td style={{ padding: '8px 12px' }}>{ct.cpus ?? '-'}</td>
              <td style={{ padding: '8px 12px' }}>{humanMB(ct.maxmem != null ? ct.maxmem / (1024 * 1024) : undefined)}</td>
              <td style={{ padding: '8px 12px', display: 'flex', gap: 6 }}>
                {ct.status === 'stopped' && (
                  <button onClick={() => handleAction(ct.vmid, 'start')} style={btnStyle('#276749')}>Start</button>
                )}
                {ct.status === 'running' && (
                  <>
                    <button onClick={() => handleAction(ct.vmid, 'shutdown')} style={btnStyle('#744210')}>Shutdown</button>
                    <button onClick={() => handleAction(ct.vmid, 'stop')} style={btnStyle('#742a2a')}>Stop</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#e2e8f0',
    border: 'none',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12,
  };
}

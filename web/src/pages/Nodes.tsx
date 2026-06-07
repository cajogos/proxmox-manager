import { useEffect, useState } from 'react';
import { getNodes, type NodeInfo } from '../api/client';

function statusColor(s: string): string {
  if (s === 'online') return '#68d391';
  if (s === 'offline') return '#fc8181';
  return '#e2e8f0';
}

function humanSeconds(s?: number): string {
  if (!s) return '-';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Nodes() {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getNodes();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setNodes(result.data);
    })();
  }, []);

  if (loading) return <p>Loading nodes…</p>;
  if (error) return <p style={{ color: '#fc8181' }}>Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nodes</h2>
      <p style={{ color: '#718096', fontSize: 13 }}>{nodes.length} node(s)</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2d3748', color: '#718096', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Node</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>CPU</th>
            <th style={{ padding: '8px 12px' }}>Memory</th>
            <th style={{ padding: '8px 12px' }}>Uptime</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map(n => (
            <tr key={n.node} style={{ borderBottom: '1px solid #2d3748' }}>
              <td style={{ padding: '8px 12px' }}>{n.node}</td>
              <td style={{ padding: '8px 12px', color: statusColor(n.status) }}>{n.status}</td>
              <td style={{ padding: '8px 12px' }}>{n.cpu != null ? `${(n.cpu * 100).toFixed(1)}%` : '-'}</td>
              <td style={{ padding: '8px 12px' }}>
                {n.mem != null && n.maxmem != null
                  ? `${(n.mem / (1024 ** 3)).toFixed(1)} / ${(n.maxmem / (1024 ** 3)).toFixed(1)} GB`
                  : '-'}
              </td>
              <td style={{ padding: '8px 12px' }}>{humanSeconds(n.uptime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getStorage, type StorageInfo } from '../api/client';

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

  useEffect(() => {
    void (async () => {
      const result = await getStorage();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setPools(result.data);
    })();
  }, []);

  if (loading) return <p>Loading storage…</p>;
  if (error) return <p style={{ color: '#fc8181' }}>Error: {error}</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Storage</h2>
      <p style={{ color: '#718096', fontSize: 13 }}>{pools.length} pool(s)</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2d3748', color: '#718096', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Storage</th>
            <th style={{ padding: '8px 12px' }}>Type</th>
            <th style={{ padding: '8px 12px' }}>Total</th>
            <th style={{ padding: '8px 12px' }}>Used</th>
            <th style={{ padding: '8px 12px' }}>Available</th>
            <th style={{ padding: '8px 12px' }}>Active</th>
          </tr>
        </thead>
        <tbody>
          {pools.map(p => (
            <tr key={p.storage} style={{ borderBottom: '1px solid #2d3748' }}>
              <td style={{ padding: '8px 12px' }}>{p.storage}</td>
              <td style={{ padding: '8px 12px' }}>{p.type}</td>
              <td style={{ padding: '8px 12px' }}>{humanBytes(p.total)}</td>
              <td style={{ padding: '8px 12px' }}>{humanBytes(p.used)}</td>
              <td style={{ padding: '8px 12px' }}>{humanBytes(p.avail)}</td>
              <td style={{ padding: '8px 12px', color: p.active ? '#68d391' : '#fc8181' }}>
                {p.active ? 'yes' : 'no'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

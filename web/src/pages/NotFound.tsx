import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>404 — Not Found</h2>
      <p><Link to="/" style={{ color: '#63b3ed' }}>Go to VMs</Link></p>
    </div>
  );
}

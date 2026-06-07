import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import VMs from './pages/VMs';
import LXC from './pages/LXC';
import Nodes from './pages/Nodes';
import Storage from './pages/Storage';
import Cluster from './pages/Cluster';
import Network from './pages/Network';
import Access from './pages/Access';
import Backup from './pages/Backup';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<VMs />} />
        <Route path="lxc" element={<LXC />} />
        <Route path="nodes" element={<Nodes />} />
        <Route path="storage" element={<Storage />} />
        <Route path="cluster" element={<Cluster />} />
        <Route path="network" element={<Network />} />
        <Route path="access" element={<Access />} />
        <Route path="backup" element={<Backup />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

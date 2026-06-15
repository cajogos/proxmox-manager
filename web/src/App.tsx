import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import VMs from './pages/VMs';
import VMDetail from './pages/VMDetail';
import LXC from './pages/LXC';
import LXCDetail from './pages/LXCDetail';
import Nodes from './pages/Nodes';
import NodeDetail from './pages/NodeDetail';
import Storage from './pages/Storage';
import Cluster from './pages/Cluster';
import Network from './pages/Network';
import Access from './pages/Access';
import Backup from './pages/Backup';
import Firewall from './pages/Firewall';
import SDN from './pages/SDN';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<VMs />} />
        <Route path="vms/:vmid" element={<VMDetail />} />
        <Route path="lxc" element={<LXC />} />
        <Route path="lxc/:ctid" element={<LXCDetail />} />
        <Route path="nodes" element={<Nodes />} />
        <Route path="nodes/:node" element={<NodeDetail />} />
        <Route path="storage" element={<Storage />} />
        <Route path="cluster" element={<Cluster />} />
        <Route path="network" element={<Network />} />
        <Route path="access" element={<Access />} />
        <Route path="backup" element={<Backup />} />
        <Route path="firewall" element={<Firewall />} />
        <Route path="sdn" element={<SDN />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import VMs from './pages/VMs';
import LXC from './pages/LXC';
import Nodes from './pages/Nodes';
import Storage from './pages/Storage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<VMs />} />
        <Route path="lxc" element={<LXC />} />
        <Route path="nodes" element={<Nodes />} />
        <Route path="storage" element={<Storage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

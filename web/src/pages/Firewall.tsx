import { useEffect, useState } from 'react';
import {
  getVMs, getLXC,
  getClusterFirewallRules, createClusterFirewallRule, deleteClusterFirewallRule,
  getVMFirewallRules, createVMFirewallRule, deleteVMFirewallRule,
  getLXCFirewallRules, createLXCFirewallRule, deleteLXCFirewallRule,
  type FirewallRule, type CreateFirewallRuleParams, type VMInfo, type LXCInfo,
} from '@/api/client';
import { Button } from '@/components/ui/button';

const inputCls = 'border border-border rounded px-2 py-1 w-full text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const labelCls = 'block text-sm font-medium mb-1';

const TABS = ['Cluster', 'VM Rules', 'LXC Rules'] as const;
type Tab = typeof TABS[number];

interface RuleFormState {
  type: 'in' | 'out';
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  source: string;
  dest: string;
  proto: string;
  dport: string;
  comment: string;
  enable: boolean;
}

function emptyForm(): RuleFormState {
  return { type: 'in', action: 'ACCEPT', source: '', dest: '', proto: '', dport: '', comment: '', enable: true };
}

function RulesTable({ rules, onDelete }: { rules: FirewallRule[]; onDelete: (pos: number) => void }) {
  if (rules.length === 0) return <p className="text-sm text-muted-foreground">No rules.</p>;
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-muted-foreground border-b border-border text-xs">
          <th className="pb-2 pr-3">#</th>
          <th className="pb-2 pr-3">Type</th>
          <th className="pb-2 pr-3">Action</th>
          <th className="pb-2 pr-3">Source</th>
          <th className="pb-2 pr-3">Dest</th>
          <th className="pb-2 pr-3">Proto</th>
          <th className="pb-2 pr-3">Port</th>
          <th className="pb-2 pr-3">Comment</th>
          <th className="pb-2"></th>
        </tr>
      </thead>
      <tbody>
        {rules.map(r => (
          <tr key={r.pos} className="border-b border-border last:border-0">
            <td className="py-1.5 pr-3 font-mono text-muted-foreground">{r.pos}</td>
            <td className="py-1.5 pr-3 uppercase text-xs">{r.type}</td>
            <td className="py-1.5 pr-3">
              <span className={`text-xs font-medium ${r.action === 'ACCEPT' ? 'text-green-600' : r.action === 'DROP' ? 'text-red-600' : 'text-yellow-600'}`}>{r.action}</span>
            </td>
            <td className="py-1.5 pr-3 font-mono text-xs">{r.source ?? '-'}</td>
            <td className="py-1.5 pr-3 font-mono text-xs">{r.dest ?? '-'}</td>
            <td className="py-1.5 pr-3 text-xs">{r.proto ?? '-'}</td>
            <td className="py-1.5 pr-3 text-xs">{r.dport ?? '-'}</td>
            <td className="py-1.5 pr-3 text-muted-foreground text-xs">{r.comment ?? ''}</td>
            <td className="py-1.5">
              <Button size="sm" variant="destructive" onClick={() => onDelete(r.pos)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CreateRuleForm({ onSubmit, loading }: { onSubmit: (p: CreateFirewallRuleParams) => void; loading: boolean }) {
  const [form, setForm] = useState<RuleFormState>(emptyForm());
  function set<K extends keyof RuleFormState>(k: K, v: RuleFormState[K]) { setForm(f => ({ ...f, [k]: v })); }
  return (
    <div className="border border-border rounded p-4 space-y-3">
      <h3 className="text-sm font-semibold">Add Rule</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Direction</label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as 'in' | 'out')}>
            <option value="in">IN</option><option value="out">OUT</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Action</label>
          <select className={inputCls} value={form.action} onChange={e => set('action', e.target.value as 'ACCEPT' | 'DROP' | 'REJECT')}>
            <option>ACCEPT</option><option>DROP</option><option>REJECT</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Protocol</label>
          <input className={inputCls} value={form.proto} onChange={e => set('proto', e.target.value)} placeholder="tcp / udp" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Source</label>
          <input className={inputCls} value={form.source} onChange={e => set('source', e.target.value)} placeholder="0.0.0.0/0" />
        </div>
        <div>
          <label className={labelCls}>Destination</label>
          <input className={inputCls} value={form.dest} onChange={e => set('dest', e.target.value)} placeholder="" />
        </div>
        <div>
          <label className={labelCls}>Dest Port</label>
          <input className={inputCls} value={form.dport} onChange={e => set('dport', e.target.value)} placeholder="80,443" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Comment</label>
          <input className={inputCls} value={form.comment} onChange={e => set('comment', e.target.value)} />
        </div>
        <div className="flex items-end pb-1">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fw-enable" checked={form.enable} onChange={e => set('enable', e.target.checked)} />
            <label htmlFor="fw-enable" className="text-sm">Enabled</label>
          </div>
        </div>
      </div>
      <Button size="sm" disabled={loading} onClick={() => onSubmit({
        type: form.type, action: form.action,
        source: form.source || undefined, dest: form.dest || undefined,
        proto: form.proto || undefined, dport: form.dport || undefined,
        comment: form.comment || undefined, enable: form.enable,
      })}>
        {loading ? 'Adding…' : 'Add Rule'}
      </Button>
    </div>
  );
}

export default function Firewall() {
  const [tab, setTab] = useState<Tab>('Cluster');
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [vms, setVMs] = useState<VMInfo[]>([]);
  const [lxcs, setLXCs] = useState<LXCInfo[]>([]);
  const [selectedVM, setSelectedVM] = useState<number | null>(null);
  const [selectedLXC, setSelectedLXC] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRules() {
    setLoading(true); setError(null);
    let result;
    if (tab === 'Cluster') result = await getClusterFirewallRules();
    else if (tab === 'VM Rules' && selectedVM) result = await getVMFirewallRules(selectedVM);
    else if (tab === 'LXC Rules' && selectedLXC) result = await getLXCFirewallRules(selectedLXC);
    else { setRules([]); setLoading(false); return; }
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setRules(result.data);
  }

  // Compute tab-scoped keys so selectedVM/selectedLXC changes don't re-fetch when irrelevant to the active tab
  const vmTabKey = tab === 'VM Rules' ? selectedVM : null;
  const lxcTabKey = tab === 'LXC Rules' ? selectedLXC : null;

  useEffect(() => { void loadRules(); }, [tab, vmTabKey, lxcTabKey]);

  useEffect(() => {
    void getVMs().then(r => { if (r.ok) { setVMs(r.data); if (r.data.length > 0 && !selectedVM) setSelectedVM(r.data[0].vmid); } });
    void getLXC().then(r => { if (r.ok) { setLXCs(r.data); if (r.data.length > 0 && !selectedLXC) setSelectedLXC(r.data[0].vmid); } });
  }, []);

  async function handleDelete(pos: number) {
    if (tab === 'Cluster') await deleteClusterFirewallRule(pos);
    else if (tab === 'VM Rules' && selectedVM) await deleteVMFirewallRule(selectedVM, pos);
    else if (tab === 'LXC Rules' && selectedLXC) await deleteLXCFirewallRule(selectedLXC, pos);
    void loadRules();
  }

  async function handleCreate(params: CreateFirewallRuleParams) {
    setAdding(true);
    let result;
    if (tab === 'Cluster') result = await createClusterFirewallRule(params);
    else if (tab === 'VM Rules' && selectedVM) result = await createVMFirewallRule(selectedVM, params);
    else if (tab === 'LXC Rules' && selectedLXC) result = await createLXCFirewallRule(selectedLXC, params);
    else { setAdding(false); return; }
    setAdding(false);
    if (!result.ok) { setError(result.error); return; }
    void loadRules();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Firewall</h2>

      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >{t}</button>
        ))}
      </div>

      {tab === 'VM Rules' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">VM:</span>
          <select className="border border-border rounded px-2 py-1 text-sm bg-background" value={selectedVM ?? ''} onChange={e => setSelectedVM(Number(e.target.value))}>
            {vms.map(v => <option key={v.vmid} value={v.vmid}>{v.vmid} — {v.name ?? 'unnamed'}</option>)}
          </select>
        </div>
      )}

      {tab === 'LXC Rules' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Container:</span>
          <select className="border border-border rounded px-2 py-1 text-sm bg-background" value={selectedLXC ?? ''} onChange={e => setSelectedLXC(Number(e.target.value))}>
            {lxcs.map(c => <option key={c.vmid} value={c.vmid}>{c.vmid} — {c.name ?? 'unnamed'}</option>)}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <CreateRuleForm onSubmit={handleCreate} loading={adding} />

      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <RulesTable rules={rules} onDelete={handleDelete} />
      )}
    </div>
  );
}

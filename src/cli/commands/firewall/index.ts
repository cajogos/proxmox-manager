import { Command } from 'commander';
import { OutputFormat } from '../../../output/formatter';
import { output } from '../../../output/formatter';
import { startSpinner } from '../../../output/spinner';
import { successMsg, errorMsg, dryRunMsg } from '../../../output/colors';
import { confirmAction } from '../../../safeguards/confirm';
import { checkDryRun } from '../../../safeguards/dryRun';
import { loadConfig, resolveProfile } from '../../../config/loader';
import { configureAuditLog, audit } from '../../../audit/logger';
import {
  listClusterFirewallRulesService,
  createClusterFirewallRuleService,
  deleteClusterFirewallRuleService,
  listVMFirewallRulesService,
  createVMFirewallRuleService,
  deleteVMFirewallRuleService,
  listLXCFirewallRulesService,
  createLXCFirewallRuleService,
  deleteLXCFirewallRuleService,
  FirewallRule,
} from '../../../services/firewall';

function formatRules(rules: FirewallRule[], format: OutputFormat): void {
  const rows = rules.map(r => ({
    Pos: r.pos,
    Type: r.type,
    Action: r.action,
    Enabled: r.enable === 1 ? 'yes' : 'no',
    Macro: r.macro ?? '-',
    Source: r.source ?? '-',
    Dest: r.dest ?? '-',
    Proto: r.proto ?? '-',
    DPort: r.dport ?? '-',
    Comment: r.comment ?? '-',
  }));
  output(rows, format, {
    colAligns: ['right', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'],
    summary: `${rules.length} rule${rules.length !== 1 ? 's' : ''}`,
  });
}

export function registerFirewallCommands(program: Command): void {
  const fw = program.command('firewall').description('Manage Proxmox firewall rules');

  // --- cluster ---
  const cluster = fw.command('cluster').description('Cluster-level firewall rules');

  cluster
    .command('list')
    .description('List cluster firewall rules')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner('Fetching cluster firewall rules…');
      const result = await listClusterFirewallRulesService(config, { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      formatRules(result.data, globals.format as OutputFormat);
    });

  cluster
    .command('create')
    .description('Add a cluster firewall rule')
    .requiredOption('--action <ACCEPT|DROP|REJECT>', 'Rule action')
    .requiredOption('--type <in|out>', 'Traffic direction')
    .option('--source <addr>', 'Source address/CIDR')
    .option('--dest <addr>', 'Destination address/CIDR')
    .option('--proto <proto>', 'Protocol (tcp/udp/icmp/…)')
    .option('--dport <port>', 'Destination port or range')
    .option('--sport <port>', 'Source port or range')
    .option('--macro <name>', 'Proxmox firewall macro')
    .option('--comment <text>', 'Rule comment')
    .option('--enable', 'Enable rule immediately')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean }>();
      const o = cmd.opts<{
        action: string; type: string; source?: string; dest?: string;
        proto?: string; dport?: string; sport?: string; macro?: string;
        comment?: string; enable?: boolean;
      }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall cluster create', resource: { type: 'firewall' }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'create cluster firewall rule', `${o.type} ${o.action}`)) {
        console.log(dryRunMsg(`Would add cluster ${o.type} ${o.action} rule.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      const spinner = startSpinner('Creating firewall rule…');
      const result = await createClusterFirewallRuleService(config, {
        action: o.action as 'ACCEPT' | 'DROP' | 'REJECT',
        type: o.type as 'in' | 'out' | 'group',
        source: o.source, dest: o.dest, proto: o.proto, dport: o.dport, sport: o.sport,
        macro: o.macro, comment: o.comment, enable: o.enable,
      }, { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg('Cluster firewall rule created.'));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });

  cluster
    .command('delete <pos>')
    .description('Delete a cluster firewall rule by position')
    .action(async (pos: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall cluster delete', resource: { type: 'firewall', id: pos }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'delete cluster firewall rule', pos)) {
        console.log(dryRunMsg(`Would delete cluster firewall rule at position ${pos}.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      if (!(await confirmAction('Delete cluster firewall rule', `position ${pos}`, !!globals.yes))) {
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
        return;
      }
      const spinner = startSpinner(`Deleting rule at position ${pos}…`);
      const result = await deleteClusterFirewallRuleService(config, Number(pos), { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg(`Cluster firewall rule at position ${pos} deleted.`));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });

  // --- vm ---
  const vm = fw.command('vm').description('VM firewall rules');

  vm
    .command('list <vmid>')
    .description('List firewall rules for a VM')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner(`Fetching firewall rules for VM ${vmid}…`);
      const result = await listVMFirewallRulesService(config, Number(vmid), { profile: globals.profile, node: cmd.opts().node });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      formatRules(result.data, globals.format as OutputFormat);
    });

  vm
    .command('create <vmid>')
    .description('Add a firewall rule to a VM')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .requiredOption('--action <ACCEPT|DROP|REJECT>', 'Rule action')
    .requiredOption('--type <in|out>', 'Traffic direction')
    .option('--source <addr>', 'Source')
    .option('--dest <addr>', 'Destination')
    .option('--proto <proto>', 'Protocol')
    .option('--dport <port>', 'Destination port')
    .option('--sport <port>', 'Source port')
    .option('--macro <name>', 'Proxmox macro')
    .option('--comment <text>', 'Comment')
    .option('--enable', 'Enable rule immediately')
    .action(async (vmid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean }>();
      const o = cmd.opts<{
        node?: string; action: string; type: string; source?: string; dest?: string;
        proto?: string; dport?: string; sport?: string; macro?: string; comment?: string; enable?: boolean;
      }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall vm create', resource: { type: 'vm', id: vmid }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'create VM firewall rule', vmid)) {
        console.log(dryRunMsg(`Would add ${o.type} ${o.action} rule to VM ${vmid}.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      const spinner = startSpinner(`Creating firewall rule on VM ${vmid}…`);
      const result = await createVMFirewallRuleService(config, Number(vmid), {
        action: o.action as 'ACCEPT' | 'DROP' | 'REJECT',
        type: o.type as 'in' | 'out' | 'group',
        source: o.source, dest: o.dest, proto: o.proto, dport: o.dport, sport: o.sport,
        macro: o.macro, comment: o.comment, enable: o.enable,
      }, { profile: globals.profile, node: o.node });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg(`Firewall rule added to VM ${vmid}.`));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });

  vm
    .command('delete <vmid> <pos>')
    .description('Delete a VM firewall rule by position')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .action(async (vmid: string, pos: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall vm delete', resource: { type: 'vm', id: vmid }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'delete VM firewall rule', `VM ${vmid} pos ${pos}`)) {
        console.log(dryRunMsg(`Would delete VM ${vmid} firewall rule at position ${pos}.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      if (!(await confirmAction('Delete VM firewall rule', `VM ${vmid} position ${pos}`, !!globals.yes))) {
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
        return;
      }
      const spinner = startSpinner(`Deleting firewall rule on VM ${vmid}…`);
      const result = await deleteVMFirewallRuleService(config, Number(vmid), Number(pos), { profile: globals.profile, node: cmd.opts().node });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg(`VM ${vmid} firewall rule at position ${pos} deleted.`));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });

  // --- lxc ---
  const lxc = fw.command('lxc').description('LXC firewall rules');

  lxc
    .command('list <ctid>')
    .description('List firewall rules for a container')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner(`Fetching firewall rules for container ${ctid}…`);
      const result = await listLXCFirewallRulesService(config, Number(ctid), { profile: globals.profile, node: cmd.opts().node });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      formatRules(result.data, globals.format as OutputFormat);
    });

  lxc
    .command('create <ctid>')
    .description('Add a firewall rule to a container')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .requiredOption('--action <ACCEPT|DROP|REJECT>', 'Rule action')
    .requiredOption('--type <in|out>', 'Traffic direction')
    .option('--source <addr>', 'Source')
    .option('--dest <addr>', 'Destination')
    .option('--proto <proto>', 'Protocol')
    .option('--dport <port>', 'Destination port')
    .option('--sport <port>', 'Source port')
    .option('--macro <name>', 'Proxmox macro')
    .option('--comment <text>', 'Comment')
    .option('--enable', 'Enable rule immediately')
    .action(async (ctid: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean }>();
      const o = cmd.opts<{
        node?: string; action: string; type: string; source?: string; dest?: string;
        proto?: string; dport?: string; sport?: string; macro?: string; comment?: string; enable?: boolean;
      }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall lxc create', resource: { type: 'lxc', id: ctid }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'create LXC firewall rule', ctid)) {
        console.log(dryRunMsg(`Would add ${o.type} ${o.action} rule to container ${ctid}.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      const spinner = startSpinner(`Creating firewall rule on container ${ctid}…`);
      const result = await createLXCFirewallRuleService(config, Number(ctid), {
        action: o.action as 'ACCEPT' | 'DROP' | 'REJECT',
        type: o.type as 'in' | 'out' | 'group',
        source: o.source, dest: o.dest, proto: o.proto, dport: o.dport, sport: o.sport,
        macro: o.macro, comment: o.comment, enable: o.enable,
      }, { profile: globals.profile, node: o.node });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg(`Firewall rule added to container ${ctid}.`));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });

  lxc
    .command('delete <ctid> <pos>')
    .description('Delete a container firewall rule by position')
    .option('--node <name>', 'Node (auto-discovered if omitted)')
    .action(async (ctid: string, pos: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; dryRun?: boolean; yes?: boolean }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const { name: profileName } = resolveProfile(config, globals.profile);
      const auditBase = { profile: profileName, command: 'firewall lxc delete', resource: { type: 'lxc', id: ctid }, dryRun: !!globals.dryRun, source: 'cli' as const };
      if (checkDryRun(!!globals.dryRun, 'delete LXC firewall rule', `container ${ctid} pos ${pos}`)) {
        console.log(dryRunMsg(`Would delete container ${ctid} firewall rule at position ${pos}.`));
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'dry-run', error: null });
        return;
      }
      if (!(await confirmAction('Delete LXC firewall rule', `container ${ctid} position ${pos}`, !!globals.yes))) {
        audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'cancelled', error: null });
        return;
      }
      const spinner = startSpinner(`Deleting firewall rule on container ${ctid}…`);
      const result = await deleteLXCFirewallRuleService(config, Number(ctid), Number(pos), { profile: globals.profile, node: cmd.opts().node });
      spinner.stop();
      if (!result.ok) { audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error }); console.error(errorMsg(result.error)); process.exit(1); }
      console.log(successMsg(`Container ${ctid} firewall rule at position ${pos} deleted.`));
      audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
    });
}

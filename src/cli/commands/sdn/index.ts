import { Command } from 'commander';
import { OutputFormat, output } from '../../../output/formatter';
import { startSpinner } from '../../../output/spinner';
import { errorMsg } from '../../../output/colors';
import { loadConfig } from '../../../config/loader';
import { configureAuditLog } from '../../../audit/logger';
import {
  listSDNZonesService,
  listSDNVNetsService,
  listSDNSubnetsService,
} from '../../../services/sdn';

export function registerSDNCommands(program: Command): void {
  const sdn = program.command('sdn').description('View Software-Defined Networking (SDN) resources');

  sdn
    .command('zones')
    .description('List SDN zones')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner('Fetching SDN zones…');
      const result = await listSDNZonesService(config, { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      const rows = result.data.map(z => ({
        Zone: z.zone,
        Type: z.type,
        Bridge: z.bridge ?? '-',
        Nodes: z.nodes ?? '-',
        DNS: z.dns ?? '-',
        State: z.state ?? '-',
      }));
      output(rows, globals.format as OutputFormat, { summary: `${result.data.length} zone${result.data.length !== 1 ? 's' : ''}` });
    });

  sdn
    .command('vnets')
    .description('List SDN VNets')
    .action(async (_opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner('Fetching SDN VNets…');
      const result = await listSDNVNetsService(config, { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      const rows = result.data.map(v => ({
        VNet: v.vnet,
        Zone: v.zone,
        Alias: v.alias ?? '-',
        Tag: v.tag ?? '-',
        State: v.state ?? '-',
      }));
      output(rows, globals.format as OutputFormat, { summary: `${result.data.length} VNet${result.data.length !== 1 ? 's' : ''}` });
    });

  sdn
    .command('subnets <vnet>')
    .description('List subnets within a VNet')
    .action(async (vnet: string, _opts, cmd: Command) => {
      const globals = cmd.optsWithGlobals<{ profile?: string; format: string }>();
      const config = loadConfig();
      configureAuditLog(config.auditLog.path);
      const spinner = startSpinner(`Fetching subnets for VNet ${vnet}…`);
      const result = await listSDNSubnetsService(config, vnet, { profile: globals.profile });
      spinner.stop();
      if (!result.ok) { console.error(errorMsg(result.error)); process.exit(1); }
      const rows = result.data.map(s => ({
        Subnet: s.subnet,
        CIDR: s.cidr ?? '-',
        Gateway: s.gateway ?? '-',
        SNAT: s.snat ? 'yes' : 'no',
        DNSZonePrefix: s.dnszoneprefix ?? '-',
      }));
      output(rows, globals.format as OutputFormat, { summary: `${result.data.length} subnet${result.data.length !== 1 ? 's' : ''}` });
    });
}

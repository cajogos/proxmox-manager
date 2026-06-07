import { Router, Request, Response } from 'express';
import { Config } from '../config/types';
import { resolveProfile } from '../config/loader';
import { ProxmoxClient } from '../api/client';

interface TaskStatus {
  upid: string;
  node: string;
  type: string;
  status: string;
  exitstatus?: string;
  starttime?: number;
  endtime?: number;
  pid?: number;
}

function parseUpidNode(upid: string): string {
  // UPID:{node}:{pid}:{pstart}:{starttime}:{type}:{id}:{user}:
  const parts = upid.split(':');
  if (parts.length < 2 || parts[1] === undefined) {
    throw new Error(`Cannot parse node from UPID: ${upid}`);
  }
  return parts[1];
}

export function sseRouter(config: Config): Router {
  const router = Router();

  router.get('/tasks/:upid/stream', async (req: Request, res: Response) => {
    const upid = decodeURIComponent(req.params['upid'] as string);

    let node: string;
    try {
      node = parseUpidNode(upid);
    } catch (e) {
      res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event: string, data: unknown): void => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    let { profile } = resolveProfile(config, req.profileName);
    const client = new ProxmoxClient(profile);

    const interval = setInterval(async () => {
      try {
        const status = await client.get<TaskStatus>(`/nodes/${node}/tasks/${encodeURIComponent(upid)}/status`);
        send('status', status);

        if (status.status === 'stopped') {
          send('done', { upid, exitstatus: status.exitstatus });
          clearInterval(interval);
          res.end();
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        send('error', { error });
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  return router;
}

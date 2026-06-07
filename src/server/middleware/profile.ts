import { Request, Response, NextFunction } from 'express';
import { Config } from '../../config/types';
import { resolveProfile } from '../../config/loader';

declare global {
  namespace Express {
    interface Request {
      profileName: string;
    }
  }
}

export function profileMiddleware(config: Config) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const raw = (req.query.profile as string | undefined) ?? req.headers['x-profile'] as string | undefined;
    try {
      req.profileName = resolveProfile(config, raw).name;
    } catch {
      req.profileName = config.defaultProfile ?? '';
    }
    next();
  };
}

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err.message);
  const status = (err as { status?: number }).status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

import { Router, Request, Response } from 'express';
import { statementsService } from '../services/statements.service';

const router = Router();

// GET /api/statements/trial-balance
router.get('/trial-balance', async (_req: Request, res: Response) => {
  try {
    const data = await statementsService.getTrialBalance();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trial balance' });
  }
});

// GET /api/statements/trial-balance/refresh
router.get('/trial-balance/refresh', async (_req: Request, res: Response) => {
  try {
    const result = await statementsService.refreshTrialBalance();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh trial balance' });
  }
});

// GET /api/statements/profit-loss?from=DATE&to=DATE
router.get('/profit-loss', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const from = (req.query.from as string) || `${now.getFullYear()}-01-01`;
    const to = (req.query.to as string) || now.toISOString().split('T')[0];
    const data = await statementsService.getProfitAndLoss(from, to);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate P&L' });
  }
});

// GET /api/statements/balance-sheet?as_of=DATE
router.get('/balance-sheet', async (req: Request, res: Response) => {
  try {
    const asOf = (req.query.as_of as string) || new Date().toISOString().split('T')[0];
    const data = await statementsService.getBalanceSheet(asOf);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate balance sheet' });
  }
});

// GET /api/statements/dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const data = await statementsService.getDashboardSummary();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;

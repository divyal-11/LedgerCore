import { Router, Request, Response } from 'express';
import { accountsService } from '../services/accounts.service';

const router = Router();

// GET /api/accounts - List all accounts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const accounts = await accountsService.getAll();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// GET /api/accounts/tree - Full chart of accounts as recursive tree
router.get('/tree', async (_req: Request, res: Response) => {
  try {
    const tree = await accountsService.getTree();
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account tree' });
  }
});

// GET /api/accounts/:id - Single account detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const account = await accountsService.getById(req.params.id);
    if (!account) { res.status(404).json({ error: 'Account not found' }); return; }
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// GET /api/accounts/:id/ledger - Account ledger with running balance
router.get('/:id/ledger', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const ledger = await accountsService.getLedger(
      req.params.id, 
      from as string | undefined, 
      to as string | undefined
    );
    res.json(ledger);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

// GET /api/accounts/:id/balance - Current balance
router.get('/:id/balance', async (req: Request, res: Response) => {
  try {
    const balance = await accountsService.getBalance(req.params.id);
    if (!balance) { res.status(404).json({ error: 'Account not found' }); return; }
    res.json(balance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// POST /api/accounts - Create new account
router.post('/', async (req: Request, res: Response) => {
  try {
    const account = await accountsService.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// DELETE /api/accounts/:id - Deactivate account
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const account = await accountsService.deactivate(req.params.id);
    if (!account) { res.status(404).json({ error: 'Account not found' }); return; }
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

export default router;

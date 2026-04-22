import { Router, Request, Response } from 'express';
import { periodsService } from '../services/periods.service';

const router = Router();

// GET /api/periods
router.get('/', async (_req: Request, res: Response) => {
  try {
    const periods = await periodsService.list();
    res.json(periods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch periods' });
  }
});

// GET /api/periods/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const period = await periodsService.getById(req.params.id);
    if (!period) { res.status(404).json({ error: 'Period not found' }); return; }
    res.json(period);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch period' });
  }
});

// POST /api/periods
router.post('/', async (req: Request, res: Response) => {
  try {
    const period = await periodsService.create(req.body);
    res.status(201).json(period);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create period' });
  }
});

// POST /api/periods/:id/close
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const period = await periodsService.close(req.params.id);
    if (!period) { res.status(404).json({ error: 'Period not found' }); return; }
    res.json(period);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to close period' });
  }
});

// GET /api/periods/:id/summary
router.get('/:id/summary', async (req: Request, res: Response) => {
  try {
    const summary = await periodsService.getSummary(req.params.id);
    if (!summary) { res.status(404).json({ error: 'Period not found' }); return; }
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch period summary' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { journalService } from '../services/journal.service';

const router = Router();

// GET /api/journal - List journal entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const entries = await journalService.list({
      status: req.query.status as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// GET /api/journal/:id - Single entry with lines
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await journalService.getById(req.params.id);
    if (!entry) { res.status(404).json({ error: 'Entry not found' }); return; }
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// POST /api/journal - Create journal entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const entry = await journalService.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    const status = (err as { status?: number }).status || 500;
    res.status(status).json({ error: (err as Error).message });
  }
});

// POST /api/journal/:id/post - Post a DRAFT entry
router.post('/:id/post', async (req: Request, res: Response) => {
  try {
    const entry = await journalService.post(req.params.id);
    res.json(entry);
  } catch (err) {
    const status = (err as { status?: number }).status || 500;
    res.status(status).json({ error: (err as Error).message });
  }
});

// POST /api/journal/:id/void - Void a POSTED entry
router.post('/:id/void', async (req: Request, res: Response) => {
  try {
    const result = await journalService.void(req.params.id);
    res.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status || 500;
    res.status(status).json({ error: (err as Error).message });
  }
});

export default router;

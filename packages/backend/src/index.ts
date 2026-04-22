import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import accountsRoutes from './routes/accounts.routes';
import journalRoutes from './routes/journal.routes';
import statementsRoutes from './routes/statements.routes';
import periodsRoutes from './routes/periods.routes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/accounts', accountsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/statements', statementsRoutes);
app.use('/api/periods', periodsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

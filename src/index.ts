import express from 'express';
import cors from 'cors';
import { getSnapshot, resetUnits } from './state';
import { startSimulation, setDeltaHandler, resetSimulation } from './simulation';
import { DeltaUpdate } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'War Room Control server running' });
});

app.get('/snapshot', (_req, res) => {
  const units = getSnapshot();
  res.json({ count: units.length, units });
});

const sseClients = new Set<express.Response>();

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  console.log(`SSE client connected (total: ${sseClients.size})`);

  req.on('close', () => {
    sseClients.delete(res);
    console.log(`SSE client disconnected (total: ${sseClients.size})`);
  });
});

setDeltaHandler((delta: DeltaUpdate) => {
  const data = `data: ${JSON.stringify(delta)}\n\n`;
  sseClients.forEach(client => client.write(data));
});

app.post('/restart', (_req, res) => {
  resetUnits();
  resetSimulation();
  startSimulation();
  res.json({ ok: true });
  console.log('Battle restarted');
});

app.listen(PORT, () => {
  console.log(`War Room Control server running on port ${PORT}`);
  startSimulation();
});

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ENV } from './config.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ENV.FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: ENV.FRONTEND_ORIGIN }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(ENV.PORT, () => {
  console.log(`🎵 Party Jam backend running on port ${ENV.PORT}`);
  console.log(`   Frontend origin: ${ENV.FRONTEND_ORIGIN}`);
});

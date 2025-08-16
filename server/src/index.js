import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import newsRouter from './routes/news.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ORIGIN = 'http://localhost:5174';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  //cors for socket
  cors: {
    origin: APP_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['websocket', 'polling'],
});

app.set('io', io);
//cors for backend 
app.use(
  cors({
    origin: APP_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb+srv://ppruthviraj254:KNjFoY2LGTveUzYv@cluster0.dgypi.mongodb.net/Aether';

mongoose
  .connect(mongoUri, { autoIndex: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'aether-news-server' });
});

app.use('/api/news', newsRouter);

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

const port = 8001;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

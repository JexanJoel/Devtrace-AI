// DevTrace AI — Express server entry point
// Handles API routes, middleware, and server startup

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---

// Allow requests from the frontend dev server
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Parse incoming JSON bodies
app.use(express.json());

// --- Routes ---

// Health check — confirms server is running
app.get('/health', (_req, res) => {
  res.json({ status: 'DevTrace AI server is running 🚀' });
});

// Auth routes — /api/auth/me, /api/auth/verify
app.use('/api/auth', authRoutes);

// --- Start ---
app.listen(PORT, () => {
  console.log(`✅ DevTrace AI server running at http://localhost:${PORT}`);
});
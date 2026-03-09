// Auth routes — server-side auth utilities
// Client handles most auth via Supabase SDK directly
// Server validates tokens and fetches profiles securely

import { Router, Response } from 'express';
import verifyToken, { AuthRequest } from '../middleware/verifyToken';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// GET /api/auth/me — returns current user's profile
// Requires valid Supabase JWT in Authorization header
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  // Fetch profile from public.profiles table
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ profile: data });
});

// GET /api/auth/verify — simple token verification endpoint
// Useful for frontend to check if session is still valid
router.get('/verify', verifyToken, (req: AuthRequest, res: Response) => {
  return res.json({ valid: true, user: req.user });
});

export default router;
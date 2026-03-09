// verifyToken middleware — validates Supabase JWT on protected routes
// Attach this to any route that requires authentication

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Extend Express Request to carry the verified user
export interface AuthRequest extends Request {
  user?: any;
}

const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract Bearer token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Verify JWT with Supabase
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach user to request for downstream use
  req.user = data.user;
  next();
};

export default verifyToken;
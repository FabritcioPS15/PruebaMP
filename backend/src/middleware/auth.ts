import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-Admin-Key');

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'No autorizado. API Key inválida o faltante.' });
  }

  next();
};

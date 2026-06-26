import { Router, Request, Response } from 'express';
import { supabase } from '../db/client';

const router = Router();

// GET /api/productos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoria } = req.query;

    let query = supabase.from('productos').select('*').eq('activo', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();

    if (error) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

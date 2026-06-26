import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cotizacionesRoutes from './routes/cotizaciones';
import productosRoutes from './routes/productos';
import pagosRoutes from './routes/pagos';
import webhooksRoutes from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000']
}));

// Para los webhooks a veces se necesita raw body, pero express.json() es suficiente si no se valida firma estricta
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

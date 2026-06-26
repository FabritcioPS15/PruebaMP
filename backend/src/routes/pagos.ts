import { Router, Request, Response } from 'express';
import { supabase } from '../db/client';
import { procesarPago } from '../services/mercadopago';
import { requireAdmin } from '../middleware/auth';
import { enviarConfirmacionPago } from '../services/email';

const router = Router();

// POST /api/pagos/crear
router.post('/crear', async (req: Request, res: Response) => {
  try {
    const { token, cotizacionId, paymentMethodId, installments, issuerId, payer } = req.body;

    if (!token || !cotizacionId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar cotización
    const { data: cotizacion, error: errCotiz } = await supabase.from('cotizaciones').select('*').eq('id', cotizacionId).single();
    if (errCotiz || !cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    if (!cotizacion.precio_final) {
      return res.status(400).json({ error: 'La cotización aún no tiene un precio final asignado' });
    }

    if (cotizacion.estado === 'pagada') {
      return res.status(400).json({ error: 'Esta cotización ya está pagada' });
    }

    // Obtener cliente
    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', cotizacion.cliente_id).single();
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Crear cargo en Mercado Pago
    const descripcion = `Pago de cotización ${cotizacionId}`;
    const finalPayer = payer || { email: cliente.email || 'test@testuser.com' };
    if (!finalPayer.email) finalPayer.email = 'test@testuser.com';
    
    const mpRes = await procesarPago(
      token,
      Number(cotizacion.precio_final),
      finalPayer,
      descripcion,
      { cotizacion_id: cotizacionId },
      paymentMethodId,
      installments,
      issuerId
    );

    if (!mpRes.success) {
      return res.status(400).json({ success: false, mensaje: mpRes.mensaje });
    }

    // Guardar pago
    const { data: pagoRes, error: errPago } = await supabase.from('pagos').insert([{
      cotizacion_id: cotizacionId,
      mp_payment_id: mpRes.paymentId,
      monto: cotizacion.precio_final,
      estado: mpRes.status === 'approved' ? 'completado' : 'pendiente',
      metodo: 'tarjeta',
      pagado_en: mpRes.status === 'approved' ? new Date().toISOString() : null
    }]).select('id, monto').single();

    if (errPago) throw errPago;

    // Actualizar cotización a "pagada" si está aprobado
    if (mpRes.status === 'approved') {
      await supabase.from('cotizaciones').update({ estado: 'pagada' }).eq('id', cotizacionId);
      
      // Enviar correo si hay
      if (cliente.email) {
        await enviarConfirmacionPago(cliente, cotizacion, { monto: Number(pagoRes.monto), cotizacion_id: cotizacionId });
      }
    }

    res.json({ success: true, paymentId: mpRes.paymentId, status: mpRes.status, mensaje: 'Pago procesado exitosamente' });

  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/pagos/:cotizacionId (Admin)
router.get('/:cotizacionId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { cotizacionId } = req.params;
    const { data, error } = await supabase.from('pagos').select('*').eq('cotizacion_id', cotizacionId).order('pagado_en', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

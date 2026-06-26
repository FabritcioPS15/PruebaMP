import { Router, Request, Response } from 'express';
import { supabase } from '../db/client';

const router = Router();

// POST /api/webhooks/mercadopago
router.post('/mercadopago', async (req: Request, res: Response) => {
  try {
    const { action, type, data } = req.body;

    console.log(`Webhook recibido de Mercado Pago: ${action || type}`);

    // Mercado Pago envía action="payment.updated" o "payment.created" o type="payment"
    if (type === 'payment' || action?.startsWith('payment')) {
      const paymentId = data?.id;
      if (!paymentId) return res.status(200).send('OK');

      const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      const paymentData: any = await response.json();
      
      if (response.ok && paymentData.status) {
        // Buscamos el pago
        const { data: pagoRes } = await supabase.from('pagos').select('*').eq('mp_payment_id', paymentId.toString()).single();
        
        if (pagoRes) {
          const pago = pagoRes;
          
          if (paymentData.status === 'approved' && pago.estado !== 'completado') {
            await supabase.from('pagos').update({ estado: 'completado', pagado_en: new Date().toISOString() }).eq('id', pago.id);
            await supabase.from('cotizaciones').update({ estado: 'pagada' }).eq('id', pago.cotizacion_id);
            console.log(`Pago ${paymentId} y cotización actualizados a aprobados vía Webhook`);
          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            await supabase.from('pagos').update({ estado: 'fallido' }).eq('id', pago.id);
            console.log(`Pago ${paymentId} marcado como fallido vía Webhook`);
          }
        }
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(200).send('Error procesado'); 
  }
});

export default router;

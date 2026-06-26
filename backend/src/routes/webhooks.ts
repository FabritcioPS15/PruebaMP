import { Router, Request, Response } from 'express';
import { supabase } from '../db/client';
import { enviarConfirmacionPago } from '../services/email';

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
        // Buscamos el pago junto con cotización y cliente
        const { data: pagoRes } = await supabase
          .from('pagos')
          .select('*')
          .eq('mp_payment_id', paymentId.toString())
          .single();
        
        if (pagoRes) {
          const pago = pagoRes;
          
          if (paymentData.status === 'approved' && pago.estado !== 'completado') {
            // Actualizar pago y cotización
            const fechaPago = new Date().toISOString();
            await supabase
              .from('pagos')
              .update({ estado: 'completado', pagado_en: fechaPago })
              .eq('id', pago.id);
            await supabase
              .from('cotizaciones')
              .update({ estado: 'pagada' })
              .eq('id', pago.cotizacion_id);

            console.log(`Pago ${paymentId} y cotización actualizados a aprobados vía Webhook`);

            // ── Enviar email de confirmación de pago vía Resend ──────────────
            try {
              const { data: cotizacionRes } = await supabase
                .from('cotizaciones')
                .select('*, clientes(*)')
                .eq('id', pago.cotizacion_id)
                .single();

              if (cotizacionRes && cotizacionRes.clientes?.email) {
                const cliente = cotizacionRes.clientes;
                const cotizacion = cotizacionRes;
                const pagoConFecha = { ...pago, pagado_en: new Date(fechaPago) };

                await enviarConfirmacionPago(cliente, cotizacion, pagoConFecha);
                console.log(`📧 Email de confirmación enviado a ${cliente.email}`);
              } else {
                console.warn(`⚠️  No se encontró email para cotización ${pago.cotizacion_id}`);
              }
            } catch (emailErr: any) {
              // El email no debe frenar el flujo principal
              console.error('❌ Error enviando email de confirmación de pago:', emailErr.message);
            }
            // ─────────────────────────────────────────────────────────────────

          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            await supabase
              .from('pagos')
              .update({ estado: 'fallido' })
              .eq('id', pago.id);
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

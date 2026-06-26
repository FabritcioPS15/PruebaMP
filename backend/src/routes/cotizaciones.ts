import { Router, Request, Response } from 'express';
import { supabase } from '../db/client';
import { requireAdmin } from '../middleware/auth';
import { enviarConfirmacionCotizacion, enviarLinkDePago } from '../services/email';

const router = Router();

// POST /api/cotizaciones
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, whatsapp, email, productoId, tipoMueble, anchoCm, altoCm, profundidadCm, color, acabado, notasCliente } = req.body;

    if (!nombre || !whatsapp) {
      return res.status(400).json({ error: 'Nombre y WhatsApp son requeridos' });
    }

    console.log(`Nueva solicitud de cotización de ${nombre} - ${whatsapp}`);

    // Buscar si el cliente ya existe por whatsapp
    const { data: clienteResult } = await supabase.from('clientes').select('*').eq('whatsapp', whatsapp).single();
    let clienteId;

    if (clienteResult) {
      clienteId = clienteResult.id;
    } else {
      // Crear nuevo cliente
      const { data: nuevoCliente, error: errC } = await supabase
        .from('clientes')
        .insert([{ nombre, email, whatsapp }])
        .select('id')
        .single();
      if (errC) throw errC;
      clienteId = nuevoCliente.id;
    }

    // Crear la cotización
    const { data: nuevaCotizacion, error: errCotiz } = await supabase
      .from('cotizaciones')
      .insert([{
        cliente_id: clienteId,
        producto_id: productoId || null,
        ancho_cm: anchoCm || null,
        alto_cm: altoCm || null,
        profundidad_cm: profundidadCm || null,
        color: color || null,
        acabado: acabado || null,
        notas_cliente: notasCliente || null
      }])
      .select('id')
      .single();

    if (errCotiz) throw errCotiz;

    const cotizacionId = nuevaCotizacion.id;

    // Enviar email si hay email
    if (email) {
      await enviarConfirmacionCotizacion({ nombre, whatsapp, email }, { id: cotizacionId, cliente_id: clienteId });
    }

    res.status(201).json({ id: cotizacionId, mensaje: 'Cotización recibida' });

  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cotizaciones (Admin)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { estado, page = '1', limit = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('cotizaciones')
      .select('*, clientes(*), productos(*)');

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query
      .order('creado_en', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    // Aplanar un poco los resultados para mantener formato
    const result = data.map((c: any) => ({
      ...c,
      cliente_nombre: c.clientes?.nombre,
      cliente_whatsapp: c.clientes?.whatsapp,
      producto_nombre: c.productos?.nombre,
      cliente: c.clientes,
      producto: c.productos
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cotizaciones/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .select('*, cliente:clientes(*), producto:productos(*)')
      .eq('id', id)
      .single();

    if (error || !cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const { data: pagosResult } = await supabase.from('pagos').select('*').eq('cotizacion_id', id);
    
    cotizacion.pagos = pagosResult || [];

    res.json(cotizacion);
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/cotizaciones/:id (Admin)
router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, precioFinal, notasAdmin } = req.body;

    const { data: result, error: errGet } = await supabase.from('cotizaciones').select('*').eq('id', id).single();
    if (errGet || !result) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    let currentEstado = result.estado;
    let newEstado = estado || currentEstado;

    if (precioFinal !== undefined && precioFinal !== null) {
      newEstado = 'cotizada';
    }

    const updates: any = {
      estado: newEstado,
      respondido_en: new Date().toISOString()
    };

    if (precioFinal !== undefined) updates.precio_final = precioFinal;
    if (notasAdmin !== undefined) updates.notas_admin = notasAdmin;

    const { error: errUpdate } = await supabase.from('cotizaciones').update(updates).eq('id', id);
    if (errUpdate) throw errUpdate;

    // Si se asignó precio, enviar link de pago
    if (precioFinal && result.precio_final == null) {
       const { data: clienteRes } = await supabase.from('clientes').select('*').eq('id', result.cliente_id).single();
       if (clienteRes && clienteRes.email) {
           const linkPago = `${process.env.FRONTEND_URL}/pago/${id}`;
           await enviarLinkDePago(clienteRes, { id, precio_final: precioFinal, cliente_id: result.cliente_id }, linkPago);
       }
    }

    res.json({ mensaje: 'Cotización actualizada' });

  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

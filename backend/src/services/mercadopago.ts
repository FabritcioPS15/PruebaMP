export const procesarPago = async (
  token: string,
  monto: number,
  payer: any,
  descripcion: string,
  metadata?: any,
  paymentMethodId?: string,
  installments?: number,
  issuerId?: string
) => {
  try {
    const url = 'https://api.mercadopago.com/v1/payments';

    const body: any = {
      transaction_amount: Number(monto),
      token,
      description: descripcion,
      installments: installments || 1,
      payment_method_id: paymentMethodId || 'visa',
      payer: payer,
      metadata: metadata || {}
    };

    // issuerId es necesario para algunas tarjetas
    if (issuerId) {
      body.issuer_id = issuerId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `pago_${token}_${Date.now()}`
      },
      body: JSON.stringify(body)
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Error de Mercado Pago:', JSON.stringify(data));
      return {
        success: false,
        mensaje: data.message || data.cause?.[0]?.description || 'Error al procesar el pago',
        status: null,
        paymentId: null
      };
    }

    const approved = data.status === 'approved';
    return {
      success: approved,
      status: data.status,
      paymentId: data.id?.toString() || null,
      mensaje: approved
        ? 'Pago aprobado'
        : `Pago ${data.status}: ${data.status_detail}`
    };

  } catch (error) {
    console.error('Error al conectar con Mercado Pago:', error);
    return { success: false, mensaje: 'Error de conexión con Mercado Pago', status: null, paymentId: null };
  }
};

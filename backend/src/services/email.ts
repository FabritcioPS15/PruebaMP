import { Resend } from 'resend';
import dotenv from 'dotenv';
import { Cliente, Cotizacion, Pago } from '../types';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'noreply@tudominio.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'MelaminaPro';

// ── Plantilla base ──────────────────────────────────────────────────────────
const baseTemplate = (contenido: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MelaminaPro</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                🪵 MelaminaPro
              </h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                Muebles a medida de calidad premium
              </p>
            </td>
          </tr>
          <!-- CONTENIDO -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${contenido}
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} MelaminaPro — Todos los derechos reservados.<br/>
                Si tienes alguna consulta, contáctanos por WhatsApp o responde este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Helper interno (no-bloquea la respuesta HTTP) ───────────────────────────
const sendAsync = async (params: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY no configurada — email omitido para:', params.to);
    return;
  }

  resend.emails
    .send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
    .then(({ data, error }) => {
      if (error) {
        console.error(`❌ Resend error enviando a ${params.to}:`, error.message);
      } else {
        console.log(`✉️  Email enviado a ${params.to} — id: ${data?.id}`);
      }
    })
    .catch((err: Error) =>
      console.error(`❌ Resend excepción enviando a ${params.to}:`, err.message)
    );
};

// ── 1. Confirmación de cotización ───────────────────────────────────────────
export const enviarConfirmacionCotizacion = async (
  cliente: Cliente,
  cotizacion: Cotizacion
) => {
  if (!cliente.email) return;

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">
      ¡Solicitud recibida, ${cliente.nombre}!
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
      Hemos registrado tu solicitud de cotización para un mueble a medida.
      Nuestro equipo la revisará y te enviará el presupuesto personalizado.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Detalles de tu solicitud</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${cotizacion.ancho_cm ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Ancho:</td><td style="padding:4px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${cotizacion.ancho_cm} cm</td></tr>` : ''}
            ${cotizacion.alto_cm ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Alto:</td><td style="padding:4px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${cotizacion.alto_cm} cm</td></tr>` : ''}
            ${cotizacion.profundidad_cm ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Profundidad:</td><td style="padding:4px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${cotizacion.profundidad_cm} cm</td></tr>` : ''}
            ${cotizacion.color ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Color:</td><td style="padding:4px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${cotizacion.color}</td></tr>` : ''}
            ${cotizacion.acabado ? `<tr><td style="padding:4px 0;color:#64748b;font-size:14px;">Acabado:</td><td style="padding:4px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${cotizacion.acabado}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#1d4ed8;font-size:14px;">
        📱 Te contactaremos vía <strong>WhatsApp al ${cliente.whatsapp}</strong> con tu presupuesto final en breve.
      </p>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:13px;">
      Gracias por confiar en <strong>MelaminaPro</strong>. Hacemos muebles que duran toda la vida.
    </p>
  `);

  await sendAsync({
    to: cliente.email,
    subject: '✅ Cotización recibida — MelaminaPro',
    html,
  });
};

// ── 2. Link de pago ─────────────────────────────────────────────────────────
export const enviarLinkDePago = async (
  cliente: Cliente,
  cotizacion: Cotizacion,
  linkPago: string
) => {
  if (!cliente.email) return;

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">
      ¡Tu cotización está lista, ${cliente.nombre}!
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
      Ya tenemos el precio de tu mueble a medida. Revisa los detalles y procede con el pago cuando estés listo.
    </p>

    <!-- Precio destacado -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:28px;text-align:center;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Precio final</p>
          <p style="margin:0;color:#ffffff;font-size:42px;font-weight:800;">S/ ${cotizacion.precio_final}</p>
        </td>
      </tr>
    </table>

    <!-- Botón CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${linkPago}"
             style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
            Pagar ahora →
          </a>
        </td>
      </tr>
    </table>

    <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#854d0e;font-size:13px;">
        ⏰ Este enlace de pago es válido por <strong>72 horas</strong>. Si expira, contáctanos por WhatsApp.
      </p>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:13px;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <a href="${linkPago}" style="color:#3b82f6;word-break:break-all;font-size:12px;">${linkPago}</a>
    </p>
  `);

  await sendAsync({
    to: cliente.email,
    subject: '💳 Tu cotización está lista — Paga ahora en MelaminaPro',
    html,
  });
};

// ── 3. Confirmación de pago exitoso ─────────────────────────────────────────
export const enviarConfirmacionPago = async (
  cliente: Cliente,
  cotizacion: Cotizacion,
  pago: Pago
) => {
  if (!cliente.email) return;

  const fechaPago = pago.pagado_en
    ? new Date(pago.pagado_en).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = baseTemplate(`
    <!-- Ícono de éxito -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;line-height:64px;font-size:32px;">
        ✓
      </div>
    </div>

    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">
      ¡Pago confirmado, ${cliente.nombre}!
    </h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;text-align:center;">
      Hemos recibido tu pago correctamente. Ya comenzamos a trabajar en tu pedido. 🎉
    </p>

    <!-- Resumen del pago -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Comprobante de pago</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;">Monto pagado</td>
              <td style="padding:6px 0;color:#16a34a;font-size:16px;font-weight:700;text-align:right;border-bottom:1px solid #e2e8f0;">S/ ${pago.monto}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;">Fecha de pago</td>
              <td style="padding:6px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e2e8f0;">${fechaPago}</td>
            </tr>
            ${pago.mp_payment_id ? `
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:14px;">ID de transacción</td>
              <td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;text-align:right;font-family:monospace;">${pago.mp_payment_id}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- Siguientes pasos -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#15803d;font-size:14px;font-weight:700;">¿Qué sigue?</p>
      <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8;">
        <li>Nuestro equipo comienza la fabricación de tu mueble.</li>
        <li>Te notificaremos cuando esté listo para entrega.</li>
        <li>Coordinamos el envío o recojo en tienda contigo.</li>
      </ul>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
      ¿Tienes preguntas? Escríbenos al WhatsApp <strong>${cliente.whatsapp}</strong>.<br/>
      Gracias por elegir <strong>MelaminaPro</strong>.
    </p>
  `);

  await sendAsync({
    to: cliente.email,
    subject: '🎉 ¡Pago recibido! Tu pedido está en producción — MelaminaPro',
    html,
  });
};

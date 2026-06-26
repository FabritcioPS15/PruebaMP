import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Cliente, Cotizacion, Pago } from '../types';

dotenv.config();

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  : null;

// Envío no bloqueante: nunca frena la respuesta al cliente
const sendAsync = (mailOptions: nodemailer.SendMailOptions) => {
  if (!transporter) {
    console.warn('⚠️ SMTP no configurado, email omitido para:', mailOptions.to);
    return;
  }
  transporter.sendMail(mailOptions)
    .then(() => console.log(`✉️ Email enviado a ${mailOptions.to}`))
    .catch((err: Error) => console.error(`❌ Error enviando email a ${mailOptions.to}:`, err.message));
};

export const enviarConfirmacionCotizacion = async (cliente: Cliente, cotizacion: Cotizacion) => {
  if (!cliente.email) return;

  sendAsync({
    from: `"${process.env.EMAIL_FROM || 'MelaminaPro'}" <${process.env.SMTP_USER}>`,
    to: cliente.email,
    subject: 'Confirmación de solicitud de cotización - MelaminaPro',
    html: `
      <h2>Hola ${cliente.nombre},</h2>
      <p>Hemos recibido tu solicitud de cotización para un mueble a medida.</p>
      <p>Nos pondremos en contacto contigo pronto vía WhatsApp al ${cliente.whatsapp} para enviarte el presupuesto final.</p>
      <p>Gracias por confiar en <strong>MelaminaPro</strong>.</p>
    `,
  });
};

export const enviarLinkDePago = async (cliente: Cliente, cotizacion: Cotizacion, linkPago: string) => {
  if (!cliente.email) return;

  sendAsync({
    from: `"${process.env.EMAIL_FROM || 'MelaminaPro'}" <${process.env.SMTP_USER}>`,
    to: cliente.email,
    subject: 'Tu cotización está lista - MelaminaPro',
    html: `
      <h2>Hola ${cliente.nombre},</h2>
      <p>Tu cotización ya tiene un precio asignado: <strong>S/ ${cotizacion.precio_final}</strong>.</p>
      <p>Puedes proceder con el pago haciendo clic en el siguiente enlace:</p>
      <a href="${linkPago}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:white;text-decoration:none;border-radius:5px;">Pagar ahora</a>
      <p>Gracias por confiar en <strong>MelaminaPro</strong>.</p>
    `,
  });
};

export const enviarConfirmacionPago = async (cliente: Cliente, cotizacion: Cotizacion, pago: Pago) => {
  if (!cliente.email) return;

  sendAsync({
    from: `"${process.env.EMAIL_FROM || 'MelaminaPro'}" <${process.env.SMTP_USER}>`,
    to: cliente.email,
    subject: 'Pago recibido exitosamente - MelaminaPro',
    html: `
      <h2>Hola ${cliente.nombre},</h2>
      <p>Hemos recibido tu pago de <strong>S/ ${pago.monto}</strong> para tu pedido.</p>
      <p>Empezaremos a trabajar en tu mueble muy pronto. Te mantendremos informado sobre el progreso.</p>
      <p>Gracias por confiar en <strong>MelaminaPro</strong>.</p>
    `,
  });
};

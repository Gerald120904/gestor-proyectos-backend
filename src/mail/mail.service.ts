import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    requireTLS: true,

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

    tls: {
      minVersion: 'TLSv1.2',
      servername: process.env.SMTP_HOST || 'smtp.gmail.com',
    },
  } as SMTPTransport.Options);

  private getFrom() {
    const fromName = process.env.MAIL_FROM_NAME || 'Gestor de Proyectos';
    const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

    return `"${fromName}" <${fromEmail}>`;
  }

  private escapeHtml(value: string) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private buildEmailTemplate(params: {
    title: string;
    subtitle: string;
    description: string;
    code: string;
    badgeText: string;
    footerText: string;
    extraContent?: string;
  }) {
    const safeTitle = this.escapeHtml(params.title);
    const safeSubtitle = this.escapeHtml(params.subtitle);
    const safeDescription = this.escapeHtml(params.description);
    const safeCode = this.escapeHtml(params.code);
    const safeBadgeText = this.escapeHtml(params.badgeText);
    const safeFooterText = this.escapeHtml(params.footerText);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0; padding:0; background:#eef3f8; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f8; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; background:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 18px 45px rgba(15,23,42,0.12);">
          
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#2563eb); padding:34px 30px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.16); color:#ffffff; font-size:13px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; padding:8px 16px; border-radius:999px; margin-bottom:18px;">
                ${safeBadgeText}
              </div>

              <h1 style="margin:0; color:#ffffff; font-size:29px; line-height:1.25; font-weight:800;">
                ${safeTitle}
              </h1>

              <p style="margin:12px 0 0; color:#dbeafe; font-size:16px; line-height:1.6;">
                ${safeSubtitle}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 34px 12px;">
              <p style="margin:0; color:#334155; font-size:16px; line-height:1.7; text-align:center;">
                ${safeDescription}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px 34px 22px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:20px; padding:24px 18px;">
                <p style="margin:0 0 12px; color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                  Código de seguridad
                </p>

                <div style="display:inline-block; background:#ffffff; border:2px dashed #2563eb; color:#0f172a; border-radius:18px; padding:18px 28px; font-size:36px; font-weight:900; letter-spacing:9px; line-height:1;">
                  ${safeCode}
                </div>

                <p style="margin:16px 0 0; color:#64748b; font-size:14px; line-height:1.5;">
                  Copia este código y úsalo dentro de la aplicación.
                </p>
              </div>
            </td>
          </tr>

          ${
            params.extraContent
              ? `
          <tr>
            <td style="padding:0 34px 22px;">
              ${params.extraContent}
            </td>
          </tr>
              `
              : ''
          }

          <tr>
            <td style="padding:0 34px 28px;">
              <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:16px; padding:16px 18px;">
                <p style="margin:0; color:#9a3412; font-size:14px; line-height:1.6; text-align:center;">
                  ${safeFooterText}
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc; padding:24px 30px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0; color:#64748b; font-size:13px; line-height:1.6;">
                Este mensaje fue enviado automáticamente por
                <strong style="color:#0f172a;">Gestor de Proyectos</strong>.
              </p>

              <p style="margin:8px 0 0; color:#94a3b8; font-size:12px; line-height:1.5;">
                Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0; color:#94a3b8; font-size:12px; text-align:center;">
          © ${new Date().getFullYear()} Gestor de Proyectos. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  async sendVerificationCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: this.getFrom(),
      to: email,
      subject: 'Código de verificación - Gestor de Proyectos',
      text: `Tu código de verificación es: ${code}. Este código vence pronto.`,
      html: this.buildEmailTemplate({
        title: 'Verificación de cuenta',
        subtitle: 'Confirma tu correo para activar tu acceso al sistema.',
        description:
          'Hemos recibido una solicitud para verificar tu cuenta. Usa el siguiente código para completar el proceso de activación.',
        code,
        badgeText: 'Cuenta nueva',
        footerText:
          'Por seguridad, este código tiene un tiempo limitado de validez. No lo compartas con nadie.',
      }),
    });
  }

  async sendPasswordResetCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: this.getFrom(),
      to: email,
      subject: 'Código para recuperar contraseña - Gestor de Proyectos',
      text: `Tu código para recuperar la contraseña es: ${code}. Este código vence pronto.`,
      html: this.buildEmailTemplate({
        title: 'Recuperación de contraseña',
        subtitle: 'Usa este código para restablecer el acceso a tu cuenta.',
        description:
          'Recibimos una solicitud para cambiar la contraseña de tu cuenta. Ingresa el siguiente código en la aplicación para continuar.',
        code,
        badgeText: 'Seguridad de cuenta',
        footerText:
          'Si no solicitaste recuperar tu contraseña, ignora este correo y mantén tus datos protegidos.',
      }),
    });
  }

  async sendEmailChangeCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: this.getFrom(),
      to,
      subject: 'Código para cambiar correo - Gestor de Proyectos',
      text: `Tu código para cambiar el correo es: ${code}. Este código expira en 10 minutos.`,
      html: this.buildEmailTemplate({
        title: 'Cambio de correo',
        subtitle: 'Confirma que deseas actualizar el correo de tu cuenta.',
        description:
          'Para proteger tu cuenta, necesitamos confirmar esta acción. Usa el siguiente código para completar el cambio de correo.',
        code,
        badgeText: 'Confirmación requerida',
        footerText:
          'Este código expira en 10 minutos. Si no solicitaste este cambio, no compartas el código.',
      }),
    });
  }

  async sendPhoneChangeCode(to: string, phone: string, code: string) {
    const safePhone = this.escapeHtml(phone);

    await this.transporter.sendMail({
      from: this.getFrom(),
      to,
      subject: 'Código para cambiar teléfono - Gestor de Proyectos',
      text: `Se solicitó cambiar el teléfono de la cuenta a ${phone}. Tu código es: ${code}. Este código expira en 10 minutos.`,
      html: this.buildEmailTemplate({
        title: 'Cambio de teléfono',
        subtitle: 'Confirma el nuevo número asociado a tu cuenta.',
        description:
          'Se solicitó actualizar el número telefónico de tu cuenta. Usa el siguiente código para confirmar la operación.',
        code,
        badgeText: 'Actualización de datos',
        footerText:
          'Este código expira en 10 minutos. Si no solicitaste este cambio, ignora este mensaje.',
        extraContent: `
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:16px; padding:18px; text-align:center;">
            <p style="margin:0 0 8px; color:#1e40af; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px;">
              Nuevo teléfono solicitado
            </p>
            <p style="margin:0; color:#0f172a; font-size:20px; font-weight:800;">
              ${safePhone}
            </p>
          </div>
        `,
      }),
    });
  }
}
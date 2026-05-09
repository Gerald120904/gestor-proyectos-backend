import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendVerificationCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject: 'Código de verificación',
      html: `
        <h2>Verificación de cuenta</h2>
        <p>Tu código de verificación es:</p>
        <h1>${code}</h1>
        <p>Este código vence pronto.</p>
      `,
    });
  }

  async sendPasswordResetCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject: 'Código para recuperar contraseña',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código para cambiar la contraseña es:</p>
        <h1>${code}</h1>
        <p>Este código vence pronto.</p>
      `,
    });
  }

  async sendEmailChangeCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject: 'Código para cambiar correo',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Cambio de correo</h2>
        <p>Use el siguiente código para confirmar el cambio de correo:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `,
    });
  }

  async sendPhoneChangeCode(to: string, phone: string, code: string) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject: 'Código para cambiar teléfono',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Cambio de teléfono</h2>
        <p>Se solicitó cambiar el teléfono de la cuenta a:</p>
        <h3>${phone}</h3>
        <p>Use el siguiente código para confirmar el cambio:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `,
    });
  }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationCodeDto } from './dto/resend-verification-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { RequestPhoneChangeDto } from './dto/request-phone-change.dto';
import { ConfirmPhoneChangeDto } from './dto/confirm-phone-change.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private generateToken(user: { id: number; email: string; nombre: string }) {
    return this.jwtService.sign({
      sub: user.id,
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    });
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getCodeExpirationDate() {
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizePhone(phone: string): string {
    return phone
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .trim();
  }

  private async sendCodeToEmail(email: string, code: string) {
    await this.mailService.sendVerificationCode(email, code);
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const normalizedPhone = this.normalizePhone(dto.telefono);

    if (!normalizedPhone.startsWith('+')) {
      throw new BadRequestException(
        'El teléfono debe venir en formato internacional. Ejemplo: +50688888888.',
      );
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (emailExists) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const phoneExists = await this.prisma.user.findUnique({
      where: { telefono: normalizedPhone },
    });

    if (phoneExists) {
      throw new ConflictException('El número de teléfono ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nombre: dto.nombre.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        telefono: normalizedPhone,
        phoneCountryIso2: dto.phoneCountryIso2,
        phoneDialCode: dto.phoneDialCode,

        phoneVerified: false,
        firebasePhoneUid: null,

        emailVerified: false,
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        phoneCountryIso2: true,
        phoneDialCode: true,
        phoneVerified: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (dto.fcmToken && dto.fcmToken.trim().length > 0) {
      await this.prisma.fcmToken.upsert({
        where: {
          token: dto.fcmToken.trim(),
        },
        update: {
          userId: user.id,
          platform: dto.platform ?? 'unknown',
        },
        create: {
          token: dto.fcmToken.trim(),
          platform: dto.platform ?? 'unknown',
          userId: user.id,
        },
      });
    }

    return {
      message: 'Usuario registrado correctamente.',
      user,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const email = this.normalizeEmail(verifyEmailDto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Código inválido o correo incorrecto.');
    }

    if (user.emailVerified) {
      const accessToken = this.generateToken({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      });

      return {
        message: 'La cuenta ya estaba verificada.',
        accessToken,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      throw new BadRequestException('No hay código de verificación activo.');
    }

    if (user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException(
        'El código de verificación expiró. Solicite uno nuevo.',
      );
    }

    const codeIsValid = await bcrypt.compare(
      verifyEmailDto.code,
      user.emailVerificationCodeHash,
    );

    if (!codeIsValid) {
      throw new BadRequestException('Código de verificación incorrecto.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = this.generateToken(updatedUser);

    return {
      message: 'Correo verificado correctamente.',
      accessToken,
      user: updatedUser,
    };
  }

  async resendVerificationCode(dto: ResendVerificationCodeDto) {
    const email = this.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('No existe una cuenta con este correo.');
    }

    if (user.emailVerified) {
      return {
        message: 'La cuenta ya está verificada.',
      };
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCodeHash: codeHash,
        emailVerificationExpiresAt: this.getCodeExpirationDate(),
      },
    });

    await this.mailService.sendVerificationCode(email, code);

    return {
      message: 'Se envió un nuevo código de verificación.',
    };
  }

  async login(loginDto: LoginDto) {
    const email = this.normalizeEmail(loginDto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const passwordIsValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const accessToken = this.generateToken({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    });

    return {
      message: 'Inicio de sesión correcto.',
      accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = this.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Si el correo está registrado, se enviará un código de recuperación.',
      };
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCodeHash: codeHash,
        passwordResetExpiresAt: this.getCodeExpirationDate(),
      },
    });

    await this.mailService.sendPasswordResetCode(email, code);

    return {
      message:
        'Si el correo está registrado, se enviará un código de recuperación.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = this.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Código inválido o correo incorrecto.');
    }

    if (!user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
      throw new BadRequestException('No hay código de recuperación activo.');
    }

    if (user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException(
        'El código de recuperación expiró. Solicite uno nuevo.',
      );
    }

    const codeIsValid = await bcrypt.compare(
      dto.code,
      user.passwordResetCodeHash,
    );

    if (!codeIsValid) {
      throw new BadRequestException('Código de recuperación incorrecto.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
        passwordResetCodeHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }

  async profile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        nombre: dto.nombre.trim(),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = this.generateToken({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    });

    return {
      message: 'Perfil actualizado correctamente.',
      accessToken,
      user,
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const currentPasswordIsValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!currentPasswordIsValid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    const samePassword = await bcrypt.compare(dto.newPassword, user.password);

    if (samePassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la actual.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }

  async requestEmailChange(userId: number, dto: RequestEmailChangeDto) {
    const newEmail = this.normalizeEmail(dto.newEmail);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (newEmail === user.email) {
      throw new BadRequestException(
        'El nuevo correo debe ser diferente al correo actual.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese correo.');
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        pendingEmailCodeHash: codeHash,
        pendingEmailExpiresAt: this.getCodeExpirationDate(),
      },
    });

    await this.sendCodeToEmail(newEmail, code);

    return {
      message: 'Se envió un código de confirmación al nuevo correo.',
    };
  }

  async confirmEmailChange(userId: number, dto: ConfirmEmailChangeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.pendingEmail) {
      throw new BadRequestException('No hay cambio de correo pendiente.');
    }

    if (!user.pendingEmailCodeHash || !user.pendingEmailExpiresAt) {
      throw new BadRequestException('No hay código activo para cambiar correo.');
    }

    if (user.pendingEmailExpiresAt < new Date()) {
      throw new BadRequestException(
        'El código expiró. Solicite un nuevo cambio de correo.',
      );
    }

    const codeIsValid = await bcrypt.compare(
      dto.code,
      user.pendingEmailCodeHash,
    );

    if (!codeIsValid) {
      throw new BadRequestException('Código incorrecto.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.pendingEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('Ese correo ya está en uso.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        pendingEmailCodeHash: null,
        pendingEmailExpiresAt: null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = this.generateToken({
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
    });

    return {
      message: 'Correo actualizado correctamente.',
      accessToken,
      user: updatedUser,
    };
  }

  async requestPhoneChange(userId: number, dto: RequestPhoneChangeDto) {
    const newPhone = this.normalizePhone(dto.newPhone);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (user.telefono && user.telefono === newPhone) {
      throw new BadRequestException(
        'El nuevo teléfono debe ser diferente al teléfono actual.',
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        telefono: newPhone,
        id: {
          not: userId,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Este teléfono ya está asociado a otra cuenta.');
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingPhone: newPhone,
        pendingPhoneCodeHash: codeHash,
        pendingPhoneExpiresAt: this.getCodeExpirationDate(),
      },
    });

    await this.sendCodeToEmail(user.email, code);

    return {
      message:
        'Se envió un código de verificación al correo asociado a la cuenta.',
    };
  }

  async confirmPhoneChange(userId: number, dto: ConfirmPhoneChangeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (
      !user.pendingPhone ||
      !user.pendingPhoneCodeHash ||
      !user.pendingPhoneExpiresAt
    ) {
      throw new BadRequestException('No hay cambio de teléfono pendiente.');
    }

    if (user.pendingPhoneExpiresAt < new Date()) {
      throw new BadRequestException(
        'El código de verificación expiró. Solicite uno nuevo.',
      );
    }

    const codeIsValid = await bcrypt.compare(dto.code, user.pendingPhoneCodeHash);

    if (!codeIsValid) {
      throw new BadRequestException('Código incorrecto.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        telefono: user.pendingPhone,
        phoneVerified: true,
        pendingPhone: null,
        pendingPhoneCodeHash: null,
        pendingPhoneExpiresAt: null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Teléfono actualizado correctamente.',
      user: updatedUser,
    };
  }
}
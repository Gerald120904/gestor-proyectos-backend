import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification-code')
  resendVerificationCode(@Body() dto: ResendVerificationCodeDto) {
    return this.authService.resendVerificationCode(dto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: any) {
    return this.authService.profile(Number(user.sub ?? user.id));
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(Number(user.sub ?? user.id), dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(Number(user.sub ?? user.id), dto);
  }

  @Post('request-email-change')
  @UseGuards(JwtAuthGuard)
  requestEmailChange(
    @CurrentUser() user: any,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.authService.requestEmailChange(
      Number(user.sub ?? user.id),
      dto,
    );
  }

  @Post('confirm-email-change')
  @UseGuards(JwtAuthGuard)
  confirmEmailChange(
    @CurrentUser() user: any,
    @Body() dto: ConfirmEmailChangeDto,
  ) {
    return this.authService.confirmEmailChange(
      Number(user.sub ?? user.id),
      dto,
    );
  }

  @Post('request-phone-change')
  @UseGuards(JwtAuthGuard)
  requestPhoneChange(
    @CurrentUser() user: any,
    @Body() dto: RequestPhoneChangeDto,
  ) {
    return this.authService.requestPhoneChange(
      Number(user.sub ?? user.id),
      dto,
    );
  }

  @Post('confirm-phone-change')
  @UseGuards(JwtAuthGuard)
  confirmPhoneChange(
    @CurrentUser() user: any,
    @Body() dto: ConfirmPhoneChangeDto,
  ) {
    return this.authService.confirmPhoneChange(
      Number(user.sub ?? user.id),
      dto,
    );
  }
}
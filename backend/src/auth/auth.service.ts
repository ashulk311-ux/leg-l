import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import {
  User,
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  PasswordResetDto,
  PasswordResetConfirmDto,
  JwtPayload,
} from '@legal-docs/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash!))) {
      const { passwordHash, ...result } = user;
      return result as User;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const payload: JwtPayload = {
      sub: user._id!,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Update last login
    await this.usersService.updateLastLogin(user._id!);

    return {
      user: user as Omit<User, 'passwordHash'>,
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash,
      role: registerDto.role || 'user',
    });

    // Generate tokens
    const payload: JwtPayload = {
      sub: user._id!,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'passwordHash'>,
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user._id!,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      });

      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as Omit<User, 'passwordHash'>,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(passwordResetDto: PasswordResetDto): Promise<void> {
    const user = await this.usersService.findByEmail(passwordResetDto.email);
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: '1h' },
    );

    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    // For now, just log the token (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }
  }

  async confirmPasswordReset(
    passwordResetConfirmDto: PasswordResetConfirmDto,
  ): Promise<void> {
    try {
      const payload = this.jwtService.verify(passwordResetConfirmDto.token) as {
        sub: string;
        email: string;
      };

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      // Hash new password
      const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
      const passwordHash = await bcrypt.hash(
        passwordResetConfirmDto.newPassword,
        saltRounds,
      );

      // Update user password
      await this.usersService.updatePassword(user._id!, passwordHash);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store the logout event in the database
    // 3. Clear any server-side sessions
    
    // For now, we'll just log the logout event
    console.log(`User ${userId} logged out`);
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));

    switch (timeUnit) {
      case 's':
        return timeValue * 1000;
      case 'm':
        return timeValue * 60 * 1000;
      case 'h':
        return timeValue * 60 * 60 * 1000;
      case 'd':
        return timeValue * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000; // 24 hours default
    }
  }
}

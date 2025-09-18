import { z } from 'zod';

// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// User Status Enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// User Schema
export const UserSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  passwordHash: z.string().optional(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    department: z.string().optional()
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      processing: z.boolean().default(true)
    }).default({})
  }).optional(),
  lastLogin: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// User Types
export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;
export type UpdateUserDto = Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>;
export type UserProfile = User['profile'];
export type UserPreferences = User['preferences'];

// Authentication Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface PasswordResetDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  newPassword: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserRole } from '@legal-docs/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    role?: UserRole,
    status?: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { passwordHash }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, profile: any): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { profile }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePreferences(id: string, preferences: any): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { preferences }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    
    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userModel
      .findByIdAndUpdate(id, { passwordHash: newPasswordHash })
      .exec();
  }

  async suspendUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status: 'suspended' }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status: 'active' }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    pending: number;
    byRole: Record<string, number>;
  }> {
    const [total, active, suspended, pending, byRole] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ status: 'active' }).exec(),
      this.userModel.countDocuments({ status: 'suspended' }).exec(),
      this.userModel.countDocuments({ status: 'pending' }).exec(),
      this.userModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]).exec(),
    ]);

    const roleStats = byRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total,
      active,
      suspended,
      pending,
      byRole: roleStats,
    };
  }
}

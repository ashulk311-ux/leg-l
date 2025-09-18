import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, UserStatus } from '@legal-docs/shared';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({
    type: {
      firstName: { type: String },
      lastName: { type: String },
      avatar: { type: String },
      phone: { type: String },
      organization: { type: String },
      department: { type: String },
    },
  })
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    organization?: string;
    department?: string;
  };

  @Prop({
    type: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'en' },
      notifications: {
        type: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: false },
          processing: { type: Boolean, default: true },
        },
        default: {},
      },
    },
  })
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      processing: boolean;
    };
  };

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// Transform the output
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

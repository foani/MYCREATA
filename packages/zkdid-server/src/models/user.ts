import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/app';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  did?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: config.security.passwordMinLength,
      maxlength: config.security.passwordMaxLength
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    did: {
      type: String,
      unique: true,
      sparse: true
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 
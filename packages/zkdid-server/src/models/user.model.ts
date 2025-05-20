import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * 사용자 인터페이스
 */
export interface IUser extends Document {
  telegramId?: string;
  googleId?: string;
  email?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  password?: string;
  passwordChangedAt?: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  lastLoginAt?: Date;
  
  // 인스턴스 메서드
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(timestamp: number): boolean;
}

/**
 * 사용자 스키마
 */
const userSchema = new Schema<IUser>(
  {
    // Telegram 인증 정보
    telegramId: {
      type: String,
      unique: true,
      sparse: true, // null 값을 허용하면서 unique 제약 사용
    },
    
    // Google 인증 정보
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // 기본 사용자 정보
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function(v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid email!`
      }
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    
    // 비밀번호 (선택 사항)
    password: {
      type: String,
      minlength: 8,
      select: false, // 기본적으로 쿼리 결과에서 제외
    },
    passwordChangedAt: Date,
    
    // 계정 관련 정보
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 관리
  }
);

/**
 * 비밀번호 저장 전 해싱
 */
userSchema.pre('save', async function(next) {
  // 비밀번호가 수정되지 않았으면 다음 미들웨어로 진행
  if (!this.isModified('password')) return next();
  
  // 비밀번호 해싱
  this.password = await bcrypt.hash(this.password as string, 12);
  
  next();
});

/**
 * 비밀번호 변경 시 변경 시각 업데이트
 */
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // 비밀번호 변경 시간을 1초 앞당김 (JWT 발급 시간과 충돌 방지)
  this.passwordChangedAt = new Date(Date.now() - 1000);
  
  next();
});

/**
 * 활성 사용자만 조회
 */
userSchema.pre(/^find/, function(this: any, next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * 비밀번호 일치 확인 메서드
 */
userSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * 비밀번호 변경 여부 확인 메서드
 */
userSchema.methods.changedPasswordAfter = function(
  timestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return timestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

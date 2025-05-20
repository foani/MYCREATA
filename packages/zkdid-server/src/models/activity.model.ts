import mongoose, { Document, Schema } from 'mongoose';

/**
 * 활동 기록 인터페이스
 */
export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  didId: mongoose.Types.ObjectId;
  did: string;
  activityType: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  walletAddress?: string;
  status: 'success' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * 활동 기록 스키마
 */
const activitySchema = new Schema<IActivity>(
  {
    // 활동 주체
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    
    // 사용된 DID
    didId: {
      type: Schema.Types.ObjectId,
      ref: 'DID',
      required: [true, 'DID ID is required'],
    },
    
    // DID 문자열
    did: {
      type: String,
      required: [true, 'DID string is required'],
    },
    
    // 활동 유형 (예: auth, wallet, dapp)
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: ['auth', 'wallet', 'dapp', 'mission', 'referral', 'admin', 'other'],
    },
    
    // 수행된 작업 (예: login, transfer, approve)
    action: {
      type: String,
      required: [true, 'Action is required'],
    },
    
    // 클라이언트 정보
    ipAddress: String,
    userAgent: String,
    
    // 지갑 활동의 경우 사용된 지갑 주소
    walletAddress: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid Ethereum address!`
      }
    },
    
    // 활동 결과
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    
    // 추가 메타데이터
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 관리
  }
);

// 인덱스 설정
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ didId: 1, createdAt: -1 });
activitySchema.index({ walletAddress: 1, createdAt: -1 });

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;

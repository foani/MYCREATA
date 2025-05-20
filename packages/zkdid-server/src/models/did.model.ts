import mongoose, { Document, Schema } from 'mongoose';
import { config } from '../config/app';

/**
 * zkDID 인터페이스
 */
export interface IDID extends Document {
  did: string;
  userId: mongoose.Types.ObjectId;
  method: string;
  telegramId?: string;
  googleId?: string;
  walletAddresses: string[];
  publicKey: string;
  proofValue?: string;
  isActive: boolean;
  alias?: string;
  createdAt: Date;
  updatedAt: Date;
  verifiableCredentials?: string[];
}

/**
 * zkDID 스키마
 */
const didSchema = new Schema<IDID>(
  {
    // DID 식별자
    did: {
      type: String,
      required: [true, 'DID is required'],
      unique: true,
      trim: true,
    },
    
    // 연결된 사용자 ID
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    
    // DID 메서드 (예: zktg = zkSNARK + Telegram)
    method: {
      type: String,
      required: [true, 'Method is required'],
      enum: ['zktg', 'zkgg', 'zkem'],
      default: 'zktg',
    },
    
    // 인증 제공자 ID
    telegramId: {
      type: String,
      sparse: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    
    // 연결된 지갑 주소들
    walletAddresses: [{
      type: String,
      validate: {
        validator: function(v: string) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid Ethereum address!`
      }
    }],
    
    // 공개 키
    publicKey: {
      type: String,
      required: [true, 'Public key is required'],
    },
    
    // 증명 값 (zkSNARK 증명)
    proofValue: String,
    
    // 활성화 상태
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // DID 별칭 (예: username.creata)
    alias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    
    // 연결된 검증 가능한 자격 증명 목록
    verifiableCredentials: [String],
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 관리
  }
);

/**
 * DID 생성 전 식별자 설정
 */
didSchema.pre('save', function(next) {
  if (this.isNew && !this.did.startsWith(config.zkdid.prefix)) {
    // 메서드에 따른 DID 식별자 생성
    const method = this.method;
    const idPart = new mongoose.Types.ObjectId().toString();
    
    this.did = `${config.zkdid.prefix}:${method}:${idPart}`;
  }
  
  next();
});

/**
 * 활성 DID만 조회
 */
didSchema.pre(/^find/, function(this: any, next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const DID = mongoose.model<IDID>('DID', didSchema);

export default DID;

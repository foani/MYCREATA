import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 지갑 자산 타입
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  decimals: number;
  tokenAddress?: string;
  usdValue?: string;
  change24h?: string;
  iconUrl?: string;
  isNative?: boolean;
}

// NFT 타입
export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  contractAddress: string;
  contractName?: string;
  collectionName?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
}

// 미션 타입
export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: {
    amount: string;
    token: string;
  };
  status: 'available' | 'completed' | 'expired';
  expiresAt?: string;
  type: 'daily' | 'weekly' | 'special' | 'onetime';
  progress?: number;
  totalSteps?: number;
  iconUrl?: string;
}

// 트랜잭션 타입
export interface Transaction {
  id: string;
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  symbol: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  fee?: string;
  blockNumber?: number;
  type: 'send' | 'receive' | 'swap' | 'approve' | 'other';
  tokenAddress?: string;
  explorerUrl?: string;
}

// 추천 통계 타입
export interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  activeReferred: number;
  totalEarned: string;
  tokenSymbol: string;
  pendingRewards: string;
  historicalRewards: {
    timestamp: number;
    amount: string;
    status: 'pending' | 'completed';
  }[];
}

// 사용자 프로필 타입
export interface UserProfile {
  walletAddress: string;
  telegramId: string;
  did?: string;
  didAlias?: string;
  assets: Asset[];
  nfts: NFT[];
  transactions: Transaction[];
  missions: Mission[];
  referral: ReferralStats;
  createdAt: number;
  updatedAt: number;
}

// API 응답 공통 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * CreLink API 서비스
 */
class ApiService {
  private api: AxiosInstance;
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    // API 서버 주소 설정
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://api.crelink.io';
    
    // axios 인스턴스 생성
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 설정
    this.api.interceptors.request.use(
      (config) => {
        // 요청에 인증 토큰 추가
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 설정
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // 에러 처리 로직
        if (error.response) {
          // 서버 응답이 있는 경우
          console.error('API Error Response:', error.response.data);
          
          // 401 Unauthorized 인 경우 로그인 페이지로 이동 또는 재인증 처리
          if (error.response.status === 401) {
            this.authToken = null;
            // 인증 필요 이벤트 발생
            const event = new CustomEvent('auth:required');
            window.dispatchEvent(event);
          }
        } else if (error.request) {
          // 요청은 보냈으나 응답이 없는 경우
          console.error('API No Response:', error.request);
        } else {
          // 요청 설정 중 발생한 오류
          console.error('API Request Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * 인증 토큰 설정
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * 인증 토큰 초기화
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Telegram 인증 데이터로 로그인
   */
  async loginWithTelegram(telegramInitData: string): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const response = await this.api.post<ApiResponse<{ token: string; user: UserProfile }>>('/auth/telegram', {
        initData: telegramInitData,
      });
      
      // 성공적으로 로그인한 경우 토큰 저장
      if (response.data.success && response.data.data?.token) {
        this.setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<{ token: string; user: UserProfile }>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred during login',
        },
      };
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.api.get<ApiResponse<UserProfile>>('/user/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserProfile>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching profile',
        },
      };
    }
  }

  /**
   * 자산 목록 조회
   */
  async getAssets(): Promise<ApiResponse<Asset[]>> {
    try {
      const response = await this.api.get<ApiResponse<Asset[]>>('/wallet/assets');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Asset[]>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching assets',
        },
      };
    }
  }

  /**
   * NFT 목록 조회
   */
  async getNFTs(): Promise<ApiResponse<NFT[]>> {
    try {
      const response = await this.api.get<ApiResponse<NFT[]>>('/wallet/nfts');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<NFT[]>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching NFTs',
        },
      };
    }
  }

  /**
   * 트랜잭션 내역 조회
   */
  async getTransactions(params?: { page?: number; limit?: number }): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await this.api.get<ApiResponse<Transaction[]>>('/wallet/transactions', {
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Transaction[]>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching transactions',
        },
      };
    }
  }

  /**
   * 미션 목록 조회
   */
  async getMissions(): Promise<ApiResponse<Mission[]>> {
    try {
      const response = await this.api.get<ApiResponse<Mission[]>>('/mission/list');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Mission[]>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching missions',
        },
      };
    }
  }

  /**
   * 미션 완료 처리
   */
  async completeMission(missionId: string): Promise<ApiResponse<{ success: boolean; reward: { amount: string; token: string } }>> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; reward: { amount: string; token: string } }>>(
        '/mission/complete',
        { missionId }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<{ success: boolean; reward: { amount: string; token: string } }>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while completing mission',
        },
      };
    }
  }

  /**
   * 추천 코드 조회
   */
  async getReferralCode(): Promise<ApiResponse<{ code: string }>> {
    try {
      const response = await this.api.get<ApiResponse<{ code: string }>>('/referral/code');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<{ code: string }>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching referral code',
        },
      };
    }
  }

  /**
   * 추천 통계 조회
   */
  async getReferralStats(): Promise<ApiResponse<ReferralStats>> {
    try {
      const response = await this.api.get<ApiResponse<ReferralStats>>('/referral/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<ReferralStats>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while fetching referral stats',
        },
      };
    }
  }

  /**
   * 추천 코드 적용
   */
  async applyReferralCode(code: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean }>>(
        '/referral/apply',
        { code }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<{ success: boolean }>;
      }
      
      return {
        success: false,
        error: {
          code: 'unknown_error',
          message: 'An unknown error occurred while applying referral code',
        },
      };
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const apiService = new ApiService();
export default apiService;

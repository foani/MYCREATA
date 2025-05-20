/**
 * Catena-Ethereum 브릿지 구현
 * 
 * Catena 체인과 Ethereum 체인 간의 자산 이동을 위한 브릿지 제공자 구현
 * 
 * 이 파일은 두 체인 네트워크 간의 크로스체인 트랜잭션을 처리하는 기능을 제공합니다.
 * 주요 기능으로는 자산 락(lock), 민팅(mint), 소각(burn), 릴리스(release) 등이 있습니다.
 * 
 * @packageDocumentation
 */

import { ethers } from 'ethers';
import { BridgeProvider, BridgeTransaction, BridgeTransactionStatus, BridgeAsset, TokenInfo, TokenAllowanceResponse } from './bridge.interface';
import { ChainType } from '../chains';
import { logger } from '../../utils/logging';
import { CatenaProvider } from '../providers/catena.provider';
import { AddressValidator } from '../../utils/validation';
import { convertToWei, convertFromWei } from '../../utils/conversion';

/**
 * Catena-Ethereum 브릿지 컨트랙트 ABI
 */
const BRIDGE_ABI = [
  // 이벤트 로그
  'event Locked(address indexed token, address indexed sender, uint256 amount, bytes32 transactionId)',
  'event Released(address indexed token, address indexed recipient, uint256 amount, bytes32 transactionId)',
  'event Minted(address indexed token, address indexed recipient, uint256 amount, bytes32 transactionId)',
  'event Burned(address indexed token, address indexed sender, uint256 amount, bytes32 transactionId)',
  
  // 락 및 릴리스 함수
  'function lock(address token, uint256 amount, address recipient) external returns (bytes32)',
  'function release(address token, uint256 amount, address recipient, bytes32 transactionId, bytes calldata signature) external',
  
  // 민트 및 소각 함수
  'function mint(address token, uint256 amount, address recipient, bytes32 transactionId, bytes calldata signature) external',
  'function burn(address token, uint256 amount, address recipient) external returns (bytes32)',
  
  // 상태 조회 함수
  'function getTransaction(bytes32 transactionId) external view returns (address token, address sender, address recipient, uint256 amount, uint8 status)',
  'function getSupportedTokens() external view returns (address[] memory)',
  'function tokenMapping(address originToken) external view returns (address)'
];

/**
 * Catena-Ethereum 브릿지 로릴레이 컨트랙트 ABI
 */
const BRIDGE_RELAY_ABI = [
  'function relayTransaction(bytes32 transactionId, address token, address recipient, uint256 amount, uint8 chainId, bytes calldata signature) external',
  'function getRelayerFee(address token, uint256 amount) external view returns (uint256)',
  'function getPendingTransactions() external view returns (bytes32[] memory)'
];

/**
 * ERC20 토큰 표준 ABI
 */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)'
];

/**
 * Ethereum 네트워크의 브릿지 컨트랙트 주소
 */
const ETHEREUM_BRIDGE_CONTRACT = {
  mainnet: '0x1234567890123456789012345678901234567890', // mainnet 주소
  testnet: '0x0987654321098765432109876543210987654321'  // testnet 주소
};

/**
 * Catena 네트워크의 브릿지 컨트랙트 주소
 */
const CATENA_BRIDGE_CONTRACT = {
  mainnet: '0xabcdef0123456789abcdef0123456789abcdef01', // mainnet 주소
  testnet: '0xfedcba9876543210fedcba9876543210fedcba98'  // testnet 주소
};

/**
 * 릴레이어 서비스 API 엔드포인트
 */
const RELAYER_API = {
  mainnet: 'https://bridge-relayer.creatachain.com/api',
  testnet: 'https://testnet-bridge-relayer.creatachain.com/api'
};

/**
 * Catena-Ethereum 브릿지 상태 코드
 */
enum BridgeStatusCode {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
  CANCELED = 3
}

/**
 * Catena-Ethereum 브릿지 트랜잭션 타입
 */
enum BridgeTransactionType {
  LOCK = 0,
  RELEASE = 1,
  MINT = 2,
  BURN = 3
}

/**
 * Catena-Ethereum 브릿지 제공자 구현 클래스
 */
export class CatenaEthereumBridge implements BridgeProvider {
  private catenaProvider: ethers.Provider;
  private ethereumProvider: ethers.Provider;
  private catenaBridgeContract: ethers.Contract;
  private ethereumBridgeContract: ethers.Contract;
  private catenaRelayContract: ethers.Contract;
  private ethereumRelayContract: ethers.Contract;
  private isMainnet: boolean;
  private relayerApi: string;
  private supportedTokens: Map<string, string> = new Map(); // 원본 토큰 주소 -> 타겟 토큰 주소 매핑

  /**
   * Catena-Ethereum 브릿지 제공자 생성자
   * 
   * @param catenaProvider - Catena 네트워크 프로바이더
   * @param ethereumProvider - Ethereum 네트워크 프로바이더
   * @param isMainnet - Mainnet 여부 (true: mainnet, false: testnet)
   */
  constructor(
    catenaProvider: ethers.Provider,
    ethereumProvider: ethers.Provider,
    isMainnet: boolean = false
  ) {
    this.catenaProvider = catenaProvider;
    this.ethereumProvider = ethereumProvider;
    this.isMainnet = isMainnet;
    this.relayerApi = isMainnet ? RELAYER_API.mainnet : RELAYER_API.testnet;

    // 브릿지 컨트랙트 초기화
    const catenaBridgeAddress = isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet;
    const ethereumBridgeAddress = isMainnet ? ETHEREUM_BRIDGE_CONTRACT.mainnet : ETHEREUM_BRIDGE_CONTRACT.testnet;

    this.catenaBridgeContract = new ethers.Contract(catenaBridgeAddress, BRIDGE_ABI, this.catenaProvider);
    this.ethereumBridgeContract = new ethers.Contract(ethereumBridgeAddress, BRIDGE_ABI, this.ethereumProvider);
    
    // 릴레이 컨트랙트 초기화 (같은 주소 사용, 다른 ABI)
    this.catenaRelayContract = new ethers.Contract(catenaBridgeAddress, BRIDGE_RELAY_ABI, this.catenaProvider);
    this.ethereumRelayContract = new ethers.Contract(ethereumBridgeAddress, BRIDGE_RELAY_ABI, this.ethereumProvider);
    
    // 지원 토큰 목록 초기화
    this.initSupportedTokens();
  }

  /**
   * 지원 토큰 정보 초기화
   * 브릿지가 지원하는 토큰 목록을 가져와 내부 맵에 저장
   */
  private async initSupportedTokens(): Promise<void> {
    try {
      // Ethereum에서 지원하는 토큰 가져오기
      const ethereumTokens = await this.ethereumBridgeContract.getSupportedTokens();
      
      // 각 토큰별 매핑 정보 저장
      for (const token of ethereumTokens) {
        const mappedToken = await this.ethereumBridgeContract.tokenMapping(token);
        if (mappedToken && mappedToken !== ethers.ZeroAddress) {
          this.supportedTokens.set(token.toLowerCase(), mappedToken.toLowerCase());
        }
      }
      
      logger.info(`[CatenaEthereumBridge] ${this.supportedTokens.size} supported tokens initialized`);
    } catch (error) {
      logger.error('[CatenaEthereumBridge] Failed to initialize supported tokens:', error);
      throw new Error('Failed to initialize token mappings');
    }
  }

  /**
   * 소스 체인 유형 반환
   * @returns Catena 체인 유형
   */
  getSourceChain(): ChainType {
    return ChainType.CATENA;
  }

  /**
   * 대상 체인 유형 반환
   * @returns Ethereum 체인 유형
   */
  getTargetChain(): ChainType {
    return ChainType.ETHEREUM;
  }

  /**
   * 토큰의 상대 체인에서의 매핑 주소 반환
   * 
   * @param tokenAddress - 토큰 주소
   * @param sourceChain - 소스 체인 유형
   * @returns 상대 체인에서의 매핑된 토큰 주소
   */
  async getMappedToken(tokenAddress: string, sourceChain: ChainType): Promise<string> {
    try {
      // 주소 유효성 검증
      if (!AddressValidator.isValidAddress(tokenAddress)) {
        throw new Error('Invalid token address format');
      }
      
      const lowerCaseAddress = tokenAddress.toLowerCase();
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Ethereum 방향의 토큰 매핑 확인
        const mappedToken = await this.catenaBridgeContract.tokenMapping(tokenAddress);
        return mappedToken;
      } else {
        // Ethereum -> Catena 방향의 토큰 매핑 확인
        const mappedToken = await this.ethereumBridgeContract.tokenMapping(tokenAddress);
        return mappedToken;
      }
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get mapped token for ${tokenAddress}:`, error);
      throw new Error(`Failed to get mapped token: ${error.message}`);
    }
  }

  /**
   * 모든 지원 토큰 목록 반환
   * 
   * @param sourceChain - 소스 체인 유형
   * @returns 지원 토큰 목록
   */
  async getSupportedAssets(sourceChain: ChainType): Promise<BridgeAsset[]> {
    try {
      const assets: BridgeAsset[] = [];
      const contract = sourceChain === ChainType.CATENA 
        ? this.catenaBridgeContract 
        : this.ethereumBridgeContract;
      
      const supportedTokens = await contract.getSupportedTokens();
      
      for (const tokenAddress of supportedTokens) {
        // 각 토큰의 상세 정보 가져오기
        const tokenInfo = await this.getTokenInfo(tokenAddress, sourceChain);
        const mappedTokenAddress = await this.getMappedToken(tokenAddress, sourceChain);
        const mappedTokenInfo = await this.getTokenInfo(mappedTokenAddress, 
          sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA);
        
        assets.push({
          sourceToken: {
            address: tokenAddress,
            ...tokenInfo
          },
          targetToken: {
            address: mappedTokenAddress,
            ...mappedTokenInfo
          },
          sourceChain,
          targetChain: sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA
        });
      }
      
      return assets;
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get supported assets:`, error);
      throw new Error(`Failed to get supported assets: ${error.message}`);
    }
  }

  /**
   * 토큰 상세 정보 가져오기
   * 
   * @param tokenAddress - 토큰 주소
   * @param chainType - 체인 유형
   * @returns 토큰 정보
   */
  private async getTokenInfo(tokenAddress: string, chainType: ChainType): Promise<TokenInfo> {
    try {
      const provider = chainType === ChainType.CATENA 
        ? this.catenaProvider 
        : this.ethereumProvider;
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      // 토큰 상세 정보 가져오기
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals,
        totalSupply: totalSupply.toString()
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get token info for ${tokenAddress}:`, error);
      // 기본 정보로 대체
      return {
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        decimals: 18,
        totalSupply: '0'
      };
    }
  }

  /**
   * 특정 주소의 토큰 잔액 조회
   * 
   * @param tokenAddress - 토큰 주소
   * @param walletAddress - 지갑 주소
   * @param chainType - 체인 유형
   * @returns 토큰 잔액 (wei 문자열)
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string, chainType: ChainType): Promise<string> {
    try {
      const provider = chainType === ChainType.CATENA 
        ? this.catenaProvider 
        : this.ethereumProvider;
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      
      return balance.toString();
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get token balance:`, error);
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  /**
   * 토큰 허용량 조회
   * 
   * @param tokenAddress - 토큰 주소
   * @param walletAddress - 지갑 주소
   * @param chainType - 체인 유형
   * @returns 토큰 허용량 정보
   */
  async getTokenAllowance(tokenAddress: string, walletAddress: string, chainType: ChainType): Promise<TokenAllowanceResponse> {
    try {
      const provider = chainType === ChainType.CATENA 
        ? this.catenaProvider 
        : this.ethereumProvider;
      
      const bridgeAddress = chainType === ChainType.CATENA 
        ? (this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet)
        : (this.isMainnet ? ETHEREUM_BRIDGE_CONTRACT.mainnet : ETHEREUM_BRIDGE_CONTRACT.testnet);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(walletAddress, bridgeAddress);
      
      return {
        allowance: allowance.toString(),
        isApproved: allowance.gt(0)
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get token allowance:`, error);
      throw new Error(`Failed to get token allowance: ${error.message}`);
    }
  }

  /**
   * 토큰 승인 트랜잭션 생성
   * 
   * @param tokenAddress - 토큰 주소
   * @param amount - 승인 금액
   * @param chainType - 체인 유형
   * @param signer - 서명자 (지갑)
   * @returns 트랜잭션 해시
   */
  async approveToken(
    tokenAddress: string, 
    amount: string, 
    chainType: ChainType,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const bridgeAddress = chainType === ChainType.CATENA 
        ? (this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet)
        : (this.isMainnet ? ETHEREUM_BRIDGE_CONTRACT.mainnet : ETHEREUM_BRIDGE_CONTRACT.testnet);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      const tx = await tokenContract.approve(bridgeAddress, amount);
      const receipt = await tx.wait();
      
      logger.info(`[CatenaEthereumBridge] Token approval transaction: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to approve token:`, error);
      throw new Error(`Failed to approve token: ${error.message}`);
    }
  }

  /**
   * 릴레이어 수수료 조회
   * 
   * @param tokenAddress - 토큰 주소
   * @param amount - 금액
   * @param chainType - 체인 유형
   * @returns 릴레이어 수수료
   */
  async getRelayerFee(tokenAddress: string, amount: string, chainType: ChainType): Promise<string> {
    try {
      const relayContract = chainType === ChainType.CATENA 
        ? this.catenaRelayContract 
        : this.ethereumRelayContract;
      
      const fee = await relayContract.getRelayerFee(tokenAddress, amount);
      return fee.toString();
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Failed to get relayer fee:`, error);
      throw new Error(`Failed to get relayer fee: ${error.message}`);
    }
  }

  /**
   * 브릿지 트랜잭션 시작
   * 
   * @param sourceTokenAddress - 소스 토큰 주소
   * @param amount - 금액
   * @param recipientAddress - 수신자 주소
   * @param sourceChain - 소스 체인 유형
   * @param signer - 서명자 (지갑)
   * @returns 브릿지 트랜잭션 정보
   */
  async bridgeAsset(
    sourceTokenAddress: string,
    amount: string, 
    recipientAddress: string,
    sourceChain: ChainType,
    signer: ethers.Signer
  ): Promise<BridgeTransaction> {
    try {
      // 주소 유효성 검증
      if (!AddressValidator.isValidAddress(sourceTokenAddress) || 
          !AddressValidator.isValidAddress(recipientAddress)) {
        throw new Error('Invalid address format');
      }
      
      // 금액 유효성 검증
      if (!amount || BigInt(amount) <= BigInt(0)) {
        throw new Error('Invalid amount');
      }
      
      let tx: ethers.TransactionResponse;
      let transactionId: string;
      let transactionType: BridgeTransactionType;
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Ethereum 전송 (Lock)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          signer
        );
        
        tx = await bridgeContract.lock(sourceTokenAddress, amount, recipientAddress);
        transactionType = BridgeTransactionType.LOCK;
      } else {
        // Ethereum -> Catena 전송 (Burn)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? ETHEREUM_BRIDGE_CONTRACT.mainnet : ETHEREUM_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          signer
        );
        
        tx = await bridgeContract.burn(sourceTokenAddress, amount, recipientAddress);
        transactionType = BridgeTransactionType.BURN;
      }
      
      // 트랜잭션 수신 대기
      const receipt = await tx.wait();
      
      // 이벤트에서 트랜잭션 ID 추출
      const eventName = transactionType === BridgeTransactionType.LOCK ? 'Locked' : 'Burned';
      const event = receipt.logs
        .map(log => {
          try {
            const contract = sourceChain === ChainType.CATENA 
              ? this.catenaBridgeContract 
              : this.ethereumBridgeContract;
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === eventName);
      
      if (!event) {
        throw new Error(`${eventName} event not found in transaction logs`);
      }
      
      transactionId = event.args.transactionId;
      
      // 매핑된 토큰 정보 가져오기
      const targetTokenAddress = await this.getMappedToken(
        sourceTokenAddress, 
        sourceChain
      );
      
      // 트랜잭션 상태 조회 및 반환
      return {
        id: transactionId,
        txHash: receipt.hash,
        sourceChain,
        targetChain: sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA,
        sourceToken: sourceTokenAddress,
        targetToken: targetTokenAddress,
        sender: await signer.getAddress(),
        recipient: recipientAddress,
        amount,
        status: BridgeTransactionStatus.PENDING,
        timestamp: Math.floor(Date.now() / 1000),
        completedAt: null,
        relayerFee: await this.getRelayerFee(sourceTokenAddress, amount, sourceChain)
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Bridge asset failed:`, error);
      throw new Error(`Bridge asset failed: ${error.message}`);
    }
  }

  /**
   * 브릿지 트랜잭션 상태 조회
   * 
   * @param transactionId - 트랜잭션 ID
   * @param sourceChain - 소스 체인 유형
   * @returns 브릿지 트랜잭션 상태 정보
   */
  async getTransactionStatus(transactionId: string, sourceChain: ChainType): Promise<BridgeTransaction> {
    try {
      // 소스 체인의 브릿지 컨트랙트
      const sourceBridgeContract = sourceChain === ChainType.CATENA 
        ? this.catenaBridgeContract 
        : this.ethereumBridgeContract;
      
      // 타겟 체인의 브릿지 컨트랙트
      const targetBridgeContract = sourceChain === ChainType.CATENA 
        ? this.ethereumBridgeContract 
        : this.catenaBridgeContract;
      
      // 트랜잭션 정보 조회
      const tx = await sourceBridgeContract.getTransaction(transactionId);
      const [token, sender, recipient, amount, statusCode] = tx;
      
      // 상태 코드를 BridgeTransactionStatus로 변환
      let status: BridgeTransactionStatus;
      switch (statusCode) {
        case BridgeStatusCode.PENDING:
          status = BridgeTransactionStatus.PENDING;
          break;
        case BridgeStatusCode.COMPLETED:
          status = BridgeTransactionStatus.COMPLETED;
          break;
        case BridgeStatusCode.FAILED:
          status = BridgeTransactionStatus.FAILED;
          break;
        case BridgeStatusCode.CANCELED:
          status = BridgeTransactionStatus.CANCELED;
          break;
        default:
          status = BridgeTransactionStatus.UNKNOWN;
      }
      
      // 매핑된 타겟 토큰 가져오기
      const targetToken = await this.getMappedToken(token, sourceChain);
      
      // 트랜잭션 정보 반환
      return {
        id: transactionId,
        txHash: '', // 원본 트랜잭션 해시는 블록체인 조회만으로는 알 수 없음
        sourceChain,
        targetChain: sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA,
        sourceToken: token,
        targetToken: targetToken,
        sender,
        recipient,
        amount: amount.toString(),
        status,
        timestamp: 0, // 블록체인만으로는 정확한 타임스탬프를 알 수 없음
        completedAt: status === BridgeTransactionStatus.COMPLETED ? Math.floor(Date.now() / 1000) : null,
        relayerFee: await this.getRelayerFee(token, amount.toString(), sourceChain)
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Get transaction status failed:`, error);
      throw new Error(`Get transaction status failed: ${error.message}`);
    }
  }

  /**
   * 특정 주소의 모든 브릿지 트랜잭션 이력 조회
   * 
   * @param walletAddress - 지갑 주소
   * @returns 브릿지 트랜잭션 목록
   */
  async getTransactionHistory(walletAddress: string): Promise<BridgeTransaction[]> {
    try {
      // 릴레이어 API를 통해 거래 내역 조회
      const response = await fetch(`${this.relayerApi}/transactions?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.transactions.map(tx => {
        return {
          id: tx.transactionId,
          txHash: tx.txHash,
          sourceChain: tx.sourceChain === 'CATENA' ? ChainType.CATENA : ChainType.ETHEREUM,
          targetChain: tx.targetChain === 'CATENA' ? ChainType.CATENA : ChainType.ETHEREUM,
          sourceToken: tx.sourceToken,
          targetToken: tx.targetToken,
          sender: tx.sender,
          recipient: tx.recipient,
          amount: tx.amount,
          status: tx.status,
          timestamp: tx.timestamp,
          completedAt: tx.completedAt,
          relayerFee: tx.relayerFee
        };
      });
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Get transaction history failed:`, error);
      throw new Error(`Get transaction history failed: ${error.message}`);
    }
  }

  /**
   * 체인 간 브릿지 수수료 추정
   * 
   * @param sourceTokenAddress - 소스 토큰 주소
   * @param amount - 금액
   * @param sourceChain - 소스 체인 유형
   * @returns 추정 수수료 정보
   */
  async estimateBridgeFee(sourceTokenAddress: string, amount: string, sourceChain: ChainType): Promise<{
    bridgeFee: string;
    relayerFee: string;
    gasEstimate: string;
    totalFee: string;
  }> {
    try {
      // 릴레이어 수수료 조회
      const relayerFee = await this.getRelayerFee(sourceTokenAddress, amount, sourceChain);
      
      // 브릿지 수수료 (프로토콜 수수료)
      const bridgeFeePercent = 0.001; // 0.1%
      const bridgeFee = (BigInt(amount) * BigInt(Math.floor(bridgeFeePercent * 1000))) / BigInt(1000);
      
      // 가스비 추정
      let gasEstimate: bigint;
      if (sourceChain === ChainType.CATENA) {
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          this.catenaProvider
        );
        
        const gasLimit = await bridgeContract.lock.estimateGas(
          sourceTokenAddress, 
          amount, 
          "0x0000000000000000000000000000000000000000" // 더미 주소
        );
        
        const gasPrice = await this.catenaProvider.getFeeData();
        gasEstimate = gasLimit * (gasPrice.gasPrice || BigInt(0));
      } else {
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? ETHEREUM_BRIDGE_CONTRACT.mainnet : ETHEREUM_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          this.ethereumProvider
        );
        
        const gasLimit = await bridgeContract.burn.estimateGas(
          sourceTokenAddress, 
          amount, 
          "0x0000000000000000000000000000000000000000" // 더미 주소
        );
        
        const gasPrice = await this.ethereumProvider.getFeeData();
        gasEstimate = gasLimit * (gasPrice.gasPrice || BigInt(0));
      }
      
      // 총 비용
      const totalFee = BigInt(relayerFee) + bridgeFee + gasEstimate;
      
      return {
        bridgeFee: bridgeFee.toString(),
        relayerFee,
        gasEstimate: gasEstimate.toString(),
        totalFee: totalFee.toString()
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Estimate bridge fee failed:`, error);
      throw new Error(`Estimate bridge fee failed: ${error.message}`);
    }
  }

  /**
   * 릴레이어에 트랜잭션 처리 요청
   * 
   * @param transactionId - 트랜잭션 ID
   * @param sourceChain - 소스 체인 유형
   * @returns API 응답
   */
  async requestRelay(transactionId: string, sourceChain: ChainType): Promise<any> {
    try {
      const response = await fetch(`${this.relayerApi}/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          sourceChain: sourceChain === ChainType.CATENA ? 'CATENA' : 'ETHEREUM'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Relay request failed: ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Request relay failed:`, error);
      throw new Error(`Request relay failed: ${error.message}`);
    }
  }

  /**
   * 브릿지 서비스 연결 상태 확인
   * 
   * @returns 연결 상태 객체
   */
  async checkBridgeStatus(): Promise<{
    catenaConnected: boolean;
    ethereumConnected: boolean;
    relayerConnected: boolean;
  }> {
    try {
      // Catena 브릿지 컨트랙트 연결 확인
      let catenaConnected = false;
      try {
        await this.catenaBridgeContract.getSupportedTokens();
        catenaConnected = true;
      } catch (e) {
        logger.error('[CatenaEthereumBridge] Catena bridge contract not connected:', e);
      }
      
      // Ethereum 브릿지 컨트랙트 연결 확인
      let ethereumConnected = false;
      try {
        await this.ethereumBridgeContract.getSupportedTokens();
        ethereumConnected = true;
      } catch (e) {
        logger.error('[CatenaEthereumBridge] Ethereum bridge contract not connected:', e);
      }
      
      // 릴레이어 API 연결 확인
      let relayerConnected = false;
      try {
        const response = await fetch(`${this.relayerApi}/health`);
        relayerConnected = response.ok;
      } catch (e) {
        logger.error('[CatenaEthereumBridge] Relayer API not connected:', e);
      }
      
      return {
        catenaConnected,
        ethereumConnected,
        relayerConnected
      };
    } catch (error) {
      logger.error(`[CatenaEthereumBridge] Check bridge status failed:`, error);
      return {
        catenaConnected: false,
        ethereumConnected: false,
        relayerConnected: false
      };
    }
  }
}

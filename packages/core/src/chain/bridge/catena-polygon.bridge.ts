/**
 * Catena-Polygon 브릿지 구현
 * 
 * Catena 체인과 Polygon 체인 간의 자산 이동을 위한 브릿지 제공자 구현
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
import { AddressValidator } from '../../utils/validation';
import { convertToWei, convertFromWei } from '../../utils/conversion';

/**
 * Catena-Polygon 브릿지 컨트랙트 ABI
 */
const BRIDGE_ABI = [
  // 이벤트 로그
  'event Deposit(address indexed token, address indexed sender, uint256 amount, bytes32 transactionId, uint256 destinationChainId)',
  'event Withdrawal(address indexed token, address indexed recipient, uint256 amount, bytes32 transactionId)',
  'event TokenMapped(address indexed rootToken, address indexed childToken, bytes32 tokenType)',
  
  // 토큰 브릿지 함수
  'function depositFor(address user, address rootToken, bytes calldata depositData) external',
  'function deposit(address rootToken, bytes calldata depositData) external',
  'function withdraw(bytes calldata withdrawData) external',
  'function exit(bytes calldata inputData) external',
  
  // 상태 조회 함수
  'function rootToChildToken(address rootToken) external view returns (address)',
  'function childToRootToken(address childToken) external view returns (address)',
  'function getTransaction(bytes32 transactionId) external view returns (address token, address sender, address recipient, uint256 amount, uint8 status, uint256 destinationChainId)',
  'function isTokenMapped(address rootToken) external view returns (bool)',
  'function isTokenMappedAndDepositable(address rootToken) external view returns (bool)'
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
 * Polygon 네트워크의 브릿지 컨트랙트 주소
 */
const POLYGON_BRIDGE_CONTRACT = {
  mainnet: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77', // Polygon PoS 브릿지 컨트랙트
  testnet: '0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2'  // Mumbai 테스트넷 브릿지 컨트랙트
};

/**
 * Catena 네트워크의 브릿지 컨트랙트 주소
 */
const CATENA_BRIDGE_CONTRACT = {
  mainnet: '0x9a8d3f500ab9718afafc153fa51258ec0b8aa51a', // 가상 주소 (실제 배포 시 변경)
  testnet: '0x789c00e994a15e00a7f4c1df219ba331e39a6385'  // 가상 주소 (실제 배포 시 변경)
};

/**
 * Polygon 메인넷 및 테스트넷 체인 ID
 */
const POLYGON_CHAIN_ID = {
  mainnet: 137,
  testnet: 80001
};

/**
 * Catena 메인넷 및 테스트넷 체인 ID
 */
const CATENA_CHAIN_ID = {
  mainnet: 1000,
  testnet: 9000
};

/**
 * 릴레이어 서비스 API 엔드포인트
 */
const RELAYER_API = {
  mainnet: 'https://polygon-bridge-relayer.creatachain.com/api',
  testnet: 'https://testnet-polygon-bridge-relayer.creatachain.com/api'
};

/**
 * 브릿지 트랜잭션 상태 코드
 */
enum BridgeStatusCode {
  PENDING = 0,
  CONFIRMED_ON_SOURCE = 1,
  CONFIRMED_ON_TARGET = 2,
  COMPLETED = 3,
  FAILED = 4,
  CANCELED = 5
}

/**
 * Catena-Polygon 브릿지 제공자 구현 클래스
 */
export class CatenaPolygonBridge implements BridgeProvider {
  private catenaProvider: ethers.Provider;
  private polygonProvider: ethers.Provider;
  private catenaBridgeContract: ethers.Contract;
  private polygonBridgeContract: ethers.Contract;
  private isMainnet: boolean;
  private relayerApi: string;
  private polygonChainId: number;
  private catenaChainId: number;
  private supportedTokens: Map<string, string> = new Map(); // 원본 토큰 주소 -> 타겟 토큰 주소 매핑

  /**
   * Catena-Polygon 브릿지 제공자 생성자
   * 
   * @param catenaProvider - Catena 네트워크 프로바이더
   * @param polygonProvider - Polygon 네트워크 프로바이더
   * @param isMainnet - Mainnet 여부 (true: mainnet, false: testnet)
   */
  constructor(
    catenaProvider: ethers.Provider,
    polygonProvider: ethers.Provider,
    isMainnet: boolean = false
  ) {
    this.catenaProvider = catenaProvider;
    this.polygonProvider = polygonProvider;
    this.isMainnet = isMainnet;
    this.relayerApi = isMainnet ? RELAYER_API.mainnet : RELAYER_API.testnet;
    this.polygonChainId = isMainnet ? POLYGON_CHAIN_ID.mainnet : POLYGON_CHAIN_ID.testnet;
    this.catenaChainId = isMainnet ? CATENA_CHAIN_ID.mainnet : CATENA_CHAIN_ID.testnet;

    // 브릿지 컨트랙트 초기화
    const catenaBridgeAddress = isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet;
    const polygonBridgeAddress = isMainnet ? POLYGON_BRIDGE_CONTRACT.mainnet : POLYGON_BRIDGE_CONTRACT.testnet;

    this.catenaBridgeContract = new ethers.Contract(catenaBridgeAddress, BRIDGE_ABI, this.catenaProvider);
    this.polygonBridgeContract = new ethers.Contract(polygonBridgeAddress, BRIDGE_ABI, this.polygonProvider);
    
    // 지원 토큰 목록 초기화
    this.initSupportedTokens();
  }

  /**
   * 지원 토큰 정보 초기화
   * 브릿지가 지원하는 토큰 목록을 가져와 내부 맵에 저장
   */
  private async initSupportedTokens(): Promise<void> {
    try {
      // 릴레이어 API에서 지원 토큰 목록 가져오기 (실제 구현 시 컨트랙트 호출로 대체)
      const response = await fetch(`${this.relayerApi}/supported-tokens`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 토큰 매핑 정보 저장
      for (const token of data.tokens) {
        if (token.catenaAddress && token.polygonAddress) {
          this.supportedTokens.set(
            token.catenaAddress.toLowerCase(), 
            token.polygonAddress.toLowerCase()
          );
          
          // 역방향 매핑도 저장
          this.supportedTokens.set(
            token.polygonAddress.toLowerCase(), 
            token.catenaAddress.toLowerCase()
          );
        }
      }
      
      logger.info(`[CatenaPolygonBridge] ${this.supportedTokens.size / 2} supported tokens initialized`);
    } catch (error) {
      logger.error('[CatenaPolygonBridge] Failed to initialize supported tokens:', error);
      
      // 에러 발생 시 기본 토큰 매핑 하드코딩 (예시)
      const defaultTokens = [
        {
          catena: '0x123456789abcdef123456789abcdef123456789a',
          polygon: '0x987654321fedcba987654321fedcba987654321'
        },
        {
          catena: '0xabcdef123456789abcdef123456789abcdef1234',
          polygon: '0xfedcba987654321fedcba987654321fedcba9876'
        }
      ];
      
      for (const token of defaultTokens) {
        this.supportedTokens.set(token.catena.toLowerCase(), token.polygon.toLowerCase());
        this.supportedTokens.set(token.polygon.toLowerCase(), token.catena.toLowerCase());
      }
      
      logger.info(`[CatenaPolygonBridge] ${defaultTokens.length} default tokens initialized`);
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
   * @returns Polygon 체인 유형
   */
  getTargetChain(): ChainType {
    return ChainType.POLYGON;
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
      
      // 캐시된 매핑이 있으면 사용
      if (this.supportedTokens.has(lowerCaseAddress)) {
        return this.supportedTokens.get(lowerCaseAddress) as string;
      }
      
      // 캐시된 매핑이 없으면 컨트랙트에서 조회
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Polygon 방향의 토큰 매핑 확인
        try {
          const childToken = await this.catenaBridgeContract.rootToChildToken(tokenAddress);
          if (childToken && childToken !== ethers.ZeroAddress) {
            // 매핑 캐시에 추가
            this.supportedTokens.set(lowerCaseAddress, childToken.toLowerCase());
            this.supportedTokens.set(childToken.toLowerCase(), lowerCaseAddress);
            return childToken;
          }
        } catch (error) {
          logger.error(`[CatenaPolygonBridge] Failed to get mapped token from contract:`, error);
        }
      } else {
        // Polygon -> Catena 방향의 토큰 매핑 확인
        try {
          const rootToken = await this.polygonBridgeContract.childToRootToken(tokenAddress);
          if (rootToken && rootToken !== ethers.ZeroAddress) {
            // 매핑 캐시에 추가
            this.supportedTokens.set(lowerCaseAddress, rootToken.toLowerCase());
            this.supportedTokens.set(rootToken.toLowerCase(), lowerCaseAddress);
            return rootToken;
          }
        } catch (error) {
          logger.error(`[CatenaPolygonBridge] Failed to get mapped token from contract:`, error);
        }
      }
      
      // 매핑 정보가 없으면 릴레이어 API에서 확인
      try {
        const response = await fetch(`${this.relayerApi}/token-mapping?address=${tokenAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.mappedToken && data.mappedToken !== ethers.ZeroAddress) {
            // 매핑 캐시에 추가
            const mappedToken = data.mappedToken.toLowerCase();
            this.supportedTokens.set(lowerCaseAddress, mappedToken);
            this.supportedTokens.set(mappedToken, lowerCaseAddress);
            return data.mappedToken;
          }
        }
      } catch (error) {
        logger.error(`[CatenaPolygonBridge] Failed to get mapped token from API:`, error);
      }
      
      throw new Error(`No token mapping found for ${tokenAddress}`);
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Failed to get mapped token for ${tokenAddress}:`, error);
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
      // 릴레이어 API에서 지원 토큰 목록 가져오기
      const response = await fetch(`${this.relayerApi}/supported-tokens`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const assets: BridgeAsset[] = [];
      
      for (const token of data.tokens) {
        // 소스 체인에 따라 토큰 주소 설정
        const sourceTokenAddress = sourceChain === ChainType.CATENA ? token.catenaAddress : token.polygonAddress;
        const targetTokenAddress = sourceChain === ChainType.CATENA ? token.polygonAddress : token.catenaAddress;
        
        if (!sourceTokenAddress || !targetTokenAddress) {
          continue;
        }
        
        // 토큰 상세 정보 가져오기
        const sourceTokenInfo = await this.getTokenInfo(sourceTokenAddress, sourceChain);
        const targetTokenInfo = await this.getTokenInfo(
          targetTokenAddress, 
          sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA
        );
        
        assets.push({
          sourceToken: {
            address: sourceTokenAddress,
            ...sourceTokenInfo
          },
          targetToken: {
            address: targetTokenAddress,
            ...targetTokenInfo
          },
          sourceChain,
          targetChain: sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA
        });
      }
      
      return assets;
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Failed to get supported assets:`, error);
      
      // 에러 발생 시 캐시된 토큰 정보로 응답
      const assets: BridgeAsset[] = [];
      const processedTokens = new Set<string>();
      
      for (const [source, target] of this.supportedTokens.entries()) {
        // 중복 처리 방지 (양방향 매핑이 모두 캐시되어 있음)
        if (processedTokens.has(source)) {
          continue;
        }
        
        const sourceChainType = source.startsWith('0x123') ? ChainType.CATENA : ChainType.POLYGON;
        if (sourceChainType !== sourceChain) {
          continue;
        }
        
        try {
          const sourceTokenInfo = await this.getTokenInfo(source, sourceChain);
          const targetTokenInfo = await this.getTokenInfo(
            target, 
            sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA
          );
          
          assets.push({
            sourceToken: {
              address: source,
              ...sourceTokenInfo
            },
            targetToken: {
              address: target,
              ...targetTokenInfo
            },
            sourceChain,
            targetChain: sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA
          });
          
          // 처리됨으로 표시
          processedTokens.add(source);
          processedTokens.add(target);
        } catch (error) {
          logger.error(`[CatenaPolygonBridge] Failed to get token info:`, error);
        }
      }
      
      return assets;
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
        : this.polygonProvider;
      
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
      logger.error(`[CatenaPolygonBridge] Failed to get token info for ${tokenAddress}:`, error);
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
        : this.polygonProvider;
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      
      return balance.toString();
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Failed to get token balance:`, error);
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
        : this.polygonProvider;
      
      const bridgeAddress = chainType === ChainType.CATENA 
        ? (this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet)
        : (this.isMainnet ? POLYGON_BRIDGE_CONTRACT.mainnet : POLYGON_BRIDGE_CONTRACT.testnet);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(walletAddress, bridgeAddress);
      
      return {
        allowance: allowance.toString(),
        isApproved: !allowance.isZero() // allowance > 0 확인
      };
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Failed to get token allowance:`, error);
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
        : (this.isMainnet ? POLYGON_BRIDGE_CONTRACT.mainnet : POLYGON_BRIDGE_CONTRACT.testnet);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      const tx = await tokenContract.approve(bridgeAddress, amount);
      const receipt = await tx.wait();
      
      logger.info(`[CatenaPolygonBridge] Token approval transaction: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Failed to approve token:`, error);
      throw new Error(`Failed to approve token: ${error.message}`);
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
      
      // 타겟 토큰 주소 가져오기
      const targetTokenAddress = await this.getMappedToken(sourceTokenAddress, sourceChain);
      if (!targetTokenAddress) {
        throw new Error(`No mapped token found for ${sourceTokenAddress}`);
      }
      
      // 허용량 확인
      const allowance = await this.getTokenAllowance(
        sourceTokenAddress, 
        await signer.getAddress(), 
        sourceChain
      );
      
      if (!allowance.isApproved) {
        // 허용량이 부족하면 먼저 approve 요청
        await this.approveToken(sourceTokenAddress, amount, sourceChain, signer);
      }
      
      let txHash: string;
      let transactionId: string;
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Polygon 전송 (Deposit)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          signer
        );
        
        // depositData 인코딩 (amount + recipient address)
        const depositData = ethers.solidityPacked(
          ['uint256', 'address'],
          [amount, recipientAddress]
        );
        
        // deposit 트랜잭션 생성
        const tx = await bridgeContract.deposit(sourceTokenAddress, depositData);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        
        // 이벤트에서 transactionId 추출
        const event = receipt.logs
          .map(log => {
            try {
              return bridgeContract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .find(event => event && event.name === 'Deposit');
        
        if (!event) {
          throw new Error('Deposit event not found in transaction logs');
        }
        
        transactionId = event.args.transactionId;
      } else {
        // Polygon -> Catena 전송 (Withdraw)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? POLYGON_BRIDGE_CONTRACT.mainnet : POLYGON_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          signer
        );
        
        // withdrawData 인코딩 (amount + recipient address)
        const withdrawData = ethers.solidityPacked(
          ['uint256', 'address'],
          [amount, recipientAddress]
        );
        
        // withdraw 트랜잭션 생성
        const tx = await bridgeContract.withdraw(withdrawData);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        
        // 이벤트에서 transactionId 추출
        const event = receipt.logs
          .map(log => {
            try {
              return bridgeContract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .find(event => event && event.name === 'Withdrawal');
        
        if (!event) {
          throw new Error('Withdrawal event not found in transaction logs');
        }
        
        transactionId = event.args.transactionId;
      }
      
      // 릴레이 요청 시작 (백그라운드로 처리)
      this.requestRelay(transactionId, sourceChain)
        .then(() => logger.info(`[CatenaPolygonBridge] Relay requested for transaction ${transactionId}`))
        .catch(error => logger.error(`[CatenaPolygonBridge] Failed to request relay for transaction ${transactionId}:`, error));
      
      // 트랜잭션 상태 반환
      return {
        id: transactionId,
        txHash,
        sourceChain,
        targetChain: sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA,
        sourceToken: sourceTokenAddress,
        targetToken: targetTokenAddress,
        sender: await signer.getAddress(),
        recipient: recipientAddress,
        amount,
        status: BridgeTransactionStatus.PENDING,
        timestamp: Math.floor(Date.now() / 1000),
        completedAt: null,
        relayerFee: '0' // Polygon PoS 브릿지는 별도의 릴레이어 수수료가 없음
      };
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Bridge asset failed:`, error);
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
      // 릴레이어 API에서 트랜잭션 상태 조회
      const response = await fetch(`${this.relayerApi}/transaction-status?id=${transactionId}`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // API 응답에서 상태 매핑
      let status: BridgeTransactionStatus;
      switch (data.status) {
        case 'PENDING':
          status = BridgeTransactionStatus.PENDING;
          break;
        case 'PROCESSING':
          status = BridgeTransactionStatus.PROCESSING;
          break;
        case 'COMPLETED':
          status = BridgeTransactionStatus.COMPLETED;
          break;
        case 'FAILED':
          status = BridgeTransactionStatus.FAILED;
          break;
        case 'CANCELED':
          status = BridgeTransactionStatus.CANCELED;
          break;
        default:
          status = BridgeTransactionStatus.UNKNOWN;
      }
      
      return {
        id: transactionId,
        txHash: data.txHash,
        sourceChain: data.sourceChain === 'CATENA' ? ChainType.CATENA : ChainType.POLYGON,
        targetChain: data.targetChain === 'CATENA' ? ChainType.CATENA : ChainType.POLYGON,
        sourceToken: data.sourceToken,
        targetToken: data.targetToken,
        sender: data.sender,
        recipient: data.recipient,
        amount: data.amount,
        status,
        timestamp: data.timestamp,
        completedAt: data.completedAt,
        relayerFee: data.relayerFee || '0'
      };
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Get transaction status failed:`, error);
      
      // API 실패 시 블록체인에서 직접 조회 시도
      try {
        // 소스 체인의 브릿지 컨트랙트
        const sourceBridgeContract = sourceChain === ChainType.CATENA 
          ? this.catenaBridgeContract 
          : this.polygonBridgeContract;
        
        // 트랜잭션 정보 조회
        const tx = await sourceBridgeContract.getTransaction(transactionId);
        
        // 컨트랙트 반환 구조에 따라 파싱
        const [token, sender, recipient, amount, statusCode, destinationChainId] = tx;
        
        // 상태 코드를 BridgeTransactionStatus로 변환
        let status: BridgeTransactionStatus;
        switch (statusCode) {
          case BridgeStatusCode.PENDING:
            status = BridgeTransactionStatus.PENDING;
            break;
          case BridgeStatusCode.CONFIRMED_ON_SOURCE:
            status = BridgeTransactionStatus.PROCESSING;
            break;
          case BridgeStatusCode.CONFIRMED_ON_TARGET:
            status = BridgeTransactionStatus.PROCESSING;
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
        
        return {
          id: transactionId,
          txHash: '', // 원본 트랜잭션 해시는 블록체인 조회만으로는 알 수 없음
          sourceChain,
          targetChain: sourceChain === ChainType.CATENA ? ChainType.POLYGON : ChainType.CATENA,
          sourceToken: token,
          targetToken,
          sender,
          recipient,
          amount: amount.toString(),
          status,
          timestamp: 0, // 블록체인만으로는 정확한 타임스탬프를 알 수 없음
          completedAt: status === BridgeTransactionStatus.COMPLETED ? Math.floor(Date.now() / 1000) : null,
          relayerFee: '0'
        };
      } catch (blockchainError) {
        logger.error(`[CatenaPolygonBridge] Blockchain fallback for transaction status failed:`, blockchainError);
        throw new Error(`Failed to get transaction status: ${error.message}`);
      }
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
        // API 응답 상태를 BridgeTransactionStatus로 매핑
        let status: BridgeTransactionStatus;
        switch (tx.status) {
          case 'PENDING':
            status = BridgeTransactionStatus.PENDING;
            break;
          case 'PROCESSING':
            status = BridgeTransactionStatus.PROCESSING;
            break;
          case 'COMPLETED':
            status = BridgeTransactionStatus.COMPLETED;
            break;
          case 'FAILED':
            status = BridgeTransactionStatus.FAILED;
            break;
          case 'CANCELED':
            status = BridgeTransactionStatus.CANCELED;
            break;
          default:
            status = BridgeTransactionStatus.UNKNOWN;
        }
        
        return {
          id: tx.transactionId,
          txHash: tx.txHash,
          sourceChain: tx.sourceChain === 'CATENA' ? ChainType.CATENA : ChainType.POLYGON,
          targetChain: tx.targetChain === 'CATENA' ? ChainType.CATENA : ChainType.POLYGON,
          sourceToken: tx.sourceToken,
          targetToken: tx.targetToken,
          sender: tx.sender,
          recipient: tx.recipient,
          amount: tx.amount,
          status,
          timestamp: tx.timestamp,
          completedAt: tx.completedAt,
          relayerFee: tx.relayerFee || '0'
        };
      });
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Get transaction history failed:`, error);
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
      // Polygon PoS 브릿지는 브릿지 수수료가 없음
      const bridgeFee = '0';
      
      // 릴레이어 수수료도 없음
      const relayerFee = '0';
      
      // 가스비 추정
      let gasEstimate: bigint;
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Polygon 방향 (deposit)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          this.catenaProvider
        );
        
        // depositData 인코딩 (amount + 더미 주소)
        const depositData = ethers.solidityPacked(
          ['uint256', 'address'],
          [amount, '0x0000000000000000000000000000000000000000']
        );
        
        // 가스 추정
        const gasLimit = await bridgeContract.deposit.estimateGas(
          sourceTokenAddress, 
          depositData
        );
        
        const gasPrice = await this.catenaProvider.getFeeData();
        gasEstimate = gasLimit * (gasPrice.gasPrice || BigInt(0));
      } else {
        // Polygon -> Catena 방향 (withdraw)
        const bridgeContract = new ethers.Contract(
          this.isMainnet ? POLYGON_BRIDGE_CONTRACT.mainnet : POLYGON_BRIDGE_CONTRACT.testnet,
          BRIDGE_ABI,
          this.polygonProvider
        );
        
        // withdrawData 인코딩 (amount + 더미 주소)
        const withdrawData = ethers.solidityPacked(
          ['uint256', 'address'],
          [amount, '0x0000000000000000000000000000000000000000']
        );
        
        // 가스 추정
        const gasLimit = await bridgeContract.withdraw.estimateGas(
          withdrawData
        );
        
        const gasPrice = await this.polygonProvider.getFeeData();
        gasEstimate = gasLimit * (gasPrice.gasPrice || BigInt(0));
      }
      
      // 총 비용 (가스비만 있음)
      const totalFee = gasEstimate.toString();
      
      return {
        bridgeFee,
        relayerFee,
        gasEstimate: gasEstimate.toString(),
        totalFee
      };
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Estimate bridge fee failed:`, error);
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
          sourceChain: sourceChain === ChainType.CATENA ? 'CATENA' : 'POLYGON'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Relay request failed: ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Request relay failed:`, error);
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
    polygonConnected: boolean;
    relayerConnected: boolean;
  }> {
    try {
      // Catena 브릿지 컨트랙트 연결 확인
      let catenaConnected = false;
      try {
        // 간단한 view 함수 호출로 연결 확인
        await this.catenaBridgeContract.isTokenMapped(ethers.ZeroAddress);
        catenaConnected = true;
      } catch (e) {
        logger.error('[CatenaPolygonBridge] Catena bridge contract not connected:', e);
      }
      
      // Polygon 브릿지 컨트랙트 연결 확인
      let polygonConnected = false;
      try {
        // 간단한 view 함수 호출로 연결 확인
        await this.polygonBridgeContract.childToRootToken(ethers.ZeroAddress);
        polygonConnected = true;
      } catch (e) {
        logger.error('[CatenaPolygonBridge] Polygon bridge contract not connected:', e);
      }
      
      // 릴레이어 API 연결 확인
      let relayerConnected = false;
      try {
        const response = await fetch(`${this.relayerApi}/health`);
        relayerConnected = response.ok;
      } catch (e) {
        logger.error('[CatenaPolygonBridge] Relayer API not connected:', e);
      }
      
      return {
        catenaConnected,
        polygonConnected,
        relayerConnected
      };
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Check bridge status failed:`, error);
      return {
        catenaConnected: false,
        polygonConnected: false,
        relayerConnected: false
      };
    }
  }
  
  /**
   * 출금 완료 확인 (Polygon PoS 브릿지 특화 기능)
   * Polygon에서 Catena로 자산을 이동할 때, 사용자는 먼저 Polygon에서 출금(withdraw)하고
   * 나중에 Catena에서 출금 완료(exit)를 해야 합니다.
   * 
   * @param transactionId - 출금 트랜잭션 ID
   * @param recipient - 수신자 주소
   * @param signer - 서명자 (지갑)
   * @returns 트랜잭션 해시
   */
  async exitTransaction(
    transactionId: string,
    recipient: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      // Catena 브릿지 컨트랙트에 연결
      const bridgeContract = new ethers.Contract(
        this.isMainnet ? CATENA_BRIDGE_CONTRACT.mainnet : CATENA_BRIDGE_CONTRACT.testnet,
        BRIDGE_ABI,
        signer
      );
      
      // 트랜잭션 정보 가져오기
      const tx = await this.getTransactionStatus(transactionId, ChainType.POLYGON);
      
      // exit 트랜잭션 호출을 위한 데이터 준비
      const inputData = ethers.solidityPacked(
        ['bytes32', 'address', 'uint256'],
        [transactionId, recipient, tx.amount]
      );
      
      // exit 트랜잭션 실행
      const exitTx = await bridgeContract.exit(inputData);
      const receipt = await exitTx.wait();
      
      logger.info(`[CatenaPolygonBridge] Exit transaction completed: ${receipt.hash}`);
      
      // 트랜잭션 상태 업데이트
      this.requestRelay(transactionId, ChainType.POLYGON)
        .then(() => logger.info(`[CatenaPolygonBridge] Status update requested for transaction ${transactionId}`))
        .catch(error => logger.error(`[CatenaPolygonBridge] Failed to update status for transaction ${transactionId}:`, error));
      
      return receipt.hash;
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Exit transaction failed:`, error);
      throw new Error(`Exit transaction failed: ${error.message}`);
    }
  }
  
  /**
   * 출금 가능한 트랜잭션 목록 조회
   * Polygon에서 Catena로 자산을 이동하는 과정에서 출금 완료(exit)가 필요한 트랜잭션 목록
   * 
   * @param walletAddress - 지갑 주소
   * @returns 출금 가능한 트랜잭션 목록
   */
  async getExitableTransactions(walletAddress: string): Promise<BridgeTransaction[]> {
    try {
      const response = await fetch(`${this.relayerApi}/exitable-transactions?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.transactions.map(tx => {
        return {
          id: tx.transactionId,
          txHash: tx.txHash,
          sourceChain: ChainType.POLYGON,
          targetChain: ChainType.CATENA,
          sourceToken: tx.sourceToken,
          targetToken: tx.targetToken,
          sender: tx.sender,
          recipient: tx.recipient,
          amount: tx.amount,
          status: BridgeTransactionStatus.PROCESSING,
          timestamp: tx.timestamp,
          completedAt: null,
          relayerFee: '0'
        };
      });
    } catch (error) {
      logger.error(`[CatenaPolygonBridge] Get exitable transactions failed:`, error);
      throw new Error(`Get exitable transactions failed: ${error.message}`);
    }
  }
}

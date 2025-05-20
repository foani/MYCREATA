/**
 * Catena-Arbitrum 브릿지 구현
 * 
 * Catena 체인과 Arbitrum 체인 간의 자산 이동을 위한 브릿지 제공자 구현
 * 
 * 이 파일은 두 체인 네트워크 간의 크로스체인 트랜잭션을 처리하는 기능을 제공합니다.
 * Arbitrum의 특성에 맞는 브릿지 로직을 구현합니다.
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
 * Arbitrum 게이트웨이 컨트랙트 ABI
 */
const ARBITRUM_GATEWAY_ABI = [
  // 이벤트 로그
  'event DepositInitiated(address indexed l1Token, address indexed from, address indexed to, uint256 sequenceNumber, uint256 amount)',
  'event WithdrawalInitiated(address indexed l1Token, address indexed from, address indexed to, uint256 sequenceNumber, uint256 amount)',
  
  // 입출금 함수
  'function outboundTransfer(address l1Token, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data) external payable returns (bytes memory)',
  'function outboundTransferCustomRefund(address l1Token, address refundTo, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data) external payable returns (bytes memory)',
  'function getOutboundCalldata(address l1Token, address from, address to, uint256 amount, bytes memory data) external view returns (bytes memory)',
  
  // 상태 조회 함수
  'function getL2OutboundCalldata(address l1Token, address from, address to, uint256 amount, bytes memory data) external view returns (bytes memory)',
  'function calculateL2TokenAddress(address l1Token) external view returns (address)',
  'function getGateway(address l1Token) external view returns (address)',
  'function getOutboundCalldata(address _token, address _from, address _to, uint256 _amount, bytes calldata _data) external view returns (bytes memory)',
  'function getL2ToL1Calldata(bytes calldata _data) external pure returns (bytes memory)'
];

/**
 * Catena 게이트웨이 컨트랙트 ABI
 */
const CATENA_GATEWAY_ABI = [
  // 이벤트 로그
  'event DepositFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount)',
  'event WithdrawalFinalized(address indexed l1Token, address indexed l2Token, address indexed from, address to, uint256 amount)',
  
  // 기능 함수
  'function finalizeInboundTransfer(address l1Token, address from, address to, uint256 amount, bytes calldata data) external',
  'function getL1ERC20Balance(address l1Token, address account) external view returns (uint256)',
  'function getL1TokenBridge() external view returns (address)',
  'function getL2TokenBridge() external view returns (address)',
  'function getL1Token(address token) external view returns (address)',
  'function getL2Token(address token) external view returns (address)',
  'function withdraw(address token, uint256 amount, uint256 exitNum, bytes calldata extraData) external',
  'function initiateWithdraw(address token, uint256 amount) external',
  'function fastWithdraw(address token, uint256 amount, uint256 maxFee) external',
  'function getWithdrawStatus(uint256 exitNum) external view returns (uint8)',
];

/**
 * Arbitrum 게이트웨이 라우터 ABI
 */
const ARBITRUM_GATEWAY_ROUTER_ABI = [
  'function outboundTransfer(address token, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data) external payable returns (bytes memory)',
  'function outboundTransferCustomRefund(address token, address refundTo, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data) external payable returns (bytes memory)',
  'function getGateway(address token) external view returns (address)'
];

/**
 * Arbitrum 이더리움 브릿지 ABI
 */
const ARBITRUM_ETH_BRIDGE_ABI = [
  'function depositEth(uint256 maxSubmissionCost) external payable returns (uint256)',
  'function depositEthRetryable(address destAddr, uint256 maxSubmissionCost, uint256 maxGas, uint256 maxGasPrice) external payable returns (uint256)',
  'function outboundTransfer(address to, uint256 amount) external returns (bytes memory)',
  'function bridge() external view returns (address)'
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
 * Arbitrum 네트워크 컨트랙트 주소
 */
const ARBITRUM_CONTRACTS = {
  mainnet: {
    gateway: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',  // L1 Gateway Router
    ethBridge: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', // Arbitrum One Bridge
  },
  testnet: {
    gateway: '0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380',  // Goerli L1 Gateway Router
    ethBridge: '0x6BEbC4925716945D46F0Ec336D5C2564F419682C', // Arbitrum Goerli Bridge
  }
};

/**
 * Catena 네트워크 컨트랙트 주소
 */
const CATENA_CONTRACTS = {
  mainnet: {
    gateway: '0x5288c571fd7aD117beA99bF60FE0846C4E84F933',  // 메인넷 게이트웨이 주소 (가상)
  },
  testnet: {
    gateway: '0x1c6aA3743Fa79EAf9Ce165040ef3c6959bb3D1B2',  // 테스트넷 게이트웨이 주소 (가상)
  }
};

/**
 * 릴레이어 서비스 API 엔드포인트
 */
const RELAYER_API = {
  mainnet: 'https://arbitrum-bridge-relayer.creatachain.com/api',
  testnet: 'https://testnet-arbitrum-bridge-relayer.creatachain.com/api'
};

/**
 * 출금 트랜잭션 상태 코드
 */
enum WithdrawalStatusCode {
  NOT_FOUND = 0,
  PENDING = 1,
  CLAIMABLE = 2,
  COMPLETED = 3,
  FAILED = 4
}

/**
 * Catena-Arbitrum 브릿지 제공자 구현 클래스
 */
export class CatenaArbitrumBridge implements BridgeProvider {
  private catenaProvider: ethers.Provider;
  private arbitrumProvider: ethers.Provider;
  private catenaGatewayContract: ethers.Contract;
  private arbitrumGatewayContract: ethers.Contract;
  private arbitrumEthBridgeContract: ethers.Contract;
  private isMainnet: boolean;
  private relayerApi: string;
  private supportedTokens: Map<string, string> = new Map(); // 원본 토큰 주소 -> 타겟 토큰 주소 매핑

  /**
   * Catena-Arbitrum 브릿지 제공자 생성자
   * 
   * @param catenaProvider - Catena 네트워크 프로바이더
   * @param arbitrumProvider - Arbitrum 네트워크 프로바이더
   * @param isMainnet - Mainnet 여부 (true: mainnet, false: testnet)
   */
  constructor(
    catenaProvider: ethers.Provider,
    arbitrumProvider: ethers.Provider,
    isMainnet: boolean = false
  ) {
    this.catenaProvider = catenaProvider;
    this.arbitrumProvider = arbitrumProvider;
    this.isMainnet = isMainnet;
    this.relayerApi = isMainnet ? RELAYER_API.mainnet : RELAYER_API.testnet;

    // 게이트웨이 컨트랙트 초기화
    const catenaGatewayAddress = isMainnet ? CATENA_CONTRACTS.mainnet.gateway : CATENA_CONTRACTS.testnet.gateway;
    const arbitrumGatewayAddress = isMainnet ? ARBITRUM_CONTRACTS.mainnet.gateway : ARBITRUM_CONTRACTS.testnet.gateway;
    const arbitrumEthBridgeAddress = isMainnet ? ARBITRUM_CONTRACTS.mainnet.ethBridge : ARBITRUM_CONTRACTS.testnet.ethBridge;

    this.catenaGatewayContract = new ethers.Contract(catenaGatewayAddress, CATENA_GATEWAY_ABI, this.catenaProvider);
    this.arbitrumGatewayContract = new ethers.Contract(arbitrumGatewayAddress, ARBITRUM_GATEWAY_ROUTER_ABI, this.catenaProvider);
    this.arbitrumEthBridgeContract = new ethers.Contract(arbitrumEthBridgeAddress, ARBITRUM_ETH_BRIDGE_ABI, this.catenaProvider);
    
    // 지원 토큰 목록 초기화
    this.initSupportedTokens();
  }

  /**
   * 지원 토큰 정보 초기화
   * 브릿지가 지원하는 토큰 목록을 가져와 내부 맵에 저장
   */
  private async initSupportedTokens(): Promise<void> {
    try {
      // 릴레이어 API에서 지원 토큰 목록 가져오기
      const response = await fetch(`${this.relayerApi}/supported-tokens`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 토큰 매핑 정보 저장
      for (const token of data.tokens) {
        if (token.catenaAddress && token.arbitrumAddress) {
          this.supportedTokens.set(
            token.catenaAddress.toLowerCase(), 
            token.arbitrumAddress.toLowerCase()
          );
          
          // 역방향 매핑도 저장
          this.supportedTokens.set(
            token.arbitrumAddress.toLowerCase(), 
            token.catenaAddress.toLowerCase()
          );
        }
      }
      
      logger.info(`[CatenaArbitrumBridge] ${this.supportedTokens.size / 2} supported tokens initialized`);
    } catch (error) {
      logger.error('[CatenaArbitrumBridge] Failed to initialize supported tokens:', error);
      
      // 에러 발생 시 기본 토큰 매핑 하드코딩 (예시)
      const defaultTokens = [
        {
          catena: '0x123456789abcdef123456789abcdef123456789a',
          arbitrum: '0x987654321fedcba987654321fedcba987654321'
        },
        {
          catena: '0xabcdef123456789abcdef123456789abcdef1234',
          arbitrum: '0xfedcba987654321fedcba987654321fedcba9876'
        }
      ];
      
      for (const token of defaultTokens) {
        this.supportedTokens.set(token.catena.toLowerCase(), token.arbitrum.toLowerCase());
        this.supportedTokens.set(token.arbitrum.toLowerCase(), token.catena.toLowerCase());
      }
      
      logger.info(`[CatenaArbitrumBridge] ${defaultTokens.length} default tokens initialized`);
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
   * @returns Arbitrum 체인 유형
   */
  getTargetChain(): ChainType {
    return ChainType.ARBITRUM;
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
      
      // 캐시된 매핑이 없으면 컨트랙트 또는 API에서 조회
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Arbitrum 방향
        try {
          // Arbitrum 게이트웨이에 연결할 수 있는 gateway 주소 가져오기
          const gatewayAddress = await this.arbitrumGatewayContract.getGateway(tokenAddress);
          
          // 게이트웨이를 통해 Arbitrum L2 토큰 주소 계산
          const gateway = new ethers.Contract(gatewayAddress, ARBITRUM_GATEWAY_ABI, this.catenaProvider);
          const l2TokenAddress = await gateway.calculateL2TokenAddress(tokenAddress);
          
          if (l2TokenAddress && l2TokenAddress !== ethers.ZeroAddress) {
            // 매핑 캐시에 추가
            this.supportedTokens.set(lowerCaseAddress, l2TokenAddress.toLowerCase());
            this.supportedTokens.set(l2TokenAddress.toLowerCase(), lowerCaseAddress);
            return l2TokenAddress;
          }
        } catch (error) {
          logger.error(`[CatenaArbitrumBridge] Failed to get mapped token from contract:`, error);
        }
      } else {
        // Arbitrum -> Catena 방향
        try {
          // Catena 게이트웨이를 통해 L1 토큰 주소 확인
          const l1TokenAddress = await this.catenaGatewayContract.getL1Token(tokenAddress);
          
          if (l1TokenAddress && l1TokenAddress !== ethers.ZeroAddress) {
            // 매핑 캐시에 추가
            this.supportedTokens.set(lowerCaseAddress, l1TokenAddress.toLowerCase());
            this.supportedTokens.set(l1TokenAddress.toLowerCase(), lowerCaseAddress);
            return l1TokenAddress;
          }
        } catch (error) {
          logger.error(`[CatenaArbitrumBridge] Failed to get mapped token from contract:`, error);
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
        logger.error(`[CatenaArbitrumBridge] Failed to get mapped token from API:`, error);
      }
      
      throw new Error(`No token mapping found for ${tokenAddress}`);
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Failed to get mapped token for ${tokenAddress}:`, error);
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
        const sourceTokenAddress = sourceChain === ChainType.CATENA ? token.catenaAddress : token.arbitrumAddress;
        const targetTokenAddress = sourceChain === ChainType.CATENA ? token.arbitrumAddress : token.catenaAddress;
        
        if (!sourceTokenAddress || !targetTokenAddress) {
          continue;
        }
        
        // 토큰 상세 정보 가져오기
        const sourceTokenInfo = await this.getTokenInfo(sourceTokenAddress, sourceChain);
        const targetTokenInfo = await this.getTokenInfo(
          targetTokenAddress, 
          sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA
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
          targetChain: sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA
        });
      }
      
      return assets;
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Failed to get supported assets:`, error);
      
      // 에러 발생 시 캐시된 토큰 정보로 응답
      const assets: BridgeAsset[] = [];
      const processedTokens = new Set<string>();
      
      for (const [source, target] of this.supportedTokens.entries()) {
        // 중복 처리 방지 (양방향 매핑이 모두 캐시되어 있음)
        if (processedTokens.has(source)) {
          continue;
        }
        
        const sourceChainType = source.startsWith('0x123') ? ChainType.CATENA : ChainType.ARBITRUM;
        if (sourceChainType !== sourceChain) {
          continue;
        }
        
        try {
          const sourceTokenInfo = await this.getTokenInfo(source, sourceChain);
          const targetTokenInfo = await this.getTokenInfo(
            target, 
            sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA
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
            targetChain: sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA
          });
          
          // 처리됨으로 표시
          processedTokens.add(source);
          processedTokens.add(target);
        } catch (error) {
          logger.error(`[CatenaArbitrumBridge] Failed to get token info:`, error);
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
        : this.arbitrumProvider;
      
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
      logger.error(`[CatenaArbitrumBridge] Failed to get token info for ${tokenAddress}:`, error);
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
        : this.arbitrumProvider;
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      
      return balance.toString();
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Failed to get token balance:`, error);
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
      if (chainType === ChainType.CATENA) {
        // Catena -> Arbitrum 방향에서는 게이트웨이 라우터에 대한 허용량 확인
        const gatewayAddress = await this.arbitrumGatewayContract.getGateway(tokenAddress);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.catenaProvider);
        const allowance = await tokenContract.allowance(walletAddress, gatewayAddress);
        
        return {
          allowance: allowance.toString(),
          isApproved: !allowance.isZero()
        };
      } else {
        // Arbitrum -> Catena 방향에서는 게이트웨이 라우터에 대한 허용량 확인
        const catenaGatewayAddress = this.isMainnet ? CATENA_CONTRACTS.mainnet.gateway : CATENA_CONTRACTS.testnet.gateway;
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.arbitrumProvider);
        const allowance = await tokenContract.allowance(walletAddress, catenaGatewayAddress);
        
        return {
          allowance: allowance.toString(),
          isApproved: !allowance.isZero()
        };
      }
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Failed to get token allowance:`, error);
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
      let spender: string;
      
      if (chainType === ChainType.CATENA) {
        // Catena -> Arbitrum 방향에서는 Arbitrum 게이트웨이를 승인
        const gatewayAddress = await this.arbitrumGatewayContract.getGateway(tokenAddress);
        spender = gatewayAddress;
      } else {
        // Arbitrum -> Catena 방향에서는 Catena 게이트웨이를 승인
        spender = this.isMainnet ? CATENA_CONTRACTS.mainnet.gateway : CATENA_CONTRACTS.testnet.gateway;
      }
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await tokenContract.approve(spender, amount);
      const receipt = await tx.wait();
      
      logger.info(`[CatenaArbitrumBridge] Token approval transaction: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Failed to approve token:`, error);
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
      
      // ETH 처리와 토큰 처리를 구분
      const isEth = sourceTokenAddress.toLowerCase() === ethers.ZeroAddress;
      
      // 타겟 토큰 주소 가져오기 (ETH는 ETH로 매핑)
      let targetTokenAddress: string;
      if (isEth) {
        targetTokenAddress = ethers.ZeroAddress;
      } else {
        targetTokenAddress = await this.getMappedToken(sourceTokenAddress, sourceChain);
        if (!targetTokenAddress) {
          throw new Error(`No mapped token found for ${sourceTokenAddress}`);
        }
      }
      
      let txHash: string;
      let transactionId: string;
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Arbitrum 방향
        if (isEth) {
          // ETH 브릿지
          const maxSubmissionCost = await this.estimateSubmissionCost();
          const bridgeValue = BigInt(amount) + maxSubmissionCost;
          
          const tx = await this.arbitrumEthBridgeContract.connect(signer).depositEth(
            maxSubmissionCost,
            { value: bridgeValue }
          );
          
          const receipt = await tx.wait();
          txHash = receipt.hash;
          
          // Arbitrum 브릿지의 경우 transactionId는 이벤트에서 sequenceNumber를 사용
          const event = receipt.logs
            .map(log => {
              try {
                const abi = ['event DepositInitiated(address indexed l1Token, address indexed from, address indexed to, uint256 sequenceNumber, uint256 amount)'];
                const iface = new ethers.Interface(abi);
                return iface.parseLog(log);
              } catch (e) {
                return null;
              }
            })
            .find(event => event && event.name === 'DepositInitiated');
          
          if (!event) {
            throw new Error('DepositInitiated event not found in transaction logs');
          }
          
          transactionId = event.args.sequenceNumber.toString();
        } else {
          // ERC20 토큰 브릿지
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
          
          // Arbitrum 게이트웨이 라우터에서 토큰별 게이트웨이 가져오기
          const gatewayAddress = await this.arbitrumGatewayContract.getGateway(sourceTokenAddress);
          const gateway = new ethers.Contract(gatewayAddress, ARBITRUM_GATEWAY_ABI, signer);
          
          // L2 가스 관련 값 (Arbitrum 특성)
          const maxGas = 1000000n; // 예상 L2 가스 한도
          const gasPriceBid = 100000000n; // L2 가스 가격 (wei)
          const maxSubmissionCost = 100000000000000n; // 최대 제출 비용
          
          // 디포짓 트랜잭션 실행
          const tx = await gateway.outboundTransfer(
            sourceTokenAddress,
            recipientAddress,
            amount,
            maxGas,
            gasPriceBid,
            "0x", // 추가 데이터 없음
            { value: maxSubmissionCost } // 트랜잭션 수수료
          );
          
          const receipt = await tx.wait();
          txHash = receipt.hash;
          
          // Arbitrum 트랜잭션 ID 추출
          const event = receipt.logs
            .map(log => {
              try {
                return gateway.interface.parseLog(log);
              } catch (e) {
                return null;
              }
            })
            .find(event => event && event.name === 'DepositInitiated');
          
          if (!event) {
            throw new Error('DepositInitiated event not found in transaction logs');
          }
          
          transactionId = event.args.sequenceNumber.toString();
        }
      } else {
        // Arbitrum -> Catena 방향
        if (isEth) {
          // Arbitrum 위에서 ETH 출금
          const arbitrumEthBridge = new ethers.Contract(
            this.isMainnet ? '0x0000000000000000000000000000000000000064' : '0x0000000000000000000000000000000000000064', // Arbitrum의 L2 Predeploy 주소
            ['function withdraw(address to) external payable'],
            signer
          );
          
          const tx = await arbitrumEthBridge.withdraw(recipientAddress, { value: amount });
          const receipt = await tx.wait();
          txHash = receipt.hash;
          
          // 트랜잭션 ID는 해시로 대체
          transactionId = receipt.hash;
        } else {
          // ERC20 토큰 출금
          // Catena 게이트웨이 컨트랙트에 연결
          const catenaGateway = new ethers.Contract(
            this.isMainnet ? CATENA_CONTRACTS.mainnet.gateway : CATENA_CONTRACTS.testnet.gateway,
            CATENA_GATEWAY_ABI,
            signer
          );
          
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
          
          // 일반 출금 시작
          const tx = await catenaGateway.initiateWithdraw(sourceTokenAddress, amount);
          const receipt = await tx.wait();
          txHash = receipt.hash;
          
          // 트랜잭션 ID 추출
          const event = receipt.logs
            .map(log => {
              try {
                return catenaGateway.interface.parseLog(log);
              } catch (e) {
                return null;
              }
            })
            .find(event => event && event.name === 'WithdrawalInitiated');
          
          if (!event) {
            throw new Error('WithdrawalInitiated event not found in transaction logs');
          }
          
          transactionId = event.args.sequenceNumber ? event.args.sequenceNumber.toString() : receipt.hash;
        }
      }
      
      // 릴레이 요청 시작 (백그라운드로 처리)
      this.requestRelay(transactionId, sourceChain)
        .then(() => logger.info(`[CatenaArbitrumBridge] Relay requested for transaction ${transactionId}`))
        .catch(error => logger.error(`[CatenaArbitrumBridge] Failed to request relay for transaction ${transactionId}:`, error));
      
      // 브릿지 트랜잭션 정보 반환
      return {
        id: transactionId,
        txHash,
        sourceChain,
        targetChain: sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA,
        sourceToken: sourceTokenAddress,
        targetToken: targetTokenAddress,
        sender: await signer.getAddress(),
        recipient: recipientAddress,
        amount,
        status: BridgeTransactionStatus.PENDING,
        timestamp: Math.floor(Date.now() / 1000),
        completedAt: null,
        relayerFee: '0' // Arbitrum 브릿지는 별도의 릴레이어 수수료가 없음, L2 가스비는 별도 계산
      };
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Bridge asset failed:`, error);
      throw new Error(`Bridge asset failed: ${error.message}`);
    }
  }

  /**
   * Arbitrum 브릿지 제출 비용 추정
   * 
   * @returns 제출 비용 (wei)
   */
  private async estimateSubmissionCost(): Promise<bigint> {
    try {
      // 실제로는 Arbitrum 브릿지에서 제공하는 API나 컨트랙트 메서드를 사용하여 계산
      // 여기서는 예시로 고정값 반환
      return ethers.parseEther('0.0001'); // 0.0001 ETH
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Estimate submission cost failed:`, error);
      return ethers.parseEther('0.0001'); // 기본값
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
        sourceChain: data.sourceChain === 'CATENA' ? ChainType.CATENA : ChainType.ARBITRUM,
        targetChain: data.targetChain === 'CATENA' ? ChainType.CATENA : ChainType.ARBITRUM,
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
      logger.error(`[CatenaArbitrumBridge] Get transaction status failed:`, error);
      // API 조회 실패 시 폴백 응답
      return {
        id: transactionId,
        txHash: '',
        sourceChain,
        targetChain: sourceChain === ChainType.CATENA ? ChainType.ARBITRUM : ChainType.CATENA,
        sourceToken: ethers.ZeroAddress,
        targetToken: ethers.ZeroAddress,
        sender: ethers.ZeroAddress,
        recipient: ethers.ZeroAddress,
        amount: '0',
        status: BridgeTransactionStatus.UNKNOWN,
        timestamp: 0,
        completedAt: null,
        relayerFee: '0'
      };
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
          sourceChain: tx.sourceChain === 'CATENA' ? ChainType.CATENA : ChainType.ARBITRUM,
          targetChain: tx.targetChain === 'CATENA' ? ChainType.CATENA : ChainType.ARBITRUM,
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
      logger.error(`[CatenaArbitrumBridge] Get transaction history failed:`, error);
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
      const isEth = sourceTokenAddress.toLowerCase() === ethers.ZeroAddress;
      
      // Arbitrum의 경우 별도의 브릿지 수수료는 없음
      const bridgeFee = '0';
      
      // Relayer 수수료 없음
      const relayerFee = '0';
      
      // L2 gas 예상치
      let gasEstimate: bigint;
      
      if (sourceChain === ChainType.CATENA) {
        // Catena -> Arbitrum 방향
        if (isEth) {
          // ETH 브릿지
          const maxSubmissionCost = await this.estimateSubmissionCost();
          gasEstimate = maxSubmissionCost;
        } else {
          // ERC20 토큰 브릿지
          // Arbitrum 게이트웨이 라우터에서 토큰별 게이트웨이 가져오기
          const gatewayAddress = await this.arbitrumGatewayContract.getGateway(sourceTokenAddress);
          const gateway = new ethers.Contract(gatewayAddress, ARBITRUM_GATEWAY_ABI, this.catenaProvider);
          
          // L2 가스 관련 값 (Arbitrum 특성)
          const maxGas = 1000000n; // 예상 L2 가스 한도
          const gasPriceBid = 100000000n; // L2 가스 가격 (wei)
          const maxSubmissionCost = 100000000000000n; // 최대 제출 비용
          
          // 가스 추정
          gasEstimate = maxSubmissionCost + (maxGas * gasPriceBid);
        }
      } else {
        // Arbitrum -> Catena 방향
        if (isEth) {
          // ETH 출금
          gasEstimate = ethers.parseEther('0.0001'); // 고정 값
        } else {
          // ERC20 토큰 출금
          gasEstimate = ethers.parseEther('0.0002'); // 고정 값
        }
      }
      
      // 총 비용 (가스비만)
      const totalFee = gasEstimate.toString();
      
      return {
        bridgeFee,
        relayerFee,
        gasEstimate: gasEstimate.toString(),
        totalFee
      };
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Estimate bridge fee failed:`, error);
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
          sourceChain: sourceChain === ChainType.CATENA ? 'CATENA' : 'ARBITRUM'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Relay request failed: ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Request relay failed:`, error);
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
    arbitrumConnected: boolean;
    relayerConnected: boolean;
  }> {
    try {
      // Catena 게이트웨이 컨트랙트 연결 확인
      let catenaConnected = false;
      try {
        await this.catenaGatewayContract.getL1TokenBridge();
        catenaConnected = true;
      } catch (e) {
        logger.error('[CatenaArbitrumBridge] Catena gateway contract not connected:', e);
      }
      
      // Arbitrum 게이트웨이 컨트랙트 연결 확인
      let arbitrumConnected = false;
      try {
        await this.arbitrumGatewayContract.getGateway(ethers.ZeroAddress);
        arbitrumConnected = true;
      } catch (e) {
        logger.error('[CatenaArbitrumBridge] Arbitrum gateway contract not connected:', e);
      }
      
      // 릴레이어 API 연결 확인
      let relayerConnected = false;
      try {
        const response = await fetch(`${this.relayerApi}/health`);
        relayerConnected = response.ok;
      } catch (e) {
        logger.error('[CatenaArbitrumBridge] Relayer API not connected:', e);
      }
      
      return {
        catenaConnected,
        arbitrumConnected,
        relayerConnected
      };
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Check bridge status failed:`, error);
      return {
        catenaConnected: false,
        arbitrumConnected: false,
        relayerConnected: false
      };
    }
  }
  
  /**
   * Arbitrum 출금 완료 확인 (Arbitrum 특화 기능)
   * 
   * Arbitrum에서 Catena로 자산을 이동할 때, 출금이 완료되기 위해서는
   * 7일 동안의 챌린지 기간이 필요하며, 그 후에 L1에서 출금을 완료해야 합니다.
   * 
   * @param withdrawalId - 출금 ID
   * @param signer - 서명자 (지갑)
   * @returns 트랜잭션 해시
   */
  async executeWithdrawal(withdrawalId: string, signer: ethers.Signer): Promise<string> {
    try {
      // 출금 상태 확인
      const withdrawStatus = await this.getWithdrawalStatus(withdrawalId);
      
      if (withdrawStatus !== WithdrawalStatusCode.CLAIMABLE) {
        throw new Error(`Withdrawal is not claimable yet. Current status: ${withdrawStatus}`);
      }
      
      // Arbitrum 출금 컨트랙트 주소 (L1 Outbox)
      const outboxAddress = this.isMainnet
        ? '0x0B9857ae2D4A3DBe74ffE1d7DF045bb7F96E4840'  // Arbitrum Mainnet Outbox
        : '0x45Af9Ed1D03703e480CE7d328fB684bb67DA5049'; // Arbitrum Goerli Testnet Outbox
      
      // Outbox 컨트랙트 ABI
      const outboxAbi = [
        'function executeTransaction(uint256 batchNumber, bytes32[] calldata proof, uint256 index, address l2Sender, address to, uint256 l2Block, uint256 l1Block, uint256 l2Timestamp, uint256 value, bytes calldata data) external',
        'function calculateBatchNum(uint256 withdrawalIndex) external view returns (uint256)'
      ];
      
      // 출금 정보 가져오기
      const response = await fetch(`${this.relayerApi}/withdrawal-proof?id=${withdrawalId}`);
      if (!response.ok) {
        throw new Error(`Failed to get withdrawal proof: ${response.statusText}`);
      }
      
      const proofData = await response.json();
      
      // Outbox 컨트랙트에 연결
      const outboxContract = new ethers.Contract(outboxAddress, outboxAbi, signer);
      
      // 트랜잭션 실행
      const tx = await outboxContract.executeTransaction(
        proofData.batchNumber,
        proofData.proof,
        proofData.index,
        proofData.l2Sender,
        proofData.to,
        proofData.l2Block,
        proofData.l1Block,
        proofData.l2Timestamp,
        proofData.value,
        proofData.data
      );
      
      const receipt = await tx.wait();
      logger.info(`[CatenaArbitrumBridge] Withdrawal executed: ${receipt.hash}`);
      
      return receipt.hash;
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Execute withdrawal failed:`, error);
      throw new Error(`Execute withdrawal failed: ${error.message}`);
    }
  }
  
  /**
   * Arbitrum 출금 상태 확인
   * 
   * @param withdrawalId - 출금 ID
   * @returns 출금 상태 코드
   */
  private async getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalStatusCode> {
    try {
      const response = await fetch(`${this.relayerApi}/withdrawal-status?id=${withdrawalId}`);
      if (!response.ok) {
        throw new Error(`Failed to get withdrawal status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      switch (data.status) {
        case 'NOT_FOUND':
          return WithdrawalStatusCode.NOT_FOUND;
        case 'PENDING':
          return WithdrawalStatusCode.PENDING;
        case 'CLAIMABLE':
          return WithdrawalStatusCode.CLAIMABLE;
        case 'COMPLETED':
          return WithdrawalStatusCode.COMPLETED;
        case 'FAILED':
          return WithdrawalStatusCode.FAILED;
        default:
          return WithdrawalStatusCode.NOT_FOUND;
      }
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Get withdrawal status failed:`, error);
      return WithdrawalStatusCode.NOT_FOUND;
    }
  }
  
  /**
   * 청구 가능한 출금 트랜잭션 목록 조회
   * 
   * @param walletAddress - 지갑 주소
   * @returns 청구 가능한 트랜잭션 목록
   */
  async getClaimableWithdrawals(walletAddress: string): Promise<BridgeTransaction[]> {
    try {
      const response = await fetch(`${this.relayerApi}/claimable-withdrawals?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error(`API response error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.withdrawals.map(tx => {
        return {
          id: tx.withdrawalId,
          txHash: tx.txHash,
          sourceChain: ChainType.ARBITRUM,
          targetChain: ChainType.CATENA,
          sourceToken: tx.sourceToken,
          targetToken: tx.targetToken,
          sender: tx.sender,
          recipient: tx.recipient,
          amount: tx.amount,
          status: BridgeTransactionStatus.CLAIMABLE,
          timestamp: tx.timestamp,
          completedAt: null,
          relayerFee: '0'
        };
      });
    } catch (error) {
      logger.error(`[CatenaArbitrumBridge] Get claimable withdrawals failed:`, error);
      throw new Error(`Get claimable withdrawals failed: ${error.message}`);
    }
  }
}

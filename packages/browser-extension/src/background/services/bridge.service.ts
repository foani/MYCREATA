import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { TransactionService } from './transaction.service';
import { BRIDGE_STATUS, BRIDGE_TYPE, BRIDGE_PROVIDER } from '../../constants/bridge';

/**
 * 브릿지 서비스 클래스
 * 크로스체인 브릿지 기능을 제공하는 서비스입니다.
 */
export class BridgeService {
  private storageService: StorageService;
  private networkService: NetworkService;
  private transactionService: TransactionService;
  
  /**
   * 브릿지 서비스 생성자
   */
  constructor(
    storageService: StorageService,
    networkService: NetworkService,
    transactionService: TransactionService
  ) {
    this.storageService = storageService;
    this.networkService = networkService;
    this.transactionService = transactionService;
  }
  
  /**
   * 새 브릿지 트랜잭션 생성
   */
  async createTransaction(params: {
    sourceChainId: string;
    targetChainId: string;
    tokenAddress: string;
    amount: string;
    sender: string;
    recipient: string;
  }): Promise<any> {
    try {
      // 브릿지 트랜잭션 데이터 생성
      const transaction = {
        id: uuidv4(),
        sourceChainId: params.sourceChainId,
        targetChainId: params.targetChainId,
        tokenAddress: params.tokenAddress.toLowerCase(),
        amount: params.amount,
        sender: params.sender.toLowerCase(),
        recipient: params.recipient.toLowerCase(),
        status: BRIDGE_STATUS.PENDING,
        type: BRIDGE_TYPE.LOCK_AND_MINT,
        provider: BRIDGE_PROVIDER.CATENA_BRIDGE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceTxHash: null,
        targetTxHash: null,
        fee: '0', // 예상 수수료는 별도로 계산
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간 후 만료
      };
      
      // 토큰 정보 가져오기
      const sourceChain = await this.networkService.getChainById(params.sourceChainId);
      const targetChain = await this.networkService.getChainById(params.targetChainId);
      
      if (!sourceChain || !targetChain) {
        throw new Error('Invalid chain IDs');
      }
      
      // 토큰 데이터 가져오기 (나중에 구현)
      const tokenData = await this.getTokenData(params.sourceChainId, params.tokenAddress);
      
      // 트랜잭션 저장
      await this.saveTransaction(transaction);
      
      return transaction;
    } catch (error) {
      console.error('Failed to create bridge transaction:', error);
      throw error;
    }
  }
  
  /**
   * 브릿지 트랜잭션 실행
   */
  async executeTransaction(txId: string): Promise<any> {
    try {
      // 트랜잭션 가져오기
      const transaction = await this.getTransactionById(txId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== BRIDGE_STATUS.PENDING) {
        throw new Error(`Cannot execute transaction in ${transaction.status} status`);
      }
      
      // 해당 체인으로 전환
      await this.networkService.switchChain(transaction.sourceChainId);
      
      // 브릿지 컨트랙트 주소 (체인별로 다름)
      const bridgeContract = await this.getBridgeContract(transaction.sourceChainId);
      
      // 트랜잭션 파라미터 설정
      const txParams = {
        to: bridgeContract.address,
        data: bridgeContract.interface.encodeFunctionData('bridgeToken', [
          transaction.targetChainId,
          transaction.tokenAddress,
          transaction.amount,
          transaction.recipient
        ]),
        value: transaction.tokenAddress === ethers.constants.AddressZero ? transaction.amount : '0',
      };
      
      // 트랜잭션 실행
      const txResponse = await this.transactionService.sendTransaction(txParams);
      
      // 트랜잭션 상태 업데이트
      const updatedTransaction = {
        ...transaction,
        status: BRIDGE_STATUS.PROCESSING,
        sourceTxHash: txResponse.hash,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveTransaction(updatedTransaction);
      
      // 트랜잭션 확인 및 상태 업데이트 (비동기)
      this.monitorTransaction(updatedTransaction);
      
      return updatedTransaction;
    } catch (error) {
      console.error('Failed to execute bridge transaction:', error);
      throw error;
    }
  }
  
  /**
   * 브릿지 트랜잭션 확인 (클레임)
   */
  async confirmTransaction(txId: string): Promise<any> {
    try {
      // 트랜잭션 가져오기
      const transaction = await this.getTransactionById(txId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== BRIDGE_STATUS.READY_FOR_CLAIM) {
        throw new Error(`Cannot confirm transaction in ${transaction.status} status`);
      }
      
      // 해당 체인으로 전환
      await this.networkService.switchChain(transaction.targetChainId);
      
      // 브릿지 컨트랙트 주소 (체인별로 다름)
      const bridgeContract = await this.getBridgeContract(transaction.targetChainId);
      
      // 클레임 증명 가져오기 (상황에 따라 다름)
      const proof = await this.getClaimProof(transaction);
      
      // 트랜잭션 파라미터 설정
      const txParams = {
        to: bridgeContract.address,
        data: bridgeContract.interface.encodeFunctionData('claimToken', [
          transaction.sourceChainId,
          transaction.tokenAddress,
          transaction.amount,
          transaction.recipient,
          proof
        ]),
      };
      
      // 트랜잭션 실행
      const txResponse = await this.transactionService.sendTransaction(txParams);
      
      // 트랜잭션 상태 업데이트
      const updatedTransaction = {
        ...transaction,
        status: BRIDGE_STATUS.COMPLETED,
        targetTxHash: txResponse.hash,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveTransaction(updatedTransaction);
      
      return updatedTransaction;
    } catch (error) {
      console.error('Failed to confirm bridge transaction:', error);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 상태 모니터링
   */
  private async monitorTransaction(transaction: any): Promise<void> {
    try {
      // 원본 체인의 트랜잭션 확인
      if (transaction.sourceTxHash) {
        const sourceReceipt = await this.transactionService.waitForTransactionReceipt(
          transaction.sourceChainId,
          transaction.sourceTxHash
        );
        
        if (sourceReceipt.status === 0) {
          // 트랜잭션 실패
          await this.saveTransaction({
            ...transaction,
            status: BRIDGE_STATUS.FAILED,
            updatedAt: new Date().toISOString(),
          });
          return;
        }
        
        // 블록 확인 대기 (체인별로 다름)
        const confirmations = await this.getRequiredConfirmations(transaction.sourceChainId);
        await this.transactionService.waitForConfirmations(
          transaction.sourceChainId,
          transaction.sourceTxHash,
          confirmations
        );
        
        // 브릿지 상태 확인 및 업데이트
        const bridgeStatus = await this.checkBridgeStatus(transaction);
        
        if (bridgeStatus === BRIDGE_STATUS.READY_FOR_CLAIM) {
          await this.saveTransaction({
            ...transaction,
            status: BRIDGE_STATUS.READY_FOR_CLAIM,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to monitor bridge transaction:', error);
    }
  }
  
  /**
   * 브릿지 상태 확인
   */
  private async checkBridgeStatus(transaction: any): Promise<BRIDGE_STATUS> {
    // 실제 구현에서는 브릿지 컨트랙트나 API를 통해 상태 확인
    // 여기서는 간단히 시뮬레이션
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(BRIDGE_STATUS.READY_FOR_CLAIM);
      }, 5000); // 5초 후 클레임 준비 상태로 변경 (시뮬레이션)
    });
  }
  
  /**
   * 클레임 증명 가져오기
   */
  private async getClaimProof(transaction: any): Promise<any> {
    // 실제 구현에서는 브릿지 증명 생성 로직 필요
    // 여기서는 더미 데이터 반환
    return ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'uint256'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(transaction.id)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(transaction.sourceTxHash || '')),
        ethers.BigNumber.from(transaction.amount)
      ]
    );
  }
  
  /**
   * 체인별 필요한 확인 수 반환
   */
  private async getRequiredConfirmations(chainId: string): Promise<number> {
    const chain = await this.networkService.getChainById(chainId);
    
    // 체인별 기본 확인 수
    const confirmations: {[key: string]: number} = {
      '1': 12, // Ethereum Mainnet
      '56': 15, // BSC
      '137': 128, // Polygon
      '42161': 24, // Arbitrum
      '1000': 6, // Catena Mainnet
      '9000': 3, // Catena Testnet
    };
    
    return confirmations[chainId] || 6;
  }
  
  /**
   * 체인별 브릿지 컨트랙트 가져오기
   */
  private async getBridgeContract(chainId: string): Promise<any> {
    // 실제 구현에서는 체인별 브릿지 컨트랙트 주소 및 ABI 필요
    // 여기서는 더미 데이터 반환
    const abi = [
      'function bridgeToken(uint256 targetChainId, address token, uint256 amount, address recipient) payable returns (bytes32)',
      'function claimToken(uint256 sourceChainId, address token, uint256 amount, address recipient, bytes calldata proof) returns (bool)',
    ];
    
    // 체인별 브릿지 컨트랙트 주소
    const bridgeAddresses: {[key: string]: string} = {
      '1': '0x1234567890123456789012345678901234567890', // Ethereum Mainnet
      '56': '0x1234567890123456789012345678901234567890', // BSC
      '137': '0x1234567890123456789012345678901234567890', // Polygon
      '42161': '0x1234567890123456789012345678901234567890', // Arbitrum
      '1000': '0x1234567890123456789012345678901234567890', // Catena Mainnet
      '9000': '0x1234567890123456789012345678901234567890', // Catena Testnet
    };
    
    const provider = await this.networkService.getProvider(chainId);
    return new ethers.Contract(bridgeAddresses[chainId], abi, provider);
  }
  
  /**
   * 토큰 데이터 가져오기
   */
  private async getTokenData(chainId: string, tokenAddress: string): Promise<any> {
    // 실제 구현에서는 토큰 정보를 가져오는 로직 필요
    // 여기서는 더미 데이터 반환
    return {
      symbol: tokenAddress === ethers.constants.AddressZero ? 'ETH' : 'TOKEN',
      decimals: 18,
      name: tokenAddress === ethers.constants.AddressZero ? 'Ethereum' : 'Generic Token',
    };
  }
  
  /**
   * 브릿지 트랜잭션 저장
   */
  private async saveTransaction(transaction: any): Promise<void> {
    try {
      // 기존 트랜잭션 목록 가져오기
      const transactions = await this.getAllTransactions();
      
      // 기존 트랜잭션 검색
      const index = transactions.findIndex(tx => tx.id === transaction.id);
      
      if (index !== -1) {
        // 기존 트랜잭션 업데이트
        transactions[index] = transaction;
      } else {
        // 새 트랜잭션 추가
        transactions.push(transaction);
      }
      
      // 업데이트된 목록 저장
      await this.storageService.set('bridgeTransactions', transactions);
    } catch (error) {
      console.error('Failed to save bridge transaction:', error);
      throw error;
    }
  }
  
  /**
   * 모든 브릿지 트랜잭션 가져오기
   */
  async getAllTransactions(): Promise<any[]> {
    try {
      const transactions = await this.storageService.get('bridgeTransactions');
      return transactions || [];
    } catch (error) {
      console.error('Failed to get all bridge transactions:', error);
      return [];
    }
  }
  
  /**
   * 계정별 브릿지 트랜잭션 가져오기
   */
  async getTransactionsByAccount(accountAddress: string): Promise<any[]> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(tx => 
        tx.sender.toLowerCase() === accountAddress.toLowerCase() || 
        tx.recipient.toLowerCase() === accountAddress.toLowerCase()
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Failed to get transactions by account:', error);
      return [];
    }
  }
  
  /**
   * ID로 브릿지 트랜잭션 가져오기
   */
  async getTransactionById(txId: string): Promise<any | null> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.find(tx => tx.id === txId) || null;
    } catch (error) {
      console.error('Failed to get transaction by ID:', error);
      return null;
    }
  }
  
  /**
   * 해시로 브릿지 트랜잭션 가져오기
   */
  async getTransactionByHash(txHash: string): Promise<any | null> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.find(tx => 
        tx.sourceTxHash === txHash || tx.targetTxHash === txHash
      ) || null;
    } catch (error) {
      console.error('Failed to get transaction by hash:', error);
      return null;
    }
  }
  
  /**
   * 지원되는 체인 목록 가져오기
   */
  async getSupportedChains(): Promise<any[]> {
    // 실제 구현에서는 지원되는 체인 목록을 가져오는 로직 필요
    // 여기서는 더미 데이터 반환
    return [
      { id: '1', name: 'Ethereum Mainnet' },
      { id: '137', name: 'Polygon Mainnet' },
      { id: '42161', name: 'Arbitrum One' },
      { id: '1000', name: 'Catena Mainnet' },
      { id: '9000', name: 'Catena Testnet' },
    ];
  }
  
  /**
   * 지원되는 토큰 목록 가져오기
   */
  async getSupportedTokens(sourceChainId: string, targetChainId: string): Promise<any[]> {
    // 실제 구현에서는 지원되는 토큰 목록을 가져오는 로직 필요
    // 여기서는 더미 데이터 반환
    
    // 네이티브 토큰
    const nativeToken = {
      address: ethers.constants.AddressZero,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    };
    
    // 기본 토큰 (실제로는 체인별로 다름)
    const tokens = [
      nativeToken,
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      },
      {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        decimals: 8,
        logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      },
    ];
    
    return tokens;
  }
  
  /**
   * 수수료 견적 가져오기
   */
  async estimateFee(params: {
    sourceChainId: string;
    targetChainId: string;
    tokenAddress: string;
    amount: string;
  }): Promise<any> {
    // 실제 구현에서는 수수료 견적을 계산하는 로직 필요
    // 여기서는 더미 데이터 반환
    
    const amount = ethers.BigNumber.from(params.amount);
    
    // 기본 수수료: 금액의 0.1%
    const feePercentage = 0.001;
    const feeAmount = amount.mul(Math.floor(feePercentage * 10000)).div(10000);
    
    return {
      fee: feeAmount.toString(),
      feeToken: params.tokenAddress,
      feeUSD: '0', // USD 금액은 별도 계산 필요
    };
  }
}

// 싱글톤 인스턴스 관리
let bridgeService: BridgeService | null = null;

/**
 * 브릿지 서비스 인스턴스 가져오기
 */
export async function getBridgeService(): Promise<BridgeService> {
  if (!bridgeService) {
    // 필요한 서비스 임포트
    const { getStorageService } = await import('./storage.service');
    const { getNetworkService } = await import('./network.service');
    const { getTransactionService } = await import('./transaction.service');
    
    // 서비스 인스턴스 생성
    const storageService = await getStorageService();
    const networkService = await getNetworkService();
    const transactionService = await getTransactionService();
    
    bridgeService = new BridgeService(
      storageService,
      networkService,
      transactionService
    );
  }
  
  return bridgeService;
}

/**
 * 테스트용 브릿지 서비스 생성
 */
export function createBridgeService(
  storageService: StorageService,
  networkService: NetworkService,
  transactionService: TransactionService
): BridgeService {
  return new BridgeService(
    storageService,
    networkService,
    transactionService
  );
}
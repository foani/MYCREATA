/**
 * NetworkService
 * 체인 네트워크 관리 서비스
 * 체인 정보 관리, 체인 전환, RPC 연결 관리 등을 담당합니다.
 */

import { StorageService } from './storage.service';

// 체인 정보 인터페이스
export interface ChainInfo {
  chainId: number;
  chainIdHex: string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl?: string;
  iconUrl?: string;
}

export class NetworkService {
  // 기본 지원 체인 목록
  private readonly DEFAULT_CHAINS: ChainInfo[] = [
    {
      chainId: 1000,
      chainIdHex: '0x3E8',
      name: 'Catena (CIP-20) Chain Mainnet',
      nativeCurrency: {
        name: 'CTA',
        symbol: 'CTA',
        decimals: 18
      },
      rpcUrl: 'https://cvm.node.creatachain.com',
      blockExplorerUrl: 'https://catena.explorer.creatachain.com'
    },
    {
      chainId: 9000,
      chainIdHex: '0x2328',
      name: 'Catena (CIP-20) Chain Testnet',
      nativeCurrency: {
        name: 'CTA',
        symbol: 'CTA',
        decimals: 18
      },
      rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
      blockExplorerUrl: 'https://testnet.cvm.creatachain.com'
    },
    {
      chainId: 1,
      chainIdHex: '0x1',
      name: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrl: 'https://mainnet.infura.io/v3/your-api-key',
      blockExplorerUrl: 'https://etherscan.io'
    },
    {
      chainId: 137,
      chainIdHex: '0x89',
      name: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorerUrl: 'https://polygonscan.com'
    },
    {
      chainId: 42161,
      chainIdHex: '0xA4B1',
      name: 'Arbitrum One',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      blockExplorerUrl: 'https://arbiscan.io'
    }
  ];
  
  private chains: ChainInfo[] = [];
  private selectedChainId: number = 1000; // 기본값: Catena Mainnet
  
  constructor(private storageService: StorageService) {}
  
  /**
   * 네트워크 서비스 초기화
   */
  public async init(): Promise<void> {
    try {
      // 저장된 체인 목록 로드
      const storedChains = await this.storageService.getItem<ChainInfo[]>('chains');
      if (storedChains && storedChains.length > 0) {
        this.chains = storedChains;
      } else {
        // 기본 체인 목록 사용
        this.chains = [...this.DEFAULT_CHAINS];
        await this.storageService.setItem('chains', this.chains);
      }
      
      // 선택된 체인 ID 로드
      const storedChainId = await this.storageService.getItem<number>('selectedChainId');
      if (storedChainId) {
        this.selectedChainId = storedChainId;
      }
      
      console.log('네트워크 서비스가 초기화되었습니다.');
    } catch (error) {
      console.error('네트워크 서비스 초기화 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 현재 선택된 체인 정보 조회
   * @returns 현재 선택된 체인 정보
   */
  public async getSelectedNetwork(): Promise<ChainInfo> {
    const chainInfo = this.chains.find((chain) => chain.chainId === this.selectedChainId);
    if (!chainInfo) {
      // 선택된 체인이 없으면 기본값 사용
      const defaultChain = this.chains[0];
      if (!defaultChain) {
        throw new Error('사용 가능한 체인이 없습니다.');
      }
      return defaultChain;
    }
    return chainInfo;
  }
  
  /**
   * 체인 ID로 체인 선택
   * @param chainId 체인 ID
   */
  public async selectNetwork(chainId: number): Promise<void> {
    // 체인 존재 여부 확인
    const chainExists = this.chains.some((chain) => chain.chainId === chainId);
    if (!chainExists) {
      throw new Error(`지원하지 않는 체인 ID: ${chainId}`);
    }
    
    // 체인 선택
    this.selectedChainId = chainId;
    await this.storageService.setItem('selectedChainId', chainId);
    
    // 체인 변경 이벤트 발생 (실제 구현에서는 이벤트 시스템 필요)
    console.log(`체인이 변경되었습니다: ${chainId}`);
  }
  
  /**
   * 모든 지원 체인 목록 조회
   * @returns 체인 목록
   */
  public async getAllNetworks(): Promise<ChainInfo[]> {
    return this.chains;
  }
  
  /**
   * 체인 ID로 체인 정보 조회
   * @param chainId 체인 ID
   * @returns 체인 정보 또는 undefined
   */
  public async getNetworkByChainId(chainId: number): Promise<ChainInfo | undefined> {
    return this.chains.find((chain) => chain.chainId === chainId);
  }
  
  /**
   * 새 체인 추가
   * @param chainInfo 체인 정보
   */
  public async addNetwork(chainInfo: ChainInfo): Promise<void> {
    // 이미 존재하는 체인인지 확인
    const existingIndex = this.chains.findIndex((chain) => chain.chainId === chainInfo.chainId);
    
    if (existingIndex !== -1) {
      // 기존 체인 정보 업데이트
      this.chains[existingIndex] = chainInfo;
    } else {
      // 새 체인 추가
      this.chains.push(chainInfo);
    }
    
    // 체인 목록 저장
    await this.storageService.setItem('chains', this.chains);
  }
  
  /**
   * 체인 삭제
   * @param chainId 삭제할 체인 ID
   */
  public async removeNetwork(chainId: number): Promise<void> {
    // 기본 제공 체인은 삭제 불가
    const isDefaultChain = this.DEFAULT_CHAINS.some((chain) => chain.chainId === chainId);
    if (isDefaultChain) {
      throw new Error('기본 제공 체인은 삭제할 수 없습니다.');
    }
    
    // 체인 삭제
    this.chains = this.chains.filter((chain) => chain.chainId !== chainId);
    
    // 현재 선택된 체인이 삭제된 경우 다른 체인 선택
    if (this.selectedChainId === chainId) {
      this.selectedChainId = this.DEFAULT_CHAINS[0].chainId;
      await this.storageService.setItem('selectedChainId', this.selectedChainId);
    }
    
    // 체인 목록 저장
    await this.storageService.setItem('chains', this.chains);
  }
  
  /**
   * 체인 정보 업데이트
   * @param chainId 업데이트할 체인 ID
   * @param updates 업데이트할 속성
   */
  public async updateNetwork(chainId: number, updates: Partial<ChainInfo>): Promise<void> {
    // 체인 존재 여부 확인
    const chainIndex = this.chains.findIndex((chain) => chain.chainId === chainId);
    if (chainIndex === -1) {
      throw new Error(`존재하지 않는 체인 ID: ${chainId}`);
    }
    
    // 체인 ID는 변경 불가
    if (updates.chainId && updates.chainId !== chainId) {
      throw new Error('체인 ID는 변경할 수 없습니다.');
    }
    
    // 체인 정보 업데이트
    this.chains[chainIndex] = {
      ...this.chains[chainIndex],
      ...updates
    };
    
    // 체인 목록 저장
    await this.storageService.setItem('chains', this.chains);
  }
  
  /**
   * RPC URL 테스트
   * @param rpcUrl 테스트할 RPC URL
   * @returns 테스트 성공 여부
   */
  public async testRpcConnection(rpcUrl: string): Promise<boolean> {
    try {
      // JSON-RPC 테스트 요청 (eth_chainId)
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });
      
      const data = await response.json();
      
      // 응답에 result가 있으면 성공
      return !!data.result;
    } catch (error) {
      console.error('RPC 연결 테스트 중 오류:', error);
      return false;
    }
  }
  
  /**
   * 체인 자동 감지
   * @param targetAddress 대상 주소 또는 컨트랙트 주소
   * @returns 감지된 체인 ID 또는 null
   */
  public async detectNetworkForAddress(targetAddress: string): Promise<number | null> {
    // 실제 구현에서는 더 복잡한 로직이 필요할 수 있음
    // 예: 각 체인에서 해당 주소의 잔액 확인 등
    // 임시 구현: 항상 첫 번째 체인 반환
    
    return this.chains[0]?.chainId || null;
  }
}
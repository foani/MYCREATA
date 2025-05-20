import { ICreLinkProvider } from '../providers/provider.interface';
import { RPCMethod, AddChainParams, ChainInfo, ErrorCode } from '../types';

/**
 * 체인 관련 메서드
 */
export class ChainMethods {
  private provider: ICreLinkProvider;

  /**
   * 체인 메서드 생성자
   * 
   * @param provider CreLink 프로바이더
   */
  constructor(provider: ICreLinkProvider) {
    this.provider = provider;
  }

  /**
   * 현재 체인 ID 조회
   * 
   * @returns 체인 ID (16진수 문자열)
   */
  public async getChainId(): Promise<string> {
    try {
      const chainId = await this.provider.request({
        method: RPCMethod.ETH_CHAIN_ID
      });
      return chainId;
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      throw error;
    }
  }

  /**
   * 체인 전환
   * 
   * @param chainId 체인 ID (16진수 문자열)
   */
  public async switchChain(chainId: string): Promise<void> {
    try {
      await this.provider.request({
        method: RPCMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId }]
      });
    } catch (error: any) {
      // 체인이 지갑에 추가되지 않은 경우
      if (error.code === ErrorCode.CHAIN_NOT_ADDED) {
        // 지원하는 체인 목록 조회
        const supportedChains = await this.provider.getSupportedChains();
        
        // 전환하려는 체인 찾기
        const targetChain = supportedChains.find(chain => chain.chainId === chainId);
        
        if (targetChain) {
          // 체인 추가
          await this.addChain(targetChain);
          // 다시 체인 전환 시도
          await this.switchChain(chainId);
        } else {
          throw new Error(`Chain with ID ${chainId} is not supported`);
        }
      } else if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 전환을 거부한 경우
        throw error;
      } else {
        console.error('Failed to switch chain:', error);
        throw error;
      }
    }
  }

  /**
   * 체인 추가
   * 
   * @param chainParams 체인 매개변수
   */
  public async addChain(chainParams: AddChainParams): Promise<void> {
    try {
      await this.provider.request({
        method: RPCMethod.WALLET_ADD_ETHEREUM_CHAIN,
        params: [chainParams]
      });
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 추가를 거부한 경우
        throw error;
      } else {
        console.error('Failed to add chain:', error);
        throw error;
      }
    }
  }

  /**
   * 지원하는 체인 목록 조회
   * 
   * @returns 체인 정보 배열
   */
  public async getSupportedChains(): Promise<ChainInfo[]> {
    return await this.provider.getSupportedChains();
  }

  /**
   * 네트워크 버전 조회
   * 
   * @returns 네트워크 버전 (10진수 문자열)
   */
  public async getNetworkVersion(): Promise<string> {
    try {
      const version = await this.provider.request({
        method: RPCMethod.NET_VERSION
      });
      return version;
    } catch (error) {
      console.error('Failed to get network version:', error);
      throw error;
    }
  }
}

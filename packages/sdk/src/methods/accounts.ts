import { ICreLinkProvider } from '../providers/provider.interface';
import { RPCMethod, ErrorCode } from '../types';

/**
 * 계정 관련 메서드
 */
export class AccountMethods {
  private provider: ICreLinkProvider;

  /**
   * 계정 메서드 생성자
   * 
   * @param provider CreLink 프로바이더
   */
  constructor(provider: ICreLinkProvider) {
    this.provider = provider;
  }

  /**
   * 현재 연결된 계정 조회
   * 
   * @returns 계정 주소 배열
   */
  public async getAccounts(): Promise<string[]> {
    try {
      return await this.provider.request({
        method: RPCMethod.ETH_ACCOUNTS
      });
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  /**
   * 계정 연결 요청
   * 
   * @returns 계정 주소 배열
   */
  public async requestAccounts(): Promise<string[]> {
    try {
      const accounts = await this.provider.request({
        method: RPCMethod.ETH_REQUEST_ACCOUNTS
      });
      return accounts;
    } catch (error: any) {
      // 사용자가 연결을 거부한 경우
      if (error.code === ErrorCode.USER_REJECTED) {
        throw error;
      }
      
      console.error('Failed to request accounts:', error);
      throw error;
    }
  }

  /**
   * 계정 잔액 조회
   * 
   * @param address 계정 주소
   * @param blockTag 블록 태그 (latest, earliest, pending)
   * @returns 잔액 (16진수 문자열, wei 단위)
   */
  public async getBalance(address: string, blockTag: string = 'latest'): Promise<string> {
    try {
      const balance = await this.provider.request({
        method: RPCMethod.ETH_GET_BALANCE,
        params: [address, blockTag]
      });
      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * 계정 트랜잭션 수 조회
   * 
   * @param address 계정 주소
   * @param blockTag 블록 태그 (latest, earliest, pending)
   * @returns 트랜잭션 수 (16진수 문자열)
   */
  public async getTransactionCount(address: string, blockTag: string = 'latest'): Promise<string> {
    try {
      const count = await this.provider.request({
        method: RPCMethod.ETH_GET_TRANSACTION_COUNT,
        params: [address, blockTag]
      });
      return count;
    } catch (error) {
      console.error('Failed to get transaction count:', error);
      throw error;
    }
  }
}

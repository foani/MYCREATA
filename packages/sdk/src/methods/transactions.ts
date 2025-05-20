import { ICreLinkProvider } from '../providers/provider.interface';
import { RPCMethod, TransactionParams, ErrorCode, EstimateGasParams, CallParams } from '../types';

/**
 * 트랜잭션 관련 메서드
 */
export class TransactionMethods {
  private provider: ICreLinkProvider;

  /**
   * 트랜잭션 메서드 생성자
   * 
   * @param provider CreLink 프로바이더
   */
  constructor(provider: ICreLinkProvider) {
    this.provider = provider;
  }

  /**
   * 트랜잭션 전송
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 트랜잭션 해시
   */
  public async sendTransaction(txParams: TransactionParams): Promise<string> {
    try {
      // from 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!txParams.from && this.provider.selectedAddress) {
        txParams.from = this.provider.selectedAddress;
      }
      
      const txHash = await this.provider.request({
        method: RPCMethod.ETH_SEND_TRANSACTION,
        params: [txParams]
      });
      
      return txHash;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 트랜잭션을 거부한 경우
        throw error;
      } else {
        console.error('Failed to send transaction:', error);
        throw error;
      }
    }
  }

  /**
   * 트랜잭션 서명 (전송하지 않음)
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 서명된 트랜잭션 데이터
   */
  public async signTransaction(txParams: TransactionParams): Promise<string> {
    try {
      // from 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!txParams.from && this.provider.selectedAddress) {
        txParams.from = this.provider.selectedAddress;
      }
      
      const signedTx = await this.provider.request({
        method: RPCMethod.ETH_SIGN_TRANSACTION,
        params: [txParams]
      });
      
      return signedTx;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 서명을 거부한 경우
        throw error;
      } else {
        console.error('Failed to sign transaction:', error);
        throw error;
      }
    }
  }

  /**
   * 트랜잭션 가스 추정
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 가스 추정값 (16진수 문자열)
   */
  public async estimateGas(txParams: EstimateGasParams): Promise<string> {
    try {
      // from 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!txParams.from && this.provider.selectedAddress) {
        txParams.from = this.provider.selectedAddress;
      }
      
      const gas = await this.provider.request({
        method: RPCMethod.ETH_ESTIMATE_GAS,
        params: [txParams]
      });
      
      return gas;
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * 현재 가스 가격 조회
   * 
   * @returns 가스 가격 (16진수 문자열, wei 단위)
   */
  public async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.request({
        method: RPCMethod.ETH_GAS_PRICE
      });
      
      return gasPrice;
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }

  /**
   * 트랜잭션 호출 (상태 변경 없음)
   * 
   * @param callParams 호출 매개변수
   * @param blockTag 블록 태그 (latest, earliest, pending)
   * @returns 호출 결과 (16진수 문자열)
   */
  public async call(callParams: CallParams, blockTag: string = 'latest'): Promise<string> {
    try {
      // from 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!callParams.from && this.provider.selectedAddress) {
        callParams.from = this.provider.selectedAddress;
      }
      
      const result = await this.provider.request({
        method: RPCMethod.ETH_CALL,
        params: [callParams, blockTag]
      });
      
      return result;
    } catch (error) {
      console.error('Failed to call contract:', error);
      throw error;
    }
  }
}

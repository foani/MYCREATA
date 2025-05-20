import { ICreLinkProvider } from '../providers/provider.interface';
import { RPCMethod, ErrorCode, SignParams, SignTypedDataParams } from '../types';

/**
 * 서명 관련 메서드
 */
export class SigningMethods {
  private provider: ICreLinkProvider;

  /**
   * 서명 메서드 생성자
   * 
   * @param provider CreLink 프로바이더
   */
  constructor(provider: ICreLinkProvider) {
    this.provider = provider;
  }

  /**
   * 개인 메시지 서명
   * 
   * @param message 서명할 메시지 (문자열 또는 16진수 문자열)
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 메시지 서명
   */
  public async signMessage(message: string, address?: string): Promise<string> {
    try {
      // 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!address && this.provider.selectedAddress) {
        address = this.provider.selectedAddress;
      }
      
      if (!address) {
        throw new Error('No account selected');
      }
      
      // 메시지가 16진수 형식이 아닌 경우 변환
      let hexMessage = message;
      if (!message.startsWith('0x')) {
        hexMessage = '0x' + Buffer.from(message).toString('hex');
      }
      
      const signature = await this.provider.request({
        method: RPCMethod.PERSONAL_SIGN,
        params: [hexMessage, address]
      });
      
      return signature;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 서명을 거부한 경우
        throw error;
      } else {
        console.error('Failed to sign message:', error);
        throw error;
      }
    }
  }

  /**
   * eth_sign 메서드를 사용한 메시지 서명
   * (보안상의 이유로 personal_sign 사용을 권장)
   * 
   * @param message 서명할 메시지 (16진수 문자열)
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 메시지 서명
   */
  public async ethSign(message: string, address?: string): Promise<string> {
    try {
      // 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!address && this.provider.selectedAddress) {
        address = this.provider.selectedAddress;
      }
      
      if (!address) {
        throw new Error('No account selected');
      }
      
      const signature = await this.provider.request({
        method: RPCMethod.ETH_SIGN,
        params: [address, message]
      });
      
      return signature;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 서명을 거부한 경우
        throw error;
      } else {
        console.error('Failed to sign message with eth_sign:', error);
        throw error;
      }
    }
  }

  /**
   * EIP-712 타입 데이터 서명 (v4)
   * 
   * @param typedData EIP-712 타입 데이터
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 타입 데이터 서명
   */
  public async signTypedData(typedData: any, address?: string): Promise<string> {
    try {
      // 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!address && this.provider.selectedAddress) {
        address = this.provider.selectedAddress;
      }
      
      if (!address) {
        throw new Error('No account selected');
      }
      
      // JSON 문자열로 변환 (필요한 경우)
      const params = typeof typedData === 'string' ? [address, typedData] : [address, JSON.stringify(typedData)];
      
      const signature = await this.provider.request({
        method: RPCMethod.ETH_SIGN_TYPED_DATA_V4,
        params
      });
      
      return signature;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 서명을 거부한 경우
        throw error;
      } else {
        console.error('Failed to sign typed data:', error);
        throw error;
      }
    }
  }

  /**
   * EIP-712 타입 데이터 서명 (v3)
   * 
   * @param typedData EIP-712 타입 데이터
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 타입 데이터 서명
   */
  public async signTypedDataV3(typedData: any, address?: string): Promise<string> {
    try {
      // 주소가 지정되지 않은 경우 현재 선택된 계정 사용
      if (!address && this.provider.selectedAddress) {
        address = this.provider.selectedAddress;
      }
      
      if (!address) {
        throw new Error('No account selected');
      }
      
      // JSON 문자열로 변환 (필요한 경우)
      const params = typeof typedData === 'string' ? [address, typedData] : [address, JSON.stringify(typedData)];
      
      const signature = await this.provider.request({
        method: RPCMethod.ETH_SIGN_TYPED_DATA_V3,
        params
      });
      
      return signature;
    } catch (error: any) {
      if (error.code === ErrorCode.USER_REJECTED) {
        // 사용자가 서명을 거부한 경우
        throw error;
      } else {
        console.error('Failed to sign typed data v3:', error);
        throw error;
      }
    }
  }
}

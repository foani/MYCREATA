/**
 * WalletController
 * 지갑의 핵심 기능을 관리하는 컨트롤러 클래스
 * 계정 관리, 네트워크 설정, 트랜잭션 처리, 서명 요청 등을 처리합니다.
 */

import { KeyringService } from './services/keyring.service';
import { NetworkService } from './services/network.service';
import { StorageService } from './services/storage.service';
import { TransactionService } from './services/transaction.service';
import { DIDService } from './services/did.service';
import { SecurityService } from './services/security.service';

export class WalletController {
  private keyringService: KeyringService;
  private networkService: NetworkService;
  private storageService: StorageService;
  private transactionService: TransactionService;
  private didService: DIDService;
  private securityService: SecurityService;
  
  private isInitialized: boolean = false;
  private isLocked: boolean = true;
  
  constructor() {
    this.storageService = new StorageService();
    this.keyringService = new KeyringService(this.storageService);
    this.networkService = new NetworkService(this.storageService);
    this.transactionService = new TransactionService(this.keyringService, this.networkService);
    this.didService = new DIDService(this.storageService);
    this.securityService = new SecurityService();
  }
  
  /**
   * 지갑 컨트롤러 초기화
   * 스토리지에서 상태를 로드하고 서비스들을 초기화합니다.
   */
  public async init(): Promise<void> {
    try {
      // 스토리지 초기화
      await this.storageService.init();
      
      // 서비스 초기화
      await this.networkService.init();
      
      // 지갑 잠금 상태 확인
      const hasWallet = await this.keyringService.hasWallet();
      this.isLocked = hasWallet;
      
      this.isInitialized = true;
      console.log('지갑 컨트롤러가 초기화되었습니다.');
    } catch (error) {
      console.error('지갑 컨트롤러 초기화 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 새 지갑 생성
   * @param password 지갑 잠금 해제 비밀번호
   * @returns 니모닉 구문
   */
  public async createWallet(password: string): Promise<string> {
    try {
      const mnemonic = await this.keyringService.createWallet(password);
      this.isLocked = false;
      return mnemonic;
    } catch (error) {
      console.error('지갑 생성 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 니모닉으로 지갑 복구
   * @param mnemonic 니모닉 구문
   * @param password 새 비밀번호
   */
  public async recoverWallet(mnemonic: string, password: string): Promise<void> {
    try {
      await this.keyringService.importWallet(mnemonic, password);
      this.isLocked = false;
    } catch (error) {
      console.error('지갑 복구 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * DID를 사용하여 지갑 복구
   * @param didType DID 유형 (예: 'telegram', 'google')
   * @param didCredential DID 인증 정보
   * @param pin 개인 PIN 코드
   */
  public async recoverWalletWithDID(didType: string, didCredential: any, pin: string): Promise<void> {
    try {
      await this.didService.verifyDID(didType, didCredential);
      const mnemonic = await this.didService.getMnemonicFromDID(didType, didCredential, pin);
      await this.keyringService.importWallet(mnemonic, pin);
      this.isLocked = false;
    } catch (error) {
      console.error('DID로 지갑 복구 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 지갑 잠금 해제
   * @param password 비밀번호
   */
  public async unlockWallet(password: string): Promise<boolean> {
    try {
      const success = await this.keyringService.unlockWallet(password);
      if (success) {
        this.isLocked = false;
      }
      return success;
    } catch (error) {
      console.error('지갑 잠금 해제 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 지갑 잠금
   */
  public lockWallet(): void {
    this.keyringService.lockWallet();
    this.isLocked = true;
  }
  
  /**
   * 계정 목록 조회
   */
  public async getAccounts(): Promise<string[]> {
    if (this.isLocked) {
      return [];
    }
    return this.keyringService.getAccounts();
  }
  
  /**
   * 현재 선택된 계정 조회
   */
  public async getSelectedAccount(): Promise<string | null> {
    if (this.isLocked) {
      return null;
    }
    return this.keyringService.getSelectedAccount();
  }
  
  /**
   * 계정 선택
   * @param address 선택할 계정 주소
   */
  public async selectAccount(address: string): Promise<void> {
    if (this.isLocked) {
      throw new Error('지갑이 잠겨 있습니다.');
    }
    await this.keyringService.selectAccount(address);
  }
  
  /**
   * 새 계정 생성
   */
  public async createAccount(): Promise<string> {
    if (this.isLocked) {
      throw new Error('지갑이 잠겨 있습니다.');
    }
    return this.keyringService.createAccount();
  }
  
  /**
   * 현재 선택된 네트워크 조회
   */
  public async getSelectedNetwork(): Promise<any> {
    return this.networkService.getSelectedNetwork();
  }
  
  /**
   * 네트워크 선택
   * @param chainId 체인 ID
   */
  public async selectNetwork(chainId: number): Promise<void> {
    await this.networkService.selectNetwork(chainId);
  }
  
  /**
   * 트랜잭션 서명 및 전송
   * @param txParams 트랜잭션 파라미터
   */
  public async signAndSendTransaction(txParams: any): Promise<string> {
    if (this.isLocked) {
      throw new Error('지갑이 잠겨 있습니다.');
    }
    
    const account = await this.keyringService.getSelectedAccount();
    if (!account) {
      throw new Error('선택된 계정이 없습니다.');
    }
    
    return this.transactionService.signAndSendTransaction(txParams);
  }
  
  /**
   * 개인 메시지 서명
   * @param message 서명할 메시지
   */
  public async signPersonalMessage(message: string): Promise<string> {
    if (this.isLocked) {
      throw new Error('지갑이 잠겨 있습니다.');
    }
    
    const account = await this.keyringService.getSelectedAccount();
    if (!account) {
      throw new Error('선택된 계정이 없습니다.');
    }
    
    return this.transactionService.signPersonalMessage(message);
  }
  
  /**
   * 타입화된 데이터 서명 (EIP-712)
   * @param typedData 타입화된 데이터
   */
  public async signTypedData(typedData: any): Promise<string> {
    if (this.isLocked) {
      throw new Error('지갑이 잠겨 있습니다.');
    }
    
    const account = await this.keyringService.getSelectedAccount();
    if (!account) {
      throw new Error('선택된 계정이 없습니다.');
    }
    
    return this.transactionService.signTypedData(typedData);
  }
  
  /**
   * 지갑 초기화 상태 확인
   */
  public isWalletInitialized(): boolean {
    return this.isInitialized;
  }
  
  /**
   * 지갑 잠금 상태 확인
   */
  public isWalletLocked(): boolean {
    return this.isLocked;
  }
  
  /**
   * 지갑 존재 여부 확인
   */
  public async hasWallet(): Promise<boolean> {
    return this.keyringService.hasWallet();
  }
}
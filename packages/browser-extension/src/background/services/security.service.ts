/**
 * SecurityService
 * 보안 관련 기능 제공 서비스
 * 승인 관리, 보안 설정, 인증 등 기능을 담당합니다.
 */

// 연결된 사이트 정보 인터페이스
export interface ConnectedSite {
  origin: string;
  favicon?: string;
  name?: string;
  accounts: string[];
  permissions: string[];
  lastConnected: number;
}

// 승인 요청 유형 열거형
export enum ApprovalType {
  CONNECT = 'connect',
  TRANSACTION = 'transaction',
  SIGN_MESSAGE = 'sign_message',
  SIGN_TYPED_DATA = 'sign_typed_data',
  SWITCH_CHAIN = 'switch_chain',
  ADD_CHAIN = 'add_chain'
}

// 승인 요청 인터페이스
export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  origin: string;
  originName?: string;
  originFavicon?: string;
  data: any;
  createdAt: number;
}

export class SecurityService {
  private connectedSites: Map<string, ConnectedSite> = new Map();
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();
  
  constructor() {
    this.loadConnectedSites();
  }
  
  /**
   * 연결된 사이트 정보 로드
   */
  private async loadConnectedSites(): Promise<void> {
    try {
      // 실제 구현에서는 스토리지에서 로드
      // 임시 구현: 빈 맵으로 시작
    } catch (error) {
      console.error('연결된 사이트 정보 로드 중 오류:', error);
    }
  }
  
  /**
   * 연결된 사이트 정보 저장
   */
  private async saveConnectedSites(): Promise<void> {
    try {
      // 실제 구현에서는 스토리지에 저장
      // 임시 구현: 아무 작업도 하지 않음
    } catch (error) {
      console.error('연결된 사이트 정보 저장 중 오류:', error);
    }
  }
  
  /**
   * 사이트 접근 권한 확인
   * @param origin 사이트 출처
   * @param permission 확인할 권한
   * @returns 권한 있음 여부
   */
  public hasSitePermission(origin: string, permission: string): boolean {
    const site = this.connectedSites.get(origin);
    return !!site && site.permissions.includes(permission);
  }
  
  /**
   * 사이트에 접근 가능한 계정 목록 조회
   * @param origin 사이트 출처
   * @returns 접근 가능한 계정 목록
   */
  public getSiteAccounts(origin: string): string[] {
    const site = this.connectedSites.get(origin);
    return site?.accounts || [];
  }
  
  /**
   * 사이트 연결 상태 확인
   * @param origin 사이트 출처
   * @returns 연결됨 여부
   */
  public isSiteConnected(origin: string): boolean {
    return this.connectedSites.has(origin);
  }
  
  /**
   * 새 사이트 연결 추가
   * @param origin 사이트 출처
   * @param metadata 사이트 메타데이터 (이름, 파비콘 등)
   * @param accounts 접근 가능한 계정 목록
   * @param permissions 부여된 권한 목록
   */
  public async addConnectedSite(
    origin: string,
    metadata: { name?: string; favicon?: string },
    accounts: string[],
    permissions: string[]
  ): Promise<void> {
    const site: ConnectedSite = {
      origin,
      name: metadata.name,
      favicon: metadata.favicon,
      accounts,
      permissions,
      lastConnected: Date.now()
    };
    
    this.connectedSites.set(origin, site);
    await this.saveConnectedSites();
  }
  
  /**
   * 사이트 연결 정보 업데이트
   * @param origin 사이트 출처
   * @param updates 업데이트할 속성
   */
  public async updateConnectedSite(
    origin: string,
    updates: Partial<ConnectedSite>
  ): Promise<void> {
    const site = this.connectedSites.get(origin);
    if (!site) {
      throw new Error('연결되지 않은 사이트입니다.');
    }
    
    // 계정 추가
    if (updates.accounts) {
      site.accounts = [...new Set([...site.accounts, ...updates.accounts])];
    }
    
    // 권한 추가
    if (updates.permissions) {
      site.permissions = [...new Set([...site.permissions, ...updates.permissions])];
    }
    
    // 기타 업데이트
    if (updates.name) site.name = updates.name;
    if (updates.favicon) site.favicon = updates.favicon;
    
    // 마지막 연결 시간 업데이트
    site.lastConnected = Date.now();
    
    this.connectedSites.set(origin, site);
    await this.saveConnectedSites();
  }
  
  /**
   * 사이트 연결 삭제
   * @param origin 사이트 출처
   */
  public async removeConnectedSite(origin: string): Promise<void> {
    this.connectedSites.delete(origin);
    await this.saveConnectedSites();
  }
  
  /**
   * 모든 사이트 연결 삭제
   */
  public async removeAllConnectedSites(): Promise<void> {
    this.connectedSites.clear();
    await this.saveConnectedSites();
  }
  
  /**
   * 연결된 모든 사이트 조회
   * @returns 연결된 사이트 목록
   */
  public getAllConnectedSites(): ConnectedSite[] {
    return Array.from(this.connectedSites.values());
  }
  
  /**
   * 승인 요청 생성
   * @param type 승인 유형
   * @param origin 요청 출처
   * @param data 요청 데이터
   * @returns 승인 요청 ID
   */
  public createApprovalRequest(
    type: ApprovalType,
    origin: string,
    data: any
  ): string {
    const id = Math.random().toString(36).substring(2, 15);
    
    // 사이트 정보 가져오기
    const site = this.connectedSites.get(origin);
    
    const request: ApprovalRequest = {
      id,
      type,
      origin,
      originName: site?.name,
      originFavicon: site?.favicon,
      data,
      createdAt: Date.now()
    };
    
    this.pendingApprovals.set(id, request);
    
    return id;
  }
  
  /**
   * 승인 요청 조회
   * @param id 승인 요청 ID
   * @returns 승인 요청 또는 undefined
   */
  public getApprovalRequest(id: string): ApprovalRequest | undefined {
    return this.pendingApprovals.get(id);
  }
  
  /**
   * 승인 요청 완료 처리
   * @param id 승인 요청 ID
   * @param approved 승인 여부
   * @param result 승인 결과 데이터
   */
  public completeApprovalRequest(id: string, approved: boolean, result?: any): void {
    const request = this.pendingApprovals.get(id);
    if (!request) {
      throw new Error('존재하지 않는 승인 요청입니다.');
    }
    
    // 승인 요청 삭제
    this.pendingApprovals.delete(id);
    
    // 승인된 경우, 사이트 연결 정보 업데이트
    if (approved && request.type === ApprovalType.CONNECT) {
      this.updateConnectedSite(request.origin, {
        accounts: result.accounts,
        permissions: result.permissions
      });
    }
  }
  
  /**
   * 승인 요청 취소
   * @param id 승인 요청 ID
   */
  public cancelApprovalRequest(id: string): void {
    this.pendingApprovals.delete(id);
  }
  
  /**
   * 모든 대기 중인 승인 요청 조회
   * @returns 대기 중인 승인 요청 목록
   */
  public getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values());
  }
  
  /**
   * 피싱 사이트 확인
   * @param origin 확인할 사이트 출처
   * @returns 피싱 사이트 여부
   */
  public async checkPhishingSite(origin: string): Promise<boolean> {
    // 실제 구현에서는 피싱 사이트 DB 확인 또는 API 호출
    // 임시 구현: 항상 안전한 것으로 처리
    return false;
  }
  
  /**
   * 사이트 메타데이터 가져오기
   * @param origin 사이트 출처
   * @returns 사이트 메타데이터
   */
  public async getSiteMetadata(origin: string): Promise<{ name?: string; favicon?: string }> {
    // 실제 구현에서는 팝업이나 다른 방법으로 가져오기
    // 임시 구현: 빈 객체 반환
    return {};
  }
  
  /**
   * 위험한 트랜잭션 감지
   * @param txData 트랜잭션 데이터
   * @returns 위험 요소 목록 (비어 있으면 안전)
   */
  public detectRiskyTransaction(txData: any): string[] {
    const risks: string[] = [];
    
    // 실제 구현에서는 다양한 위험 감지 로직 필요
    // 임시 구현: 간단한 감지 로직
    
    // 대량 전송 검사
    if (txData.value && parseInt(txData.value, 16) > 1e18) { // 1 ETH 이상
      risks.push('large_transfer');
    }
    
    // 알 수 없는 컨트랙트 호출 검사
    if (txData.data && txData.data !== '0x') {
      // 화이트리스트된 컨트랙트가 아니면 위험
      risks.push('unknown_contract');
    }
    
    return risks;
  }
  
  /**
   * 서명 데이터 위험 감지
   * @param signData 서명 데이터
   * @param type 서명 유형 ('message' | 'typedData')
   * @returns 위험 요소 목록 (비어 있으면 안전)
   */
  public detectRiskySignature(signData: any, type: 'message' | 'typedData'): string[] {
    const risks: string[] = [];
    
    // 실제 구현에서는 다양한 위험 감지 로직 필요
    // 임시 구현: 간단한 감지 로직
    
    if (type === 'message') {
      // 허가 관련 문자열 감지
      const message = typeof signData === 'string' ? signData : '';
      if (message.toLowerCase().includes('approve') || message.toLowerCase().includes('permission')) {
        risks.push('permission_request');
      }
    } else if (type === 'typedData') {
      // EIP-712 타입화된 데이터 분석
      try {
        // 특정 위험한 타입 감지
        const typedData = signData;
        const primaryType = typedData.primaryType;
        
        if (primaryType === 'Order' || primaryType === 'PermitTransaction') {
          risks.push('permit_signature');
        }
      } catch (error) {
        // 파싱 오류는 위험할 수 있음
        risks.push('invalid_data');
      }
    }
    
    return risks;
  }
}
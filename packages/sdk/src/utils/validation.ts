import { AddChainParams, TransactionParams } from '../types';

/**
 * 유효성 검증 유틸리티 함수
 */

/**
 * 이더리움 주소 유효성 검증
 * 
 * @param address 이더리움 주소
 * @returns 유효 여부
 */
export function isValidAddress(address: string): boolean {
  return address && /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 16진수 값 유효성 검증
 * 
 * @param hex 16진수 문자열
 * @returns 유효 여부
 */
export function isValidHex(hex: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(hex);
}

/**
 * 체인 ID 유효성 검증
 * 
 * @param chainId 체인 ID
 * @returns 유효 여부
 */
export function isValidChainId(chainId: string): boolean {
  return isValidHex(chainId);
}

/**
 * 트랜잭션 매개변수 유효성 검증
 * 
 * @param txParams 트랜잭션 매개변수
 * @returns 유효성 검증 결과 및 오류 메시지
 */
export function validateTransactionParams(txParams: TransactionParams): { isValid: boolean; error?: string } {
  // to 주소 확인
  if (txParams.to && !isValidAddress(txParams.to)) {
    return { isValid: false, error: 'Invalid recipient address' };
  }
  
  // from 주소 확인 (지정된 경우)
  if (txParams.from && !isValidAddress(txParams.from)) {
    return { isValid: false, error: 'Invalid sender address' };
  }
  
  // 값 확인 (지정된 경우)
  if (txParams.value !== undefined) {
    // 16진수 형식인 경우
    if (typeof txParams.value === 'string' && txParams.value.startsWith('0x')) {
      if (!isValidHex(txParams.value)) {
        return { isValid: false, error: 'Invalid transaction value (hex)' };
      }
    } 
    // 10진수 형식인 경우
    else if (typeof txParams.value === 'string') {
      if (!/^(\d*\.?\d+|\d+\.?\d*)$/.test(txParams.value)) {
        return { isValid: false, error: 'Invalid transaction value (decimal)' };
      }
    }
  }
  
  // 데이터 확인 (지정된 경우)
  if (txParams.data !== undefined && !isValidHex(txParams.data)) {
    return { isValid: false, error: 'Invalid transaction data' };
  }
  
  // 가스 한도 확인 (지정된 경우)
  if (txParams.gas !== undefined && !isValidHex(txParams.gas)) {
    return { isValid: false, error: 'Invalid gas limit' };
  }
  
  // 가스 가격 확인 (지정된 경우)
  if (txParams.gasPrice !== undefined && !isValidHex(txParams.gasPrice)) {
    return { isValid: false, error: 'Invalid gas price' };
  }
  
  // 논스 확인 (지정된 경우)
  if (txParams.nonce !== undefined && !isValidHex(txParams.nonce)) {
    return { isValid: false, error: 'Invalid nonce' };
  }
  
  return { isValid: true };
}

/**
 * 체인 매개변수 유효성 검증
 * 
 * @param chainParams 체인 매개변수
 * @returns 유효성 검증 결과 및 오류 메시지
 */
export function validateChainParams(chainParams: AddChainParams): { isValid: boolean; error?: string } {
  // 체인 ID 확인
  if (!isValidChainId(chainParams.chainId)) {
    return { isValid: false, error: 'Invalid chain ID' };
  }
  
  // 체인 이름 확인
  if (!chainParams.chainName || chainParams.chainName.trim() === '') {
    return { isValid: false, error: 'Chain name is required' };
  }
  
  // 네이티브 토큰 확인
  if (!chainParams.nativeCurrency || 
      !chainParams.nativeCurrency.name || 
      !chainParams.nativeCurrency.symbol ||
      typeof chainParams.nativeCurrency.decimals !== 'number') {
    return { isValid: false, error: 'Invalid native currency configuration' };
  }
  
  // RPC URL 확인
  if (!chainParams.rpcUrls || chainParams.rpcUrls.length === 0) {
    return { isValid: false, error: 'At least one RPC URL is required' };
  }
  
  // RPC URL 형식 확인
  for (const url of chainParams.rpcUrls) {
    try {
      new URL(url);
    } catch (error) {
      return { isValid: false, error: `Invalid RPC URL: ${url}` };
    }
  }
  
  // 블록 탐색기 URL 확인 (지정된 경우)
  if (chainParams.blockExplorerUrls && chainParams.blockExplorerUrls.length > 0) {
    for (const url of chainParams.blockExplorerUrls) {
      try {
        new URL(url);
      } catch (error) {
        return { isValid: false, error: `Invalid block explorer URL: ${url}` };
      }
    }
  }
  
  return { isValid: true };
}

/**
 * EIP-712 타입 데이터 유효성 검증
 * 
 * @param typedData EIP-712 타입 데이터
 * @returns 유효성 검증 결과 및 오류 메시지
 */
export function validateTypedData(typedData: any): { isValid: boolean; error?: string } {
  // 문자열인 경우 JSON 파싱 시도
  if (typeof typedData === 'string') {
    try {
      typedData = JSON.parse(typedData);
    } catch (error) {
      return { isValid: false, error: 'Invalid JSON string' };
    }
  }
  
  // 객체인지 확인
  if (!typedData || typeof typedData !== 'object') {
    return { isValid: false, error: 'TypedData must be an object' };
  }
  
  // 필수 필드 확인
  if (!typedData.types) {
    return { isValid: false, error: 'Missing types field' };
  }
  
  if (!typedData.primaryType) {
    return { isValid: false, error: 'Missing primaryType field' };
  }
  
  if (!typedData.domain) {
    return { isValid: false, error: 'Missing domain field' };
  }
  
  if (!typedData.message) {
    return { isValid: false, error: 'Missing message field' };
  }
  
  // EIP-712 Domain 타입 확인
  if (!typedData.types.EIP712Domain) {
    return { isValid: false, error: 'Missing EIP712Domain type' };
  }
  
  // 기본 타입 확인
  if (!typedData.types[typedData.primaryType]) {
    return { isValid: false, error: `Missing type definition for primaryType: ${typedData.primaryType}` };
  }
  
  return { isValid: true };
}

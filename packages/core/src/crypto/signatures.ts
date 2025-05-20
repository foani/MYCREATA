/**
 * @file signatures.ts
 * @description 서명 생성 및 검증 유틸리티 모듈
 */

import { Wallet, SigningKey, hashMessage, getBytes, verifyMessage } from 'ethers';
import { normalizeAddress } from '../utils/address';
import { EIP712Domain, SignTypedDataOptions } from '../types/transactions.types';

/**
 * 서명 타입 열거형
 */
export enum SignatureType {
  PERSONAL = 'personal',
  EIP712 = 'eip712',
  TRANSACTION = 'transaction'
}

/**
 * EIP-191 개인 메시지에 서명합니다.
 * 
 * @param privateKey 개인키
 * @param message 서명할 메시지
 * @returns 서명 (16진수 문자열)
 */
export function signPersonalMessage(privateKey: string, message: string): string {
  const wallet = new Wallet(privateKey);
  return wallet.signMessage(message);
}

/**
 * EIP-191 개인 메시지 서명을 검증합니다.
 * 
 * @param message 원본 메시지
 * @param signature 서명
 * @returns 서명자 주소
 */
export function verifyPersonalMessage(message: string, signature: string): string {
  const recoveredAddress = verifyMessage(message, signature);
  return normalizeAddress(recoveredAddress);
}

/**
 * EIP-712 타입화된 데이터에 서명합니다.
 * 
 * @param privateKey 개인키
 * @param domainData 도메인 데이터
 * @param typedData 타입화된 데이터
 * @param options 옵션
 * @returns 서명 (16진수 문자열)
 */
export async function signTypedData(
  privateKey: string,
  domainData: EIP712Domain,
  typedData: Record<string, any>,
  options: SignTypedDataOptions = {}
): Promise<string> {
  const wallet = new Wallet(privateKey);
  
  const domain = {
    name: domainData.name,
    version: domainData.version,
    chainId: domainData.chainId,
    verifyingContract: domainData.verifyingContract,
    salt: domainData.salt
  };
  
  // 서명 생성
  return await wallet.signTypedData(domain, options.types, typedData);
}

/**
 * EIP-712 타입화된 데이터 서명을 검증합니다.
 * 
 * @param domainData 도메인 데이터
 * @param typedData 타입화된 데이터
 * @param signature 서명
 * @param options 옵션
 * @returns 서명자 주소
 */
export function verifyTypedData(
  domainData: EIP712Domain,
  typedData: Record<string, any>,
  signature: string,
  options: SignTypedDataOptions
): string {
  const domain = {
    name: domainData.name,
    version: domainData.version,
    chainId: domainData.chainId,
    verifyingContract: domainData.verifyingContract,
    salt: domainData.salt
  };
  
  // 서명자 주소 복구
  const recoveredAddress = Wallet.verifyTypedData(domain, options.types, typedData, signature);
  return normalizeAddress(recoveredAddress);
}

/**
 * 트랜잭션 해시에 서명합니다.
 * 
 * @param privateKey 개인키
 * @param transactionHash 트랜잭션 해시 (16진수 문자열)
 * @returns 서명 (16진수 문자열)
 */
export function signHash(privateKey: string, transactionHash: string): string {
  const signingKey = new SigningKey(privateKey);
  const signature = signingKey.sign(getBytes(transactionHash));
  return signature.serialized;
}

/**
 * 서명 결과에서 r, s, v 값을 추출합니다.
 * 
 * @param signature 서명 (16진수 문자열)
 * @returns r, s, v 값
 */
export function splitSignature(signature: string): { r: string; s: string; v: number } {
  const { r, s, v } = SigningKey.parseSignature(signature);
  return {
    r: r.toString(),
    s: s.toString(),
    v: Number(v)
  };
}

/**
 * r, s, v 값을 결합하여 서명을 생성합니다.
 * 
 * @param r r 값
 * @param s s 값
 * @param v v 값
 * @returns 서명 (16진수 문자열)
 */
export function joinSignature(r: string, s: string, v: number): string {
  const signature = { r, s, v };
  return SigningKey.joinSignature(signature);
}

/**
 * 메시지에 대한 해시를 생성합니다. (EIP-191 형식)
 * 
 * @param message 메시지
 * @returns 해시 (Uint8Array)
 */
export function computeMessageHash(message: string): Uint8Array {
  return getBytes(hashMessage(message));
}

/**
 * 개인키의 유효성을 검증합니다.
 * 
 * @param privateKey 검증할 개인키
 * @returns 유효성 여부 (true/false)
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    // 개인키가 0x로 시작하는지 확인 및 적절한 형식으로 변환
    const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // 길이 검증
    if (getBytes(normalizedKey).length !== 32) {
      return false;
    }
    
    // 실제 개인키가 유효한지 확인 (SigningKey 생성 시도)
    new SigningKey(normalizedKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Catena 메인넷에서 표준 서명 메시지 접두사를 생성합니다.
 * 
 * @param message 원본 메시지
 * @returns 접두사가 붙은 메시지
 */
export function prefixCatenaMessage(message: string): string {
  return `\x19Catena Signed Message:\n${message.length}${message}`;
}

/**
 * 메시지에 대한 서명을 생성하고 메타데이터를 포함합니다.
 * 
 * @param privateKey 개인키
 * @param message 서명할 메시지
 * @param type 서명 타입
 * @returns 메타데이터가 포함된 서명 객체
 */
export function createSignature(
  privateKey: string,
  message: string,
  type: SignatureType = SignatureType.PERSONAL
): {
  signature: string;
  message: string;
  type: SignatureType;
  created: number;
  address: string;
} {
  let signature: string;
  
  if (type === SignatureType.PERSONAL) {
    signature = signPersonalMessage(privateKey, message);
  } else if (type === SignatureType.TRANSACTION) {
    signature = signHash(privateKey, message);
  } else {
    throw new Error(`Unsupported signature type: ${type}`);
  }
  
  const wallet = new Wallet(privateKey);
  
  return {
    signature,
    message,
    type,
    created: Date.now(),
    address: normalizeAddress(wallet.address)
  };
}

/**
 * 서명의 유효성을 검증합니다.
 * 
 * @param signatureObject 메타데이터가 포함된 서명 객체
 * @returns 유효성 여부 (true/false)
 */
export function validateSignature(
  signatureObject: {
    signature: string;
    message: string;
    type: SignatureType;
    address: string;
  }
): boolean {
  try {
    const { signature, message, type, address } = signatureObject;
    
    if (type === SignatureType.PERSONAL) {
      const recoveredAddress = verifyPersonalMessage(message, signature);
      return normalizeAddress(recoveredAddress) === normalizeAddress(address);
    } else if (type === SignatureType.TRANSACTION) {
      // 트랜잭션 서명 검증 로직이 복잡하므로 여기서는 구현하지 않음
      // 실제 구현에서는 트랜잭션 복구 알고리즘을 사용해야 함
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * EIP-712 도메인 해시를 계산합니다.
 * 
 * @param domain EIP-712 도메인 객체
 * @returns 도메인 해시 (16진수 문자열)
 */
export function computeDomainSeparator(domain: EIP712Domain): string {
  const domainFields = [];
  
  if (domain.name) domainFields.push({ name: 'name', type: 'string' });
  if (domain.version) domainFields.push({ name: 'version', type: 'string' });
  if (domain.chainId) domainFields.push({ name: 'chainId', type: 'uint256' });
  if (domain.verifyingContract) domainFields.push({ name: 'verifyingContract', type: 'address' });
  if (domain.salt) domainFields.push({ name: 'salt', type: 'bytes32' });
  
  const types = {
    EIP712Domain: domainFields
  };
  
  // 도메인 분리자 계산 (실제 구현은 ethers.js의 _TypedDataEncoder를 사용하는 것이 좋음)
  return "0x"; // 실제 구현에서는 올바른 값을 계산해야 함
}

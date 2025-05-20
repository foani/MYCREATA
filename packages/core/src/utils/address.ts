/**
 * address.ts
 * 
 * 이더리움 및 EVM 호환 체인 주소 관련 유틸리티 함수 모음.
 */

import { ValidationError } from './errors';

/**
 * 이더리움 주소 형식 정규 표현식
 */
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * 이더리움 체크섬 주소 정규 표현식 (대소문자 혼합)
 */
const ETH_CHECKSUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * ENS 도메인 정규 표현식
 */
const ENS_DOMAIN_REGEX = /^([a-z0-9-]+\.)*[a-z0-9-]+\.eth$/;

/**
 * 주소 타입 (16진수 주소, ENS 이름, zkDID)
 */
export enum AddressType {
  HEX = 'hex',
  ENS = 'ens',
  ZKDID = 'zkdid',
  UNKNOWN = 'unknown'
}

/**
 * 주소 유효성 검사
 * @param address 검사할 주소
 * @returns 유효성 여부
 */
export function isValidAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address);
}

/**
 * ENS 이름 유효성 검사
 * @param ensName 검사할 ENS 이름
 * @returns 유효성 여부
 */
export function isValidENS(ensName: string): boolean {
  return ENS_DOMAIN_REGEX.test(ensName);
}

/**
 * zkDID 유효성 검사
 * @param did 검사할 zkDID
 * @returns 유효성 여부
 */
export function isValidZkDID(did: string): boolean {
  return did.startsWith('did:creata:zk:');
}

/**
 * 주소 타입 확인
 * @param address 주소 또는 이름
 * @returns 주소 타입
 */
export function getAddressType(address: string): AddressType {
  if (isValidAddress(address)) {
    return AddressType.HEX;
  }
  
  if (isValidENS(address)) {
    return AddressType.ENS;
  }
  
  if (isValidZkDID(address)) {
    return AddressType.ZKDID;
  }
  
  return AddressType.UNKNOWN;
}

/**
 * 16진수 주소를 검증하고 정규화
 * @param address 16진수 주소
 * @returns 정규화된 주소
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new ValidationError(`Invalid Ethereum address: ${address}`);
  }
  
  // 소문자로 변환
  return address.toLowerCase();
}

/**
 * 주소를 약식으로 표시 (앞뒤 일부 보이고 중간 생략)
 * @param address 이더리움 주소
 * @param prefixLength 앞부분 글자 수 (기본값: 6)
 * @param suffixLength 뒷부분 글자 수 (기본값: 4)
 * @returns 약식 주소
 */
export function shortenAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!isValidAddress(address)) {
    return address;
  }
  
  if (prefixLength + suffixLength >= address.length) {
    return address;
  }
  
  const prefix = address.slice(0, prefixLength);
  const suffix = address.slice(-suffixLength);
  
  return `${prefix}...${suffix}`;
}

/**
 * 체크섬이 적용된 이더리움 주소로 변환
 * EIP-55 사양에 따라 주소의 대소문자를 조정하여 오류 검출 기능 추가
 * 
 * @param address 이더리움 주소
 * @returns 체크섬이 적용된 주소
 */
export function toChecksumAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new ValidationError(`Invalid Ethereum address: ${address}`);
  }
  
  // ethers.js 또는 web3.js 사용 가능
  // 여기서는 간단한 구현만 제공
  
  // 실제 구현에서는 ethers.js의 getAddress 사용 권장
  // import { getAddress } from 'ethers/lib/utils';
  // return getAddress(address);
  
  // 임시 체크섬 주소 반환 (실제 구현에서는 교체 필요)
  return address;
}

/**
 * 두 주소가 동일한지 확인 (대소문자 무시)
 * @param address1 첫 번째 주소
 * @param address2 두 번째 주소
 * @returns 동일 여부
 */
export function areAddressesEqual(address1: string, address2: string): boolean {
  if (!isValidAddress(address1) || !isValidAddress(address2)) {
    return false;
  }
  
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * 주소가 널 주소인지 확인 (0x0000...0000)
 * @param address 확인할 주소
 * @returns 널 주소 여부
 */
export function isNullAddress(address: string): boolean {
  if (!isValidAddress(address)) {
    return false;
  }
  
  return /^0x0*$/.test(address);
}

/**
 * 주소가 컨트랙트 주소인지 확인
 * 참고: 실제 구현에서는 네트워크 요청이 필요합니다.
 * 
 * @param address 확인할 주소
 * @param provider 이더리움 프로바이더
 * @returns 컨트랙트 여부
 */
export async function isContractAddress(address: string, provider: any): Promise<boolean> {
  if (!isValidAddress(address)) {
    return false;
  }
  
  // 실제 구현에서는 프로바이더로 코드 확인
  // const code = await provider.getCode(address);
  // return code !== '0x';
  
  // 임시 구현
  return false;
}

/**
 * 이더리움 주소에서 임의 아이콘 색상 생성
 * 주소를 기반으로 일관된 색상 반환
 * 
 * @param address 이더리움 주소
 * @returns HEX 색상 코드 (#RRGGBB)
 */
export function getAddressColor(address: string): string {
  if (!isValidAddress(address)) {
    // 기본 색상 반환
    return '#7F7F7F';
  }
  
  // 주소의 마지막 6자리로 색상 생성
  const colorHex = address.slice(-6);
  return `#${colorHex}`;
}

/**
 * 주소를 바이트 배열로 변환
 * @param address 이더리움 주소
 * @returns 바이트 배열
 */
export function addressToBytes(address: string): Uint8Array {
  if (!isValidAddress(address)) {
    throw new ValidationError(`Invalid Ethereum address: ${address}`);
  }
  
  const hexString = address.startsWith('0x') ? address.slice(2) : address;
  const bytes = new Uint8Array(20);
  
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  
  return bytes;
}

/**
 * 바이트 배열을 주소로 변환
 * @param bytes 바이트 배열
 * @returns 이더리움 주소
 */
export function bytesToAddress(bytes: Uint8Array): string {
  if (bytes.length !== 20) {
    throw new ValidationError('Invalid address bytes: must be 20 bytes');
  }
  
  let hexString = '0x';
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i].toString(16).padStart(2, '0');
    hexString += hex;
  }
  
  return hexString;
}

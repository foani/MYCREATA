/**
 * JSON-RPC 관련 유틸리티 함수
 */

/**
 * JSON-RPC 요청 객체 생성
 * 
 * @param method RPC 메서드
 * @param params RPC 매개변수
 * @returns JSON-RPC 요청 객체
 */
export function createJsonRpcRequest(method: string, params: any[] = []): any {
  return {
    jsonrpc: '2.0',
    id: generateId(),
    method,
    params
  };
}

/**
 * 16진수 문자열이 유효한지 확인
 * 
 * @param hex 16진수 문자열
 * @returns 유효 여부
 */
export function isValidHex(hex: string): boolean {
  // 0x 접두사 제거
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  // 16진수 정규식 검사
  return /^[0-9a-fA-F]*$/.test(hex);
}

/**
 * 10진수 숫자를 16진수 문자열로 변환
 * 
 * @param num 10진수 숫자
 * @returns 16진수 문자열
 */
export function numberToHex(num: number): string {
  return '0x' + num.toString(16);
}

/**
 * 16진수 문자열을 10진수 숫자로 변환
 * 
 * @param hex 16진수 문자열
 * @returns 10진수 숫자
 */
export function hexToNumber(hex: string): number {
  if (typeof hex !== 'string') {
    throw new Error('Expected string, got ' + typeof hex);
  }
  
  // 0x 접두사 제거
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  // 16진수 문자열을 10진수로 변환
  return parseInt(hex, 16);
}

/**
 * 문자열을 16진수로 변환
 * 
 * @param str 문자열
 * @returns 16진수 문자열
 */
export function stringToHex(str: string): string {
  let hex = '';
  
  // 문자열의 각 문자를 16진수로 변환
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hex += code.toString(16).padStart(2, '0');
  }
  
  return '0x' + hex;
}

/**
 * 16진수 문자열을 UTF-8 문자열로 변환
 * 
 * @param hex 16진수 문자열
 * @returns UTF-8 문자열
 */
export function hexToString(hex: string): string {
  if (typeof hex !== 'string') {
    throw new Error('Expected string, got ' + typeof hex);
  }
  
  // 0x 접두사 제거
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  // 문자열이 홀수 길이인 경우 오류
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  
  let str = '';
  
  // 16진수 문자열을 2글자씩 읽어서 문자로 변환
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substring(i, i + 2), 16);
    str += String.fromCharCode(charCode);
  }
  
  return str;
}

/**
 * 고유한 요청 ID 생성
 * 
 * @returns 요청 ID
 */
export function generateId(): number {
  const date = Date.now() * 1000;
  const extra = Math.floor(Math.random() * 1000);
  return date + extra;
}

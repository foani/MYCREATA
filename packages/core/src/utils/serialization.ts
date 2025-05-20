/**
 * @file serialization.ts
 * @description 데이터 직렬화 및 역직렬화 유틸리티 모듈
 */

/**
 * 객체를 JSON 문자열로 직렬화합니다.
 * 
 * @param data 직렬화할 객체
 * @param pretty 들여쓰기 적용 여부 (기본값: false)
 * @returns JSON 문자열
 */
export function serialize<T>(data: T, pretty: boolean = false): string {
  try {
    return pretty 
      ? JSON.stringify(data, null, 2) 
      : JSON.stringify(data);
  } catch (error) {
    throw new Error(`Failed to serialize data: ${error.message}`);
  }
}

/**
 * JSON 문자열을 객체로 역직렬화합니다.
 * 
 * @param json 역직렬화할 JSON 문자열
 * @returns 역직렬화된 객체
 */
export function deserialize<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize JSON: ${error.message}`);
  }
}

/**
 * 객체를 Base64 인코딩된 문자열로 직렬화합니다.
 * 
 * @param data 직렬화할 객체
 * @returns Base64 인코딩된 문자열
 */
export function serializeToBase64<T>(data: T): string {
  try {
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  } catch (error) {
    throw new Error(`Failed to serialize data to Base64: ${error.message}`);
  }
}

/**
 * Base64 인코딩된 문자열을 객체로 역직렬화합니다.
 * 
 * @param base64 역직렬화할 Base64 인코딩된 문자열
 * @returns 역직렬화된 객체
 */
export function deserializeFromBase64<T>(base64: string): T {
  try {
    const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize from Base64: ${error.message}`);
  }
}

/**
 * 객체를 URL 안전한 Base64 인코딩된 문자열로 직렬화합니다.
 * 
 * @param data 직렬화할 객체
 * @returns URL 안전한 Base64 인코딩된 문자열
 */
export function serializeToBase64Url<T>(data: T): string {
  try {
    const base64 = serializeToBase64(data);
    // URL 안전한 Base64로 변환 ('+' -> '-', '/' -> '_', '=' 제거)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    throw new Error(`Failed to serialize data to Base64URL: ${error.message}`);
  }
}

/**
 * URL 안전한 Base64 인코딩된 문자열을 객체로 역직렬화합니다.
 * 
 * @param base64Url 역직렬화할 URL 안전한 Base64 인코딩된 문자열
 * @returns 역직렬화된 객체
 */
export function deserializeFromBase64Url<T>(base64Url: string): T {
  try {
    // 표준 Base64로 변환 ('-' -> '+', '_' -> '/')
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 패딩 추가
    while (base64.length % 4) {
      base64 += '=';
    }
    
    return deserializeFromBase64<T>(base64);
  } catch (error) {
    throw new Error(`Failed to deserialize from Base64URL: ${error.message}`);
  }
}

/**
 * 바이너리 데이터를 16진수 문자열로 인코딩합니다.
 * 
 * @param data 인코딩할 바이너리 데이터
 * @param prefix '0x' 접두사 추가 여부 (기본값: true)
 * @returns 16진수 문자열
 */
export function bytesToHex(data: Uint8Array, prefix: boolean = true): string {
  const hex = Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return prefix ? `0x${hex}` : hex;
}

/**
 * 16진수 문자열을 바이너리 데이터로 디코딩합니다.
 * 
 * @param hex 디코딩할 16진수 문자열
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hex.slice(i * 2, i * 2 + 2);
    bytes[i] = parseInt(hexByte, 16);
  }
  
  return bytes;
}

/**
 * 객체를 바이너리 데이터로 직렬화합니다.
 * 
 * @param data 직렬화할 객체
 * @returns Uint8Array
 */
export function serializeToBytes<T>(data: T): Uint8Array {
  try {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString);
  } catch (error) {
    throw new Error(`Failed to serialize data to bytes: ${error.message}`);
  }
}

/**
 * 바이너리 데이터를 객체로 역직렬화합니다.
 * 
 * @param bytes 역직렬화할 바이너리 데이터
 * @returns 역직렬화된 객체
 */
export function deserializeFromBytes<T>(bytes: Uint8Array): T {
  try {
    const jsonString = new TextDecoder().decode(bytes);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize from bytes: ${error.message}`);
  }
}

/**
 * 직렬화된 데이터에 서명을 추가합니다.
 * 
 * @param data 데이터 객체
 * @param signature 서명 문자열
 * @returns 서명이 포함된 문자열
 */
export function addSignatureToSerialized<T>(data: T, signature: string): string {
  const serialized = serialize({
    data,
    signature,
    timestamp: Date.now()
  });
  
  return serialized;
}

/**
 * 서명이 포함된 직렬화된 데이터를 역직렬화합니다.
 * 
 * @param serialized 서명이 포함된 직렬화된 문자열
 * @returns 데이터와 서명
 */
export function deserializeWithSignature<T>(serialized: string): { data: T; signature: string; timestamp: number } {
  try {
    return deserialize<{ data: T; signature: string; timestamp: number }>(serialized);
  } catch (error) {
    throw new Error(`Failed to deserialize data with signature: ${error.message}`);
  }
}

/**
 * 객체를 압축된 형태로 직렬화합니다.
 * 이 함수는 개념적인 것으로, 실제 구현에서는 압축 라이브러리가 필요합니다.
 * 
 * @param data 직렬화할 객체
 * @returns 압축된 문자열 (Base64 인코딩)
 */
export function serializeCompressed<T>(data: T): string {
  // 실제 구현에서는 pako 등의 라이브러리를 사용하여 압축 필요
  // 여기서는 간단히 Base64로 인코딩만 수행
  return serializeToBase64(data);
}

/**
 * 압축된 형태로 직렬화된 문자열을 객체로 역직렬화합니다.
 * 이 함수는 개념적인 것으로, 실제 구현에서는 압축 라이브러리가 필요합니다.
 * 
 * @param compressed 압축된 문자열 (Base64 인코딩)
 * @returns 역직렬화된 객체
 */
export function deserializeCompressed<T>(compressed: string): T {
  // 실제 구현에서는 pako 등의 라이브러리를 사용하여 압축 해제 필요
  // 여기서는 간단히 Base64 디코딩만 수행
  return deserializeFromBase64<T>(compressed);
}

/**
 * 안전한 방식으로 객체를 복제합니다.
 * 
 * @param obj 복제할 객체
 * @returns 복제된 객체
 */
export function safeClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (error) {
    throw new Error(`Failed to clone object: ${error.message}`);
  }
}

/**
 * 두 객체가 동일한지 비교합니다.
 * 
 * @param obj1 첫 번째 객체
 * @param obj2 두 번째 객체
 * @returns 동일 여부 (true/false)
 */
export function isEqual<T>(obj1: T, obj2: T): boolean {
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (error) {
    return false;
  }
}

/**
 * 객체에서 특정 필드만 추출하여 새 객체를 생성합니다.
 * 
 * @param obj 원본 객체
 * @param fields 추출할 필드 배열
 * @returns 추출된 필드가 포함된 새 객체
 */
export function pick<T, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  
  return result;
}

/**
 * 객체에서 특정 필드를 제외한 새 객체를 생성합니다.
 * 
 * @param obj 원본 객체
 * @param fields 제외할 필드 배열
 * @returns 필드가 제외된 새 객체
 */
export function omit<T, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  
  for (const field of fields) {
    delete result[field as keyof Omit<T, K>];
  }
  
  return result;
}

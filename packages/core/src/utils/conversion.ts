/**
 * conversion.ts
 * 
 * 암호화폐 단위 변환 및 포맷팅 유틸리티 함수 모음.
 */

import { ValidationError } from './errors';

/**
 * 이더리움 단위
 */
export enum EthUnit {
  WEI = 'wei',
  KWEI = 'kwei',
  MWEI = 'mwei',
  GWEI = 'gwei',
  SZABO = 'szabo',
  FINNEY = 'finney',
  ETHER = 'ether'
}

/**
 * 이더리움 단위별 10의 거듭제곱 값
 */
export const ETH_UNIT_MAP: Record<EthUnit, number> = {
  [EthUnit.WEI]: 0,
  [EthUnit.KWEI]: 3,
  [EthUnit.MWEI]: 6,
  [EthUnit.GWEI]: 9,
  [EthUnit.SZABO]: 12,
  [EthUnit.FINNEY]: 15,
  [EthUnit.ETHER]: 18
};

/**
 * 화폐 단위에 따른 포맷 옵션
 */
export interface TokenFormatOptions {
  locale?: string;
  symbol?: string;
  decimals?: number;
  decimalPlaces?: number;
  groupSeparator?: boolean;
  symbolPosition?: 'before' | 'after';
  trimTrailingZeros?: boolean;
}

/**
 * Wei를 이더 단위로 변환
 * @param wei Wei 단위 값 (문자열 또는 숫자)
 * @returns 이더 단위 값 (문자열)
 */
export function weiToEther(wei: string | number | bigint): string {
  const weiBigInt = BigInt(wei.toString());
  const divisor = BigInt(10 ** 18);
  
  const wholePart = weiBigInt / divisor;
  const fractionPart = weiBigInt % divisor;
  
  if (fractionPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionStr = fractionPart.toString().padStart(18, '0');
  return `${wholePart}.${fractionStr}`.replace(/\.?0+$/, '');
}

/**
 * Wei를 Gwei 단위로 변환
 * @param wei Wei 단위 값 (문자열 또는 숫자)
 * @returns Gwei 단위 값 (문자열)
 */
export function weiToGwei(wei: string | number | bigint): string {
  const weiBigInt = BigInt(wei.toString());
  const divisor = BigInt(10 ** 9);
  
  const wholePart = weiBigInt / divisor;
  const fractionPart = weiBigInt % divisor;
  
  if (fractionPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionStr = fractionPart.toString().padStart(9, '0');
  return `${wholePart}.${fractionStr}`.replace(/\.?0+$/, '');
}

/**
 * 이더를 Wei 단위로 변환
 * @param ether 이더 단위 값 (문자열 또는 숫자)
 * @returns Wei 단위 값 (문자열)
 */
export function etherToWei(ether: string | number): string {
  const etherStr = ether.toString();
  
  if (!/^\d*\.?\d*$/.test(etherStr)) {
    throw new ValidationError(`Invalid ether value: ${etherStr}`);
  }
  
  const parts = etherStr.split('.');
  const wholePart = parts[0];
  const fractionPart = parts.length > 1 ? parts[1] : '';
  
  // 소수점 이하 부분이 18자리를 초과하는 경우 오류
  if (fractionPart.length > 18) {
    throw new ValidationError(
      `Ether value has too many decimal places: ${etherStr}. Maximum is 18.`
    );
  }
  
  const paddedFractionPart = fractionPart.padEnd(18, '0');
  
  // 앞의 0 제거
  const trimmedWholePart = wholePart.replace(/^0+/, '') || '0';
  
  // BigInt 사용하여 계산
  if (trimmedWholePart === '0' && /^0*$/.test(paddedFractionPart)) {
    return '0';
  }
  
  const result = `${trimmedWholePart}${paddedFractionPart}`;
  return result.replace(/^0+/, '') || '0';
}

/**
 * Gwei를 Wei 단위로 변환
 * @param gwei Gwei 단위 값 (문자열 또는 숫자)
 * @returns Wei 단위 값 (문자열)
 */
export function gweiToWei(gwei: string | number): string {
  const gweiStr = gwei.toString();
  
  if (!/^\d*\.?\d*$/.test(gweiStr)) {
    throw new ValidationError(`Invalid gwei value: ${gweiStr}`);
  }
  
  const parts = gweiStr.split('.');
  const wholePart = parts[0];
  const fractionPart = parts.length > 1 ? parts[1] : '';
  
  // 소수점 이하 부분이 9자리를 초과하는 경우 오류
  if (fractionPart.length > 9) {
    throw new ValidationError(
      `Gwei value has too many decimal places: ${gweiStr}. Maximum is 9.`
    );
  }
  
  const paddedFractionPart = fractionPart.padEnd(9, '0');
  
  // 앞의 0 제거
  const trimmedWholePart = wholePart.replace(/^0+/, '') || '0';
  
  // 결과 계산
  if (trimmedWholePart === '0' && /^0*$/.test(paddedFractionPart)) {
    return '0';
  }
  
  const result = `${trimmedWholePart}${paddedFractionPart}`;
  return result.replace(/^0+/, '') || '0';
}

/**
 * 지정된 이더리움 단위 간 변환
 * @param value 변환할 값 (문자열 또는 숫자)
 * @param fromUnit 변환 전 단위
 * @param toUnit 변환 후 단위
 * @returns 변환된 값 (문자열)
 */
export function convertUnit(
  value: string | number,
  fromUnit: EthUnit,
  toUnit: EthUnit
): string {
  const valueStr = value.toString();
  
  if (!/^\d*\.?\d*$/.test(valueStr)) {
    throw new ValidationError(`Invalid value: ${valueStr}`);
  }
  
  if (fromUnit === toUnit) {
    return valueStr;
  }
  
  const fromPower = ETH_UNIT_MAP[fromUnit];
  const toPower = ETH_UNIT_MAP[toUnit];
  
  if (fromPower === undefined || toPower === undefined) {
    throw new ValidationError('Invalid unit');
  }
  
  const parts = valueStr.split('.');
  const wholePart = parts[0];
  const fractionPart = parts.length > 1 ? parts[1] : '';
  
  // 앞의 0 제거
  const trimmedWholePart = wholePart.replace(/^0+/, '') || '0';
  
  if (fromPower < toPower) {
    // 작은 단위에서 큰 단위로 변환 (예: wei -> ether)
    const diff = toPower - fromPower;
    
    // 소수점 이하 자리수 계산
    const resultFractionPart = trimmedWholePart.padStart(diff, '0').slice(-diff) +
      fractionPart;
    
    // 정수 부분 계산
    const resultWholePart = trimmedWholePart.length > diff ?
      trimmedWholePart.slice(0, -diff) : '0';
    
    if (resultFractionPart.length === 0) {
      return resultWholePart;
    }
    
    return `${resultWholePart}.${resultFractionPart}`.replace(/\.?0+$/, '');
  } else {
    // 큰 단위에서 작은 단위로 변환 (예: ether -> wei)
    const diff = fromPower - toPower;
    
    // 결과 계산
    const resultWholePart = trimmedWholePart + fractionPart.padEnd(diff, '0');
    
    return resultWholePart.replace(/^0+/, '') || '0';
  }
}

/**
 * 토큰 값을 사용자 친화적인 형식으로 포맷팅
 * @param value 토큰 값 (wei 단위)
 * @param options 포맷 옵션
 * @returns 포맷팅된 문자열
 */
export function formatTokenValue(
  value: string | number | bigint,
  options: TokenFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    symbol = 'ETH',
    decimals = 18,
    decimalPlaces = 6,
    groupSeparator = true,
    symbolPosition = 'before',
    trimTrailingZeros = true
  } = options;
  
  // 큰 숫자 처리를 위해 BigInt 사용
  const valueBigInt = BigInt(value.toString());
  const divisor = BigInt(10 ** decimals);
  
  const wholePart = valueBigInt / divisor;
  const fractionPart = valueBigInt % divisor;
  
  // 소수점 이하 처리
  let fractionStr = fractionPart.toString().padStart(decimals, '0');
  
  // 표시할 소수점 자리수로 제한
  fractionStr = fractionStr.slice(0, decimalPlaces);
  
  // 소수점 이하가 모두 0인 경우 처리
  if (trimTrailingZeros && /^0*$/.test(fractionStr)) {
    fractionStr = '';
  }
  
  // 숫자 포맷팅
  const numberFormatter = new Intl.NumberFormat(locale, {
    useGrouping: groupSeparator,
    minimumFractionDigits: fractionStr.length,
    maximumFractionDigits: fractionStr.length
  });
  
  const formattedNumber = numberFormatter.format(
    parseFloat(`${wholePart}.${fractionStr || '0'}`)
  );
  
  // 심볼 위치에 따른 최종 포맷팅
  if (symbolPosition === 'before') {
    return `${symbol} ${formattedNumber}`;
  } else {
    return `${formattedNumber} ${symbol}`;
  }
}

/**
 * 가스 가격을 사용자 친화적인 형식으로 포맷팅
 * @param gasPriceWei 가스 가격 (wei 단위)
 * @param decimals 표시할 소수점 자리수
 * @returns 포맷팅된 가스 가격 (Gwei 단위)
 */
export function formatGasPrice(
  gasPriceWei: string | number | bigint,
  decimals: number = 2
): string {
  const gasGwei = weiToGwei(gasPriceWei);
  
  // 숫자 변환
  const gasNumber = parseFloat(gasGwei);
  
  // 소수점 제한
  return gasNumber.toFixed(decimals) + ' Gwei';
}

/**
 * 가스 한도를 포맷팅
 * @param gasLimit 가스 한도
 * @returns 포맷팅된 가스 한도
 */
export function formatGasLimit(gasLimit: string | number | bigint): string {
  const gasLimitStr = gasLimit.toString();
  
  // 숫자 포맷팅
  const gasLimitNumber = parseInt(gasLimitStr, 10);
  
  return gasLimitNumber.toLocaleString('en-US');
}

/**
 * 최대 가스 비용 계산 (가스 가격 * 가스 한도)
 * @param gasPriceWei 가스 가격 (wei 단위)
 * @param gasLimit 가스 한도
 * @returns 최대 가스 비용 (wei 단위)
 */
export function calculateMaxGasFee(
  gasPriceWei: string | number | bigint,
  gasLimit: string | number | bigint
): string {
  const gasPriceBigInt = BigInt(gasPriceWei.toString());
  const gasLimitBigInt = BigInt(gasLimit.toString());
  
  const result = gasPriceBigInt * gasLimitBigInt;
  
  return result.toString();
}

/**
 * 16진수 문자열을 10진수 문자열로 변환
 * @param hex 16진수 문자열
 * @returns 10진수 문자열
 */
export function hexToDecimal(hex: string): string {
  if (!hex.startsWith('0x')) {
    throw new ValidationError('Invalid hex string: must start with 0x');
  }
  
  const bigInt = BigInt(hex);
  return bigInt.toString();
}

/**
 * 10진수 문자열을 16진수 문자열로 변환
 * @param decimal 10진수 문자열 또는 숫자
 * @returns 16진수 문자열 (0x 접두사 포함)
 */
export function decimalToHex(decimal: string | number | bigint): string {
  const bigInt = BigInt(decimal.toString());
  return '0x' + bigInt.toString(16);
}

/**
 * 트랜잭션 비용을 포맷팅
 * @param gasFeeWei 가스 비용 (wei 단위)
 * @param options 포맷 옵션
 * @returns 포맷팅된 트랜잭션 비용
 */
export function formatTransactionFee(
  gasFeeWei: string | number | bigint,
  options: TokenFormatOptions = {}
): string {
  // wei를 ether로 변환하여 포맷팅
  return formatTokenValue(gasFeeWei, {
    symbol: 'ETH',
    decimals: 18,
    decimalPlaces: 8,
    ...options
  });
}

/**
 * 토큰 금액을 토큰의 최소 단위로 변환 (예: 1.5 CTA -> 1500000000000000000)
 * @param amount 토큰 금액
 * @param decimals 토큰의 소수점 자리수
 * @returns 토큰의 최소 단위 금액 (문자열)
 */
export function parseTokenAmount(amount: string | number, decimals: number): string {
  const amountStr = amount.toString();
  
  if (!/^\d*\.?\d*$/.test(amountStr)) {
    throw new ValidationError(`Invalid token amount: ${amountStr}`);
  }
  
  const parts = amountStr.split('.');
  const wholePart = parts[0];
  const fractionPart = parts.length > 1 ? parts[1] : '';
  
  // 소수점 이하 부분이 토큰의 소수점 자리수를 초과하는 경우 오류
  if (fractionPart.length > decimals) {
    throw new ValidationError(
      `Token amount has too many decimal places: ${amountStr}. Maximum is ${decimals}.`
    );
  }
  
  const paddedFractionPart = fractionPart.padEnd(decimals, '0');
  
  // 앞의 0 제거
  const trimmedWholePart = wholePart.replace(/^0+/, '') || '0';
  
  // 결과 계산
  if (trimmedWholePart === '0' && /^0*$/.test(paddedFractionPart)) {
    return '0';
  }
  
  const result = `${trimmedWholePart}${paddedFractionPart}`;
  return result.replace(/^0+/, '') || '0';
}

/**
 * 토큰의 최소 단위를 토큰 금액으로 변환 (예: 1500000000000000000 -> 1.5 CTA)
 * @param amount 토큰의 최소 단위 금액
 * @param decimals 토큰의 소수점 자리수
 * @returns 토큰 금액 (문자열)
 */
export function formatTokenAmount(amount: string | number | bigint, decimals: number): string {
  const amountBigInt = BigInt(amount.toString());
  const divisor = BigInt(10 ** decimals);
  
  const wholePart = amountBigInt / divisor;
  const fractionPart = amountBigInt % divisor;
  
  if (fractionPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionStr = fractionPart.toString().padStart(decimals, '0');
  return `${wholePart}.${fractionStr}`.replace(/\.?0+$/, '');
}

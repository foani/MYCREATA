/**
 * @file gas.ts
 * @description 가스 관리 및 최적화 모듈
 */

import { IProvider } from './providers/provider.interface';
import { createLogger } from '../utils/logging';
import { GasInfo } from '../types/chain.types';
import { TransactionType } from '../types/transactions.types';

// 로거 생성
const logger = createLogger('Gas');

/**
 * 가스 추천 레벨
 */
export enum GasRecommendation {
  LOW = 'low',         // 낮은 가격 (느림)
  STANDARD = 'standard', // 표준 가격
  FAST = 'fast',       // 빠른 가격
  FASTEST = 'fastest'    // 가장 빠른 가격
}

/**
 * 가스 추천 배수
 */
interface GasMultipliers {
  [GasRecommendation.LOW]: number;
  [GasRecommendation.STANDARD]: number;
  [GasRecommendation.FAST]: number;
  [GasRecommendation.FASTEST]: number;
}

/**
 * 레거시 가스 가격 배수
 */
const LEGACY_GAS_MULTIPLIERS: GasMultipliers = {
  [GasRecommendation.LOW]: 0.9,
  [GasRecommendation.STANDARD]: 1.0,
  [GasRecommendation.FAST]: 1.3,
  [GasRecommendation.FASTEST]: 1.7
};

/**
 * EIP-1559 우선순위 수수료 배수
 */
const EIP1559_PRIORITY_FEE_MULTIPLIERS: GasMultipliers = {
  [GasRecommendation.LOW]: 0.9,
  [GasRecommendation.STANDARD]: 1.0,
  [GasRecommendation.FAST]: 1.6,
  [GasRecommendation.FASTEST]: 2.5
};

/**
 * EIP-1559 최대 수수료 배수 (기본 수수료 대비)
 */
const EIP1559_MAX_FEE_MULTIPLIERS: GasMultipliers = {
  [GasRecommendation.LOW]: 1.2,
  [GasRecommendation.STANDARD]: 1.5,
  [GasRecommendation.FAST]: 2.0,
  [GasRecommendation.FASTEST]: 3.0
};

/**
 * 체인별 기본 가스 한도
 */
const DEFAULT_GAS_LIMIT: { [chainId: number]: string } = {
  1: '21000',        // 이더리움 메인넷 (일반 전송)
  1000: '21000',     // Catena 메인넷 (일반 전송)
  9000: '21000',     // Catena 테스트넷 (일반 전송)
  137: '21000',      // Polygon 메인넷
  80001: '21000',    // Polygon Mumbai 테스트넷
  42161: '21000',    // Arbitrum
  421613: '21000'    // Arbitrum Goerli
};

/**
 * 최소 가스 가격 (wei)
 */
const MIN_GAS_PRICE: { [chainId: number]: string } = {
  1: '1000000000',     // 이더리움 메인넷 (1 gwei)
  1000: '500000000',   // Catena 메인넷 (0.5 gwei)
  9000: '500000000',   // Catena 테스트넷 (0.5 gwei)
  137: '1000000000',   // Polygon 메인넷 (1 gwei)
  80001: '1000000000', // Polygon Mumbai 테스트넷 (1 gwei)
  42161: '100000000',  // Arbitrum (0.1 gwei)
  421613: '100000000'  // Arbitrum Goerli (0.1 gwei)
};

/**
 * 가스 가격 정보 가져오기
 * 
 * @param provider 프로바이더
 * @param forceRefresh 강제 새로고침 여부
 * @returns 가스 정보
 */
export async function getGasInfo(provider: IProvider, forceRefresh = false): Promise<GasInfo> {
  try {
    // 현재 체인 ID
    const chainId = provider.chainId;
    
    // EIP-1559 지원 여부 확인
    const supportsEIP1559 = await provider.supportsEIP1559().catch(() => false);
    
    // 최신 블록 번호
    const latestBlock = await provider.getBlockNumber();
    
    let gasInfo: GasInfo;
    
    if (supportsEIP1559) {
      // EIP-1559 가스 정보
      gasInfo = await getEIP1559GasInfo(provider, latestBlock);
    } else {
      // 레거시 가스 정보
      gasInfo = await getLegacyGasInfo(provider, latestBlock);
    }
    
    // 네트워크 혼잡도 계산 (현재는 단순한 계산)
    // 실제로는 최근 블록의 가스 사용량, 가스 한도, 대기 풀의 트랜잭션 수 등을 고려해야 함
    gasInfo.networkCongestion = calculateNetworkCongestion(gasInfo);
    gasInfo.latestBlock = latestBlock;
    gasInfo.lastUpdated = Date.now();
    
    return gasInfo;
  } catch (error) {
    logger.error(`Failed to get gas info: ${error.message}`);
    
    // 기본 가스 정보 반환
    return {
      gasPrice: await provider.getGasPrice(),
      gasPriceType: 'legacy',
      safeLow: '0',
      standard: '0',
      fast: '0',
      fastest: '0',
      lastUpdated: Date.now()
    };
  }
}

/**
 * EIP-1559 가스 정보 가져오기
 * 
 * @param provider 프로바이더
 * @param latestBlock 최신 블록 번호
 * @returns 가스 정보
 */
async function getEIP1559GasInfo(provider: IProvider, latestBlock: number): Promise<GasInfo> {
  try {
    // 최근 20개 블록의 기본 수수료 이력 조회
    const feeHistory = await provider.send('eth_feeHistory', [20, 'latest', [10, 30, 60, 90]]);
    const baseFeePerGas = feeHistory.baseFeePerGas;
    const priorityFeePercentiles = feeHistory.reward;
    
    // 최신 블록의 기본 수수료
    const latestBaseFee = baseFeePerGas[baseFeePerGas.length - 1];
    
    // 이동 평균 우선순위 수수료
    const priorityFeeLow = calculateAverage(priorityFeePercentiles.map((fees: string[]) => BigInt(fees[0])));
    const priorityFeeMed = calculateAverage(priorityFeePercentiles.map((fees: string[]) => BigInt(fees[1])));
    const priorityFeeHigh = calculateAverage(priorityFeePercentiles.map((fees: string[]) => BigInt(fees[2])));
    const priorityFeeUrgent = calculateAverage(priorityFeePercentiles.map((fees: string[]) => BigInt(fees[3])));
    
    // 권장 우선순위 수수료 및 최대 수수료 계산
    const suggestedPriorityFee = priorityFeeMed;
    
    // 각 속도에 대한 우선순위 수수료
    const lowPriorityFee = BigInt(Math.floor(Number(priorityFeeLow) * EIP1559_PRIORITY_FEE_MULTIPLIERS[GasRecommendation.LOW]));
    const standardPriorityFee = BigInt(Math.floor(Number(priorityFeeMed) * EIP1559_PRIORITY_FEE_MULTIPLIERS[GasRecommendation.STANDARD]));
    const fastPriorityFee = BigInt(Math.floor(Number(priorityFeeHigh) * EIP1559_PRIORITY_FEE_MULTIPLIERS[GasRecommendation.FAST]));
    const fastestPriorityFee = BigInt(Math.floor(Number(priorityFeeUrgent) * EIP1559_PRIORITY_FEE_MULTIPLIERS[GasRecommendation.FASTEST]));
    
    // 최대 수수료 (기본 수수료 + 우선순위 수수료)
    const lowMaxFee = BigInt(latestBaseFee) * BigInt(Math.floor(EIP1559_MAX_FEE_MULTIPLIERS[GasRecommendation.LOW] * 100) / 100) + lowPriorityFee;
    const standardMaxFee = BigInt(latestBaseFee) * BigInt(Math.floor(EIP1559_MAX_FEE_MULTIPLIERS[GasRecommendation.STANDARD] * 100) / 100) + standardPriorityFee;
    const fastMaxFee = BigInt(latestBaseFee) * BigInt(Math.floor(EIP1559_MAX_FEE_MULTIPLIERS[GasRecommendation.FAST] * 100) / 100) + fastPriorityFee;
    const fastestMaxFee = BigInt(latestBaseFee) * BigInt(Math.floor(EIP1559_MAX_FEE_MULTIPLIERS[GasRecommendation.FASTEST] * 100) / 100) + fastestPriorityFee;
    
    // 기본 수수료 이력
    const baseFeeHistory = baseFeePerGas.map((fee: string) => fee.toString());
    
    // 결과 객체 구성
    return {
      gasPrice: standardMaxFee.toString(),
      maxFeePerGas: standardMaxFee.toString(),
      maxPriorityFeePerGas: standardPriorityFee.toString(),
      estimatedBaseFee: latestBaseFee,
      gasPriceType: 'eip1559',
      safeLow: lowMaxFee.toString(),
      standard: standardMaxFee.toString(),
      fast: fastMaxFee.toString(),
      fastest: fastestMaxFee.toString(),
      baseFeePerGas: latestBaseFee,
      suggestedPriorityFee: suggestedPriorityFee.toString(),
      baseFeeHistory,
      lastUpdated: Date.now()
    };
  } catch (error) {
    logger.error(`Failed to get EIP-1559 gas info: ${error.message}`);
    throw error;
  }
}

/**
 * 레거시 가스 정보 가져오기
 * 
 * @param provider 프로바이더
 * @param latestBlock 최신 블록 번호
 * @returns 가스 정보
 */
async function getLegacyGasInfo(provider: IProvider, latestBlock: number): Promise<GasInfo> {
  try {
    // 현재 가스 가격 조회
    const gasPrice = await provider.getGasPrice();
    const gasPriceValue = BigInt(gasPrice);
    
    // 최소 가스 가격 보장
    const chainId = provider.chainId;
    const minGasPrice = BigInt(MIN_GAS_PRICE[chainId] || '1000000000'); // 기본값: 1 gwei
    
    const safeLow = gasPriceValue < minGasPrice ? minGasPrice : 
      BigInt(Math.floor(Number(gasPriceValue) * LEGACY_GAS_MULTIPLIERS[GasRecommendation.LOW]));
    
    const standard = gasPriceValue < minGasPrice ? minGasPrice : 
      BigInt(Math.floor(Number(gasPriceValue) * LEGACY_GAS_MULTIPLIERS[GasRecommendation.STANDARD]));
    
    const fast = gasPriceValue < minGasPrice ? minGasPrice * BigInt(LEGACY_GAS_MULTIPLIERS[GasRecommendation.FAST] * 100) / BigInt(100) : 
      BigInt(Math.floor(Number(gasPriceValue) * LEGACY_GAS_MULTIPLIERS[GasRecommendation.FAST]));
    
    const fastest = gasPriceValue < minGasPrice ? minGasPrice * BigInt(LEGACY_GAS_MULTIPLIERS[GasRecommendation.FASTEST] * 100) / BigInt(100) : 
      BigInt(Math.floor(Number(gasPriceValue) * LEGACY_GAS_MULTIPLIERS[GasRecommendation.FASTEST]));
    
    // 결과 객체 구성
    return {
      gasPrice: standard.toString(),
      gasPriceType: 'legacy',
      safeLow: safeLow.toString(),
      standard: standard.toString(),
      fast: fast.toString(),
      fastest: fastest.toString(),
      lastUpdated: Date.now()
    };
  } catch (error) {
    logger.error(`Failed to get legacy gas info: ${error.message}`);
    throw error;
  }
}

/**
 * 네트워크 혼잡도 계산
 * 
 * @param gasInfo 가스 정보
 * @returns 혼잡도 (0-1)
 */
function calculateNetworkCongestion(gasInfo: GasInfo): number {
  // 간단한 혼잡도 계산 예시
  // 실제로는 최근 블록의 가스 사용량, 가스 한도, 대기 풀의 트랜잭션 수 등을 고려해야 함
  if (gasInfo.gasPriceType === 'eip1559' && gasInfo.baseFeePerGas) {
    // EIP-1559 기준
    const baseFee = BigInt(gasInfo.baseFeePerGas);
    const priorityFee = BigInt(gasInfo.suggestedPriorityFee || '0');
    const total = baseFee + priorityFee;
    
    // 임계값 (각 체인마다 맞게 조정 필요)
    const lowCongestion = BigInt('1000000000'); // 1 gwei
    const highCongestion = BigInt('100000000000'); // 100 gwei
    
    if (total <= lowCongestion) {
      return 0.1;
    } else if (total >= highCongestion) {
      return 1.0;
    } else {
      return Number((total - lowCongestion) * BigInt(900) / (highCongestion - lowCongestion)) / 1000 + 0.1;
    }
  } else {
    // 레거시 기준
    const gasPrice = BigInt(gasInfo.gasPrice || '0');
    
    // 임계값 (각 체인마다 맞게 조정 필요)
    const lowCongestion = BigInt('1000000000'); // 1 gwei
    const highCongestion = BigInt('100000000000'); // 100 gwei
    
    if (gasPrice <= lowCongestion) {
      return 0.1;
    } else if (gasPrice >= highCongestion) {
      return 1.0;
    } else {
      return Number((gasPrice - lowCongestion) * BigInt(900) / (highCongestion - lowCongestion)) / 1000 + 0.1;
    }
  }
}

/**
 * BigInt 배열의 평균 계산
 * 
 * @param values BigInt 배열
 * @returns 평균값 (BigInt)
 */
function calculateAverage(values: bigint[]): bigint {
  if (values.length === 0) {
    return BigInt(0);
  }
  
  let sum = BigInt(0);
  for (const value of values) {
    sum += value;
  }
  
  return sum / BigInt(values.length);
}

/**
 * 권장 가스 설정 가져오기
 * 
 * @param gasInfo 가스 정보
 * @param level 권장 레벨
 * @returns 가스 설정
 */
export function getRecommendedGasSettings(
  gasInfo: GasInfo,
  level: GasRecommendation = GasRecommendation.STANDARD
): {
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  type: TransactionType;
} {
  // EIP-1559 가스 정보
  if (gasInfo.gasPriceType === 'eip1559' && gasInfo.maxFeePerGas && gasInfo.maxPriorityFeePerGas) {
    let maxFeePerGas: string;
    let maxPriorityFeePerGas: string;
    
    switch (level) {
      case GasRecommendation.LOW:
        maxFeePerGas = gasInfo.safeLow || gasInfo.maxFeePerGas;
        maxPriorityFeePerGas = gasInfo.suggestedPriorityFee || gasInfo.maxPriorityFeePerGas;
        break;
      case GasRecommendation.FAST:
        maxFeePerGas = gasInfo.fast || gasInfo.maxFeePerGas;
        maxPriorityFeePerGas = gasInfo.suggestedPriorityFee || gasInfo.maxPriorityFeePerGas;
        break;
      case GasRecommendation.FASTEST:
        maxFeePerGas = gasInfo.fastest || gasInfo.maxFeePerGas;
        maxPriorityFeePerGas = gasInfo.suggestedPriorityFee || gasInfo.maxPriorityFeePerGas;
        break;
      default:
        maxFeePerGas = gasInfo.standard || gasInfo.maxFeePerGas;
        maxPriorityFeePerGas = gasInfo.suggestedPriorityFee || gasInfo.maxPriorityFeePerGas;
    }
    
    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: TransactionType.EIP1559
    };
  } 
  // 레거시 가스 정보
  else {
    let gasPrice: string;
    
    switch (level) {
      case GasRecommendation.LOW:
        gasPrice = gasInfo.safeLow || gasInfo.gasPrice;
        break;
      case GasRecommendation.FAST:
        gasPrice = gasInfo.fast || gasInfo.gasPrice;
        break;
      case GasRecommendation.FASTEST:
        gasPrice = gasInfo.fastest || gasInfo.gasPrice;
        break;
      default:
        gasPrice = gasInfo.standard || gasInfo.gasPrice;
    }
    
    return {
      gasPrice,
      type: TransactionType.LEGACY
    };
  }
}

/**
 * 가스 요약 텍스트 가져오기
 * 
 * @param gasInfo 가스 정보
 * @returns 가스 요약 문자열
 */
export function getGasSummary(gasInfo: GasInfo): string {
  if (gasInfo.gasPriceType === 'eip1559' && gasInfo.baseFeePerGas) {
    return `Base Fee: ${formatGwei(gasInfo.baseFeePerGas)} gwei, Priority Fee: ${formatGwei(gasInfo.suggestedPriorityFee || '0')} gwei, Max Fee: ${formatGwei(gasInfo.maxFeePerGas || '0')} gwei`;
  } else {
    return `Gas Price: ${formatGwei(gasInfo.gasPrice)} gwei`;
  }
}

/**
 * wei를 gwei로 변환하고 포맷팅
 * 
 * @param wei wei 단위 문자열
 * @param decimals 소수점 자릿수
 * @returns gwei 단위 문자열
 */
function formatGwei(wei: string, decimals: number = 2): string {
  const gwei = BigInt(wei) / BigInt(1000000000);
  return (Number(gwei) / 1).toFixed(decimals);
}

/**
 * 가스 설정의 사용자 친화적 텍스트 가져오기
 * 
 * @param gasSettings 가스 설정
 * @returns 사용자 친화적 텍스트
 */
export function getGasSettingsText(gasSettings: {
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  type: TransactionType;
}): string {
  if (gasSettings.type === TransactionType.EIP1559) {
    return `Max Fee: ${formatGwei(gasSettings.maxFeePerGas || '0')} gwei, Priority Fee: ${formatGwei(gasSettings.maxPriorityFeePerGas || '0')} gwei`;
  } else {
    return `Gas Price: ${formatGwei(gasSettings.gasPrice || '0')} gwei`;
  }
}

/**
 * 작업에 대한 기본 가스 한도 가져오기
 * 
 * @param chainId 체인 ID
 * @param operationType 작업 타입
 * @returns 가스 한도
 */
export function getDefaultGasLimit(
  chainId: number,
  operationType: 'transfer' | 'tokenTransfer' | 'swap' | 'contract' | 'other' = 'transfer'
): string {
  const baseLimit = DEFAULT_GAS_LIMIT[chainId] || '21000';
  
  switch (operationType) {
    case 'transfer':
      return baseLimit;
    case 'tokenTransfer':
      return '65000';
    case 'swap':
      return '250000';
    case 'contract':
      return '150000';
    default:
      return '100000';
  }
}

/**
 * EIP-1559 지원 여부에 따라 트랜잭션 타입 결정
 * 
 * @param supportsEIP1559 EIP-1559 지원 여부
 * @returns 트랜잭션 타입
 */
export function determineTransactionType(supportsEIP1559: boolean): TransactionType {
  return supportsEIP1559 ? TransactionType.EIP1559 : TransactionType.LEGACY;
}

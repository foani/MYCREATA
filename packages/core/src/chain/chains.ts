/**
 * @file chains.ts
 * @description 블록체인 네트워크 메타데이터 및 관리
 */

import { NetworkInfo, NetworkType, SupportedChainId, ChainFeature } from '../types/chain.types';
import { CATENA_CONTRACTS } from './contracts';

/**
 * 지원되는 체인 목록
 */
export const SUPPORTED_CHAINS: NetworkInfo[] = [
  // Catena 메인넷
  {
    name: 'Catena (CIP-20) Chain Mainnet',
    chainId: SupportedChainId.CATENA_MAINNET,
    rpcUrl: 'https://cvm.node.creatachain.com',
    blockExplorerUrl: 'https://catena.explorer.creatachain.com',
    symbol: 'CTA',
    decimals: 18,
    type: NetworkType.MAINNET,
    logo: 'https://assets.creatachain.com/icons/catena.svg',
    nativeCurrency: {
      name: 'Catena',
      symbol: 'CTA',
      decimals: 18
    },
    enabled: true,
    order: 1,
    namedChainId: 'catena',
    testnet: false,
    feature: [
      ChainFeature.CATENA,
      ChainFeature.ERC20,
      ChainFeature.NFT,
      ChainFeature.DID
    ]
  },
  
  // Catena 테스트넷
  {
    name: 'Catena (CIP-20) Chain Testnet',
    chainId: SupportedChainId.CATENA_TESTNET,
    rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
    blockExplorerUrl: 'https://testnet.cvm.creatachain.com',
    symbol: 'CTA',
    decimals: 18,
    type: NetworkType.TESTNET,
    logo: 'https://assets.creatachain.com/icons/catena-testnet.svg',
    nativeCurrency: {
      name: 'Catena',
      symbol: 'CTA',
      decimals: 18
    },
    enabled: true,
    order: 2,
    namedChainId: 'catena-testnet',
    testnet: true,
    feature: [
      ChainFeature.CATENA,
      ChainFeature.ERC20,
      ChainFeature.NFT,
      ChainFeature.DID
    ]
  },
  
  // 이더리움 메인넷
  {
    name: 'Ethereum Mainnet',
    chainId: SupportedChainId.ETHEREUM,
    rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_API_KEY}',
    blockExplorerUrl: 'https://etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    type: NetworkType.MAINNET,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    enabled: true,
    order: 3,
    gasStationUrl: 'https://ethgasstation.info/api/ethgasAPI.json',
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    namedChainId: 'ethereum',
    testnet: false,
    feature: [
      ChainFeature.EIP1559,
      ChainFeature.ENS,
      ChainFeature.NFT,
      ChainFeature.DEFI,
      ChainFeature.ERC20,
      ChainFeature.STAKING,
      ChainFeature.BRIDGE
    ]
  },
  
  // 이더리움 Sepolia 테스트넷
  {
    name: 'Ethereum Sepolia Testnet',
    chainId: SupportedChainId.ETHEREUM_SEPOLIA,
    rpcUrl: 'https://sepolia.infura.io/v3/${INFURA_API_KEY}',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    type: NetworkType.TESTNET,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    enabled: true,
    order: 4,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    namedChainId: 'sepolia',
    testnet: true,
    feature: [
      ChainFeature.EIP1559,
      ChainFeature.ENS,
      ChainFeature.NFT,
      ChainFeature.ERC20
    ]
  },
  
  // Polygon 메인넷
  {
    name: 'Polygon Mainnet',
    chainId: SupportedChainId.POLYGON,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    symbol: 'MATIC',
    decimals: 18,
    type: NetworkType.MAINNET,
    logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    enabled: true,
    order: 5,
    gasStationUrl: 'https://gasstation-mainnet.matic.network',
    namedChainId: 'polygon',
    testnet: false,
    feature: [
      ChainFeature.EIP1559,
      ChainFeature.NFT,
      ChainFeature.DEFI,
      ChainFeature.ERC20,
      ChainFeature.BRIDGE
    ]
  },
  
  // Polygon Mumbai 테스트넷
  {
    name: 'Polygon Mumbai Testnet',
    chainId: SupportedChainId.POLYGON_MUMBAI,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    symbol: 'MATIC',
    decimals: 18,
    type: NetworkType.TESTNET,
    logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    enabled: true,
    order: 6,
    gasStationUrl: 'https://gasstation-mumbai.matic.today',
    namedChainId: 'mumbai',
    testnet: true,
    feature: [
      ChainFeature.EIP1559,
      ChainFeature.NFT,
      ChainFeature.ERC20
    ]
  },
  
  // Arbitrum One
  {
    name: 'Arbitrum One',
    chainId: SupportedChainId.ARBITRUM,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    symbol: 'ETH',
    decimals: 18,
    type: NetworkType.MAINNET,
    logo: 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    enabled: true,
    order: 7,
    namedChainId: 'arbitrum',
    testnet: false,
    feature: [
      ChainFeature.EIP1559,
      ChainFeature.NFT,
      ChainFeature.DEFI,
      ChainFeature.ERC20,
      ChainFeature.BRIDGE
    ]
  }
];

/**
 * 체인 ID로 네트워크 정보 조회
 * 
 * @param chainId 체인 ID
 * @returns 네트워크 정보 또는 undefined
 */
export function getNetworkInfo(chainId: number): NetworkInfo | undefined {
  return SUPPORTED_CHAINS.find(chain => chain.chainId === chainId);
}

/**
 * 체인 ID로 RPC URL 조회
 * 
 * @param chainId 체인 ID
 * @param apiKey API 키
 * @returns RPC URL 또는 undefined
 */
export function getRpcUrl(chainId: number, apiKey?: Record<string, string>): string | undefined {
  const network = getNetworkInfo(chainId);
  
  if (!network) {
    return undefined;
  }
  
  let rpcUrl = network.rpcUrl;
  
  // API 키 치환
  if (apiKey && rpcUrl.includes('${')) {
    for (const [key, value] of Object.entries(apiKey)) {
      rpcUrl = rpcUrl.replace(`\${${key}}`, value);
    }
  }
  
  return rpcUrl;
}

/**
 * 체인 ID로 블록 탐색기 URL 조회
 * 
 * @param chainId 체인 ID
 * @returns 블록 탐색기 URL 또는 undefined
 */
export function getExplorerUrl(chainId: number): string | undefined {
  const network = getNetworkInfo(chainId);
  return network?.blockExplorerUrl;
}

/**
 * 트랜잭션 해시에 대한 탐색기 URL 생성
 * 
 * @param chainId 체인 ID
 * @param txHash 트랜잭션 해시
 * @returns 트랜잭션 탐색기 URL
 */
export function getTransactionExplorerUrl(chainId: number, txHash: string): string | undefined {
  const explorerUrl = getExplorerUrl(chainId);
  
  if (!explorerUrl) {
    return undefined;
  }
  
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * 주소에 대한 탐색기 URL 생성
 * 
 * @param chainId 체인 ID
 * @param address 주소
 * @returns 주소 탐색기 URL
 */
export function getAddressExplorerUrl(chainId: number, address: string): string | undefined {
  const explorerUrl = getExplorerUrl(chainId);
  
  if (!explorerUrl) {
    return undefined;
  }
  
  return `${explorerUrl}/address/${address}`;
}

/**
 * 체인별 계약 주소 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 계약 주소 맵
 */
export function getChainContracts(chainId: number): Record<string, string> {
  switch (chainId) {
    case SupportedChainId.CATENA_MAINNET:
      return CATENA_CONTRACTS.MAINNET;
    case SupportedChainId.CATENA_TESTNET:
      return CATENA_CONTRACTS.TESTNET;
    default:
      return {};
  }
}

/**
 * 체인 이름의 짧은 버전 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 짧은 체인 이름
 */
export function getShortChainName(chainId: number): string {
  switch (chainId) {
    case SupportedChainId.CATENA_MAINNET:
      return 'Catena';
    case SupportedChainId.CATENA_TESTNET:
      return 'Catena Testnet';
    case SupportedChainId.ETHEREUM:
      return 'Ethereum';
    case SupportedChainId.ETHEREUM_SEPOLIA:
      return 'Sepolia';
    case SupportedChainId.POLYGON:
      return 'Polygon';
    case SupportedChainId.POLYGON_MUMBAI:
      return 'Mumbai';
    case SupportedChainId.ARBITRUM:
      return 'Arbitrum';
    default:
      return `Chain ${chainId}`;
  }
}

/**
 * 주어진 특성이 있는 체인 목록 가져오기
 * 
 * @param feature 찾을 특성
 * @returns 특성이 있는 체인 목록
 */
export function getChainsWithFeature(feature: ChainFeature): NetworkInfo[] {
  return SUPPORTED_CHAINS.filter(chain => chain.feature?.includes(feature));
}

/**
 * 메인넷 체인만 가져오기
 * 
 * @returns 메인넷 체인 목록
 */
export function getMainnetChains(): NetworkInfo[] {
  return SUPPORTED_CHAINS.filter(chain => chain.type === NetworkType.MAINNET);
}

/**
 * 테스트넷 체인만 가져오기
 * 
 * @returns 테스트넷 체인 목록
 */
export function getTestnetChains(): NetworkInfo[] {
  return SUPPORTED_CHAINS.filter(chain => chain.type === NetworkType.TESTNET);
}

/**
 * 체인 ID가 테스트넷인지 확인
 * 
 * @param chainId 체인 ID
 * @returns 테스트넷 여부
 */
export function isTestnet(chainId: number): boolean {
  const network = getNetworkInfo(chainId);
  return network?.testnet || false;
}

/**
 * 체인 ID가 지원되는지 확인
 * 
 * @param chainId 체인 ID
 * @returns 지원 여부
 */
export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAINS.some(chain => chain.chainId === chainId);
}

/**
 * 체인 ID가 활성화되어 있는지 확인
 * 
 * @param chainId 체인 ID
 * @returns 활성화 여부
 */
export function isEnabledChain(chainId: number): boolean {
  const network = getNetworkInfo(chainId);
  return network?.enabled || false;
}

/**
 * 특정 체인에 특성이 있는지 확인
 * 
 * @param chainId 체인 ID
 * @param feature 확인할 특성
 * @returns 특성 보유 여부
 */
export function hasFeature(chainId: number, feature: ChainFeature): boolean {
  const network = getNetworkInfo(chainId);
  return network?.feature?.includes(feature) || false;
}

/**
 * 네트워크 추가 파라미터 생성
 * 
 * @param chainId 체인 ID
 * @returns 네트워크 추가 파라미터
 */
export function getAddNetworkParams(chainId: number): {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
} | undefined {
  const network = getNetworkInfo(chainId);
  
  if (!network) {
    return undefined;
  }
  
  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: network.blockExplorerUrl ? [network.blockExplorerUrl] : undefined,
    iconUrls: network.logo ? [network.logo] : undefined
  };
}

/**
 * 체인 메타데이터 JSON 문자열 가져오기
 * 
 * @param chainId 체인 ID
 * @returns JSON 문자열
 */
export function getChainMetadata(chainId: number): string {
  const network = getNetworkInfo(chainId);
  
  if (!network) {
    return JSON.stringify({ error: 'Chain not supported' });
  }
  
  return JSON.stringify(network);
}

/**
 * 체인 목록을 파일로 내보내기 (JSON)
 * 
 * @param chains 체인 목록
 * @returns JSON 문자열
 */
export function exportChainListAsJson(chains: NetworkInfo[] = SUPPORTED_CHAINS): string {
  return JSON.stringify(chains, null, 2);
}

/**
 * 16진수 체인 ID를 10진수로 변환
 * 
 * @param hexChainId 16진수 체인 ID (0x 접두사 포함)
 * @returns 10진수 체인 ID
 */
export function hexChainIdToNumber(hexChainId: string): number {
  if (!hexChainId.startsWith('0x')) {
    throw new Error('Hex chain ID must start with 0x');
  }
  
  return parseInt(hexChainId, 16);
}

/**
 * 10진수 체인 ID를 16진수로 변환
 * 
 * @param chainId 10진수 체인 ID
 * @returns 16진수 체인 ID (0x 접두사 포함)
 */
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * 체인 타입을 문자열로 변환
 * 
 * @param type 체인 타입
 * @returns 사용자 친화적 타입 문자열
 */
export function formatNetworkType(type: NetworkType): string {
  switch (type) {
    case NetworkType.MAINNET:
      return 'Mainnet';
    case NetworkType.TESTNET:
      return 'Testnet';
    case NetworkType.DEVNET:
      return 'Development Network';
    case NetworkType.CUSTOM:
      return 'Custom Network';
    default:
      return 'Unknown';
  }
}

/**
 * 체인 특성을 문자열로 변환
 * 
 * @param feature 체인 특성
 * @returns 사용자 친화적 특성 문자열
 */
export function formatChainFeature(feature: ChainFeature): string {
  switch (feature) {
    case ChainFeature.EIP1559:
      return 'EIP-1559 (Advanced Fee Management)';
    case ChainFeature.ENS:
      return 'ENS (Name Service)';
    case ChainFeature.NFT:
      return 'NFT Support';
    case ChainFeature.DEFI:
      return 'DeFi Support';
    case ChainFeature.ERC20:
      return 'ERC-20 Tokens';
    case ChainFeature.DID:
      return 'DID (Decentralized Identifiers)';
    case ChainFeature.STAKING:
      return 'Staking Support';
    case ChainFeature.CATENA:
      return 'Catena Features';
    case ChainFeature.BRIDGE:
      return 'Cross-Chain Bridge';
    default:
      return 'Unknown Feature';
  }
}

/**
 * 체인 로고 URL 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 로고 URL 또는 undefined
 */
export function getChainLogoUrl(chainId: number): string | undefined {
  const network = getNetworkInfo(chainId);
  return network?.logo;
}

/**
 * 체인 네이티브 토큰 심볼 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 토큰 심볼 또는 undefined
 */
export function getChainNativeCurrencySymbol(chainId: number): string | undefined {
  const network = getNetworkInfo(chainId);
  return network?.nativeCurrency.symbol;
}

/**
 * 체인 네이티브 토큰 소수점 자릿수 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 소수점 자릿수 또는 18 (기본값)
 */
export function getChainNativeCurrencyDecimals(chainId: number): number {
  const network = getNetworkInfo(chainId);
  return network?.nativeCurrency.decimals || 18;
}

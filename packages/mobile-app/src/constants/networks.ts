import { Network } from '../types/network';

/**
 * 기본 네트워크 목록
 */
export const NETWORKS: Network[] = [
  {
    chainId: 1000,
    chainIdHex: '0x3E8',
    name: 'Catena (CIP-20) Chain Mainnet',
    symbol: 'CTA',
    decimals: 18,
    rpcUrl: 'https://cvm.node.creatachain.com',
    blockExplorerUrl: 'https://catena.explorer.creatachain.com',
    iconUrl: 'https://example.com/icons/catena.png', // 실제 URL로 교체 필요
  },
  {
    chainId: 9000,
    chainIdHex: '0x2328',
    name: 'Catena (CIP-20) Chain Testnet',
    symbol: 'CTA',
    decimals: 18,
    rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
    blockExplorerUrl: 'https://testnet.cvm.creatachain.com',
    iconUrl: 'https://example.com/icons/catena-testnet.png', // 실제 URL로 교체 필요
  },
  {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // 예시 Infura URL
    blockExplorerUrl: 'https://etherscan.io',
    iconUrl: 'https://example.com/icons/ethereum.png', // 실제 URL로 교체 필요
  },
  {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    iconUrl: 'https://example.com/icons/polygon.png', // 실제 URL로 교체 필요
  },
  {
    chainId: 42161,
    chainIdHex: '0xA4B1',
    name: 'Arbitrum One',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    iconUrl: 'https://example.com/icons/arbitrum.png', // 실제 URL로 교체 필요
  }
];

/**
 * 체인 ID로 네트워크 찾기
 */
export function getNetworkByChainId(chainId: number): Network | undefined {
  return NETWORKS.find(network => network.chainId === chainId);
}

/**
 * 체인 ID(16진수)로 네트워크 찾기
 */
export function getNetworkByChainIdHex(chainIdHex: string): Network | undefined {
  return NETWORKS.find(network => network.chainIdHex === chainIdHex);
}

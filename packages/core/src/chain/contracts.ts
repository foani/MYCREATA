/**
 * @file contracts.ts
 * @description 스마트 계약 관련 상수 및 유틸리티
 */

/**
 * ERC-20 토큰 표준 ABI
 */
export const ERC20_ABI = [
  // 읽기 전용 함수
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // 상태 변경 함수
  'function transfer(address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
  
  // 이벤트
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

/**
 * ERC-721 NFT 표준 ABI
 */
export const ERC721_ABI = [
  // 읽기 전용 함수
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  
  // 상태 변경 함수
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool _approved)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  
  // 이벤트
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'
];

/**
 * ERC-1155 멀티토큰 표준 ABI
 */
export const ERC1155_ABI = [
  // 읽기 전용 함수
  'function uri(uint256 id) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  
  // 상태 변경 함수
  'function setApprovalForAll(address operator, bool approved)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  
  // 이벤트
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
  'event URI(string value, uint256 indexed id)'
];

/**
 * DID 레지스트리 ABI
 */
export const DID_REGISTRY_ABI = [
  // 읽기 전용 함수
  'function getDID(bytes32 id) view returns (address controller, uint256 created, uint256 updated)',
  'function getController(bytes32 id) view returns (address)',
  'function isController(bytes32 id, address controller) view returns (bool)',
  'function getMetadata(bytes32 id) view returns (string)',
  
  // 상태 변경 함수
  'function createDID(bytes32 id, address controller, string metadata)',
  'function changeController(bytes32 id, address newController)',
  'function setMetadata(bytes32 id, string metadata)',
  'function revokeDID(bytes32 id)',
  
  // 이벤트
  'event DIDCreated(bytes32 indexed id, address indexed controller, string metadata)',
  'event DIDControllerChanged(bytes32 indexed id, address indexed newController)',
  'event DIDMetadataChanged(bytes32 indexed id, string metadata)',
  'event DIDRevoked(bytes32 indexed id)'
];

/**
 * Multicall ABI (여러 호출을 단일 요청으로 묶기)
 */
export const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  'function blockAndAggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function getBlockNumber() view returns (uint256 blockNumber)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)'
];

/**
 * ENS (Ethereum Name Service) 레지스트리 ABI
 */
export const ENS_REGISTRY_ABI = [
  'function owner(bytes32 node) view returns (address)',
  'function resolver(bytes32 node) view returns (address)',
  'function ttl(bytes32 node) view returns (uint64)',
  'function recordExists(bytes32 node) view returns (bool)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function setOwner(bytes32 node, address owner)',
  'function setSubnodeOwner(bytes32 node, bytes32 label, address owner)',
  'function setTTL(bytes32 node, uint64 ttl)',
  'function setResolver(bytes32 node, address resolver)',
  'function setApprovalForAll(address operator, bool approved)',
  'event Transfer(bytes32 indexed node, address owner)',
  'event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)',
  'event NewResolver(bytes32 indexed node, address resolver)',
  'event NewTTL(bytes32 indexed node, uint64 ttl)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'
];

/**
 * ENS 리졸버 ABI
 */
export const ENS_RESOLVER_ABI = [
  'function addr(bytes32 node) view returns (address)',
  'function name(bytes32 node) view returns (string)',
  'function text(bytes32 node, string key) view returns (string)',
  'function contenthash(bytes32 node) view returns (bytes)',
  'function interfaceImplementer(bytes32 node, bytes4 interfaceID) view returns (address)',
  'function setAddr(bytes32 node, address addr)',
  'function setName(bytes32 node, string name)',
  'function setText(bytes32 node, string key, string value)',
  'function setContenthash(bytes32 node, bytes hash)',
  'function setInterface(bytes32 node, bytes4 interfaceID, address implementer)',
  'event AddrChanged(bytes32 indexed node, address a)',
  'event NameChanged(bytes32 indexed node, string name)',
  'event TextChanged(bytes32 indexed node, string indexed indexedKey, string key)',
  'event ContenthashChanged(bytes32 indexed node, bytes hash)',
  'event InterfaceChanged(bytes32 indexed node, bytes4 indexed interfaceID, address implementer)'
];

/**
 * WETH (Wrapped Ether) ABI
 */
export const WETH_ABI = [
  ...ERC20_ABI,
  'function deposit() payable',
  'function withdraw(uint256 wad)'
];

/**
 * Catena 계약 주소
 */
export const CATENA_CONTRACTS = {
  // 메인넷
  MAINNET: {
    DID_REGISTRY: '0x0000000000000000000000000000000000000000', // 예시 주소 (실제 주소로 업데이트 필요)
    MULTICALL: '0x0000000000000000000000000000000000000000',
    WRAPPED_CTA: '0x0000000000000000000000000000000000000000'
  },
  // 테스트넷
  TESTNET: {
    DID_REGISTRY: '0x0000000000000000000000000000000000000000', // 예시 주소 (실제 주소로 업데이트 필요)
    MULTICALL: '0x0000000000000000000000000000000000000000',
    WRAPPED_CTA: '0x0000000000000000000000000000000000000000'
  }
};

/**
 * 인터페이스 ID (EIP-165)
 */
export const INTERFACE_IDS = {
  ERC165: '0x01ffc9a7',
  ERC721: '0x80ac58cd',
  ERC721_METADATA: '0x5b5e139f',
  ERC721_ENUMERABLE: '0x780e9d63',
  ERC1155: '0xd9b67a26',
  ERC1155_METADATA: '0x0e89341c'
};

/**
 * ERC-20 메서드 시그니처
 */
export const ERC20_METHOD_SIGNATURES = {
  TRANSFER: '0xa9059cbb', // transfer(address,uint256)
  APPROVE: '0x095ea7b3', // approve(address,uint256)
  TRANSFER_FROM: '0x23b872dd', // transferFrom(address,address,uint256)
  BALANCE_OF: '0x70a08231', // balanceOf(address)
  ALLOWANCE: '0xdd62ed3e' // allowance(address,address)
};

/**
 * 일반적인 메서드 시그니처
 */
export const COMMON_METHOD_SIGNATURES = {
  FALLBACK: '0x00000000',
  RECEIVE_ETH: '0xreceive',
  CONTRACT_DEPLOYMENT: '0xcontract_deployment'
};

/**
 * 주소가 계약인지 확인합니다 (온체인 검증)
 * 
 * @param provider 프로바이더
 * @param address 확인할 주소
 * @returns 계약 여부
 */
export async function isContract(provider: any, address: string): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    return code !== '0x' && code !== '';
  } catch (error) {
    return false;
  }
}

/**
 * 주소가 ERC-20 토큰인지 확인합니다 (휴리스틱 검증)
 * 
 * @param provider 프로바이더
 * @param address 확인할 토큰 주소
 * @returns ERC-20 토큰 여부
 */
export async function isERC20Token(provider: any, address: string): Promise<boolean> {
  try {
    const contract = new provider.Contract(address, [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)'
    ]);
    
    // 몇 가지 기본 함수 호출 시도
    const [name, symbol, decimals] = await Promise.all([
      contract.name().catch(() => null),
      contract.symbol().catch(() => null),
      contract.decimals().catch(() => null)
    ]);
    
    // 결과가 있으면 ERC-20 토큰으로 가정
    return !!(name || symbol || decimals);
  } catch (error) {
    return false;
  }
}

/**
 * 주소가 ERC-721 토큰(NFT)인지 확인합니다 (휴리스틱 검증)
 * 
 * @param provider 프로바이더
 * @param address 확인할 토큰 주소
 * @returns ERC-721 토큰 여부
 */
export async function isERC721Token(provider: any, address: string): Promise<boolean> {
  try {
    const contract = new provider.Contract(address, [
      'function supportsInterface(bytes4 interfaceId) view returns (bool)'
    ]);
    
    // ERC-721 인터페이스 ID 검증
    const isERC721 = await contract.supportsInterface(INTERFACE_IDS.ERC721).catch(() => false);
    
    return isERC721;
  } catch (error) {
    return false;
  }
}

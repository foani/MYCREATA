/**
 * utils/index.ts
 * 
 * CreLink 지갑의 유틸리티 모듈을 내보냅니다.
 */

// 모든 오류 유형
export * from './errors';

// 주소 관련 유틸리티
export {
  AddressType,
  isValidAddress,
  isValidENS,
  isValidZkDID,
  getAddressType,
  normalizeAddress,
  shortenAddress,
  toChecksumAddress,
  areAddressesEqual,
  isNullAddress,
  isContractAddress,
  getAddressColor,
  addressToBytes,
  bytesToAddress
} from './address';

// 단위 변환 유틸리티
export {
  EthUnit,
  ETH_UNIT_MAP,
  TokenFormatOptions,
  weiToEther,
  weiToGwei,
  etherToWei,
  gweiToWei,
  convertUnit,
  formatTokenValue,
  formatGasPrice,
  formatGasLimit,
  calculateMaxGasFee,
  hexToDecimal,
  decimalToHex,
  formatTransactionFee,
  parseTokenAmount,
  formatTokenAmount
} from './conversion';

// 입력 검증 유틸리티
export {
  isValidMnemonic,
  isValidPrivateKey,
  isValidTxHash,
  passwordStrength,
  isValidPin,
  isValidEmail,
  isValidUrl,
  isValidTokenAmount,
  isValidChainId,
  isValidGasPrice,
  isValidGasLimit,
  isValidRecipient,
  isValidHex,
  validateRequiredFields,
  validateObject,
  isValidTokenSymbol,
  isValidTokenName,
  isValidTokenDecimals,
  isValidText,
  isValidName,
  isValidRpcUrl,
  generateAccountId,
  isValidDate,
  isInRange
} from './validation';

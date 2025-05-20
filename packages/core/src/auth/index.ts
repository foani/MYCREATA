/**
 * auth/index.ts
 * 
 * CreLink 지갑의 인증 시스템 모듈을 내보냅니다.
 */

// 인증 관리자
export { 
  AuthenticationManager,
  AuthMethod,
  AuthConfig,
  AuthState,
  AuthCredentials
} from './authentication';

// zkDID 관련
export {
  ZkDIDManager,
  ZkDID,
  DIDType,
  DIDVerificationResult,
  DIDSignRequest
} from './zkdid';

// 생체 인증 관련
export {
  BiometricAuthInterface,
  BiometricType,
  BiometricAuthResult,
  BiometricOptions,
  WebBiometricAuth,
  MobileBiometricAuth,
  BiometricAuthFactory
} from './biometrics';

// 복구 관련
export {
  RecoveryManager,
  RecoveryMethod,
  RecoveryOptions,
  RecoveryResult,
  SeedPhraseRecoveryData,
  DIDRecoveryData,
  SocialRecoveryData,
  CloudRecoveryData
} from './recovery';

/**
 * storage/index.ts
 * 
 * CreLink 지갑의 스토리지 시스템 모듈을 내보냅니다.
 */

// 보안 스토리지
export {
  SecureStorageInterface,
  InMemorySecureStorage,
  BrowserSecureStorage,
  NativeSecureStorage,
  SecureStorageFactory
} from './secureStorage';

// 로컬 스토리지
export {
  LocalStoreInterface,
  InMemoryLocalStore,
  BrowserLocalStore,
  NativeLocalStore,
  LocalStoreFactory
} from './localStore';

// 동기화 스토리지
export {
  SyncConfig,
  SyncStatus,
  SyncResult,
  CloudProviderInterface,
  GoogleDriveProvider,
  SyncStorage
} from './syncStorage';

// 계정 모델
export {
  AccountType,
  AccountSource,
  Account,
  CrossChainAccount,
  AccountCollection,
  AccountModel
} from './models/account.model';

// 설정 모델
export {
  Theme,
  Language,
  Currency,
  GasPriceType,
  NetworkSettings,
  SecuritySettings,
  PrivacySettings,
  NotificationSettings,
  AdvancedSettings,
  WalletSettings,
  DEFAULT_SETTINGS,
  SettingsModel
} from './models/settings.model';

// 활동 모델
export {
  ActivityType,
  TransactionType,
  TransactionStatus,
  SignatureType,
  ActivityBase,
  TransactionActivity,
  SignatureActivity,
  DappConnectionActivity,
  TokenApprovalActivity,
  AccountChangeActivity,
  NetworkChangeActivity,
  Activity,
  ActivityFilter,
  ActivitySortOrder,
  ActivityModel
} from './models/activity.model';

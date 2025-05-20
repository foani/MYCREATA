import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

/**
 * 인증 스택 네비게이션 파라미터 목록
 */
export type AuthStackParamList = {
  Onboarding: undefined;
  SetPin: { fromBiometricSetup?: boolean };
  PinLogin: undefined;
  BiometricLogin: undefined;
  BiometricSetup: undefined;
};

/**
 * 메인 스택 네비게이션 파라미터 목록
 */
export type MainStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Assets: undefined;
  AssetDetail: { assetId: string };
  Send: { assetId?: string };
  Receive: { assetId?: string };
  TransactionHistory: undefined;
  TransactionDetail: { txId: string };
  Scan: undefined;
  Settings: undefined;
  Security: undefined;
  BiometricSetup: undefined;
  LanguageSettings: undefined;
  NetworkSettings: undefined;
  DID: undefined;
  DIDCreate: undefined;
  DIDConnect: undefined;
  DIDBackup: undefined;
  NFTGallery: undefined;
  NFTDetail: { tokenId: string };
};

/**
 * 탭 네비게이션 파라미터 목록
 */
export type TabParamList = {
  HomeTab: undefined;
  WalletTab: undefined;
  TransactionsTab: undefined;
  DIDTab: undefined;
  SettingsTab: undefined;
};

/**
 * 메인 스택 네비게이션 타입을 위한 타입 정의
 */
export type MainScreenNavigationProp<T extends keyof MainStackParamList> = StackNavigationProp<
  MainStackParamList,
  T
>;

/**
 * 메인 스택 라우트 타입을 위한 타입 정의
 */
export type MainScreenRouteProp<T extends keyof MainStackParamList> = RouteProp<
  MainStackParamList,
  T
>;

/**
 * 인증 스택 네비게이션 타입을 위한 타입 정의
 */
export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> = StackNavigationProp<
  AuthStackParamList,
  T
>;

/**
 * 인증 스택 라우트 타입을 위한 타입 정의
 */
export type AuthScreenRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

/**
 * 탭 네비게이션 타입을 위한 타입 정의
 */
export type TabScreenNavigationProp<T extends keyof TabParamList> = StackNavigationProp<
  TabParamList,
  T
>;

/**
 * 탭 라우트 타입을 위한 타입 정의
 */
export type TabScreenRouteProp<T extends keyof TabParamList> = RouteProp<
  TabParamList,
  T
>;

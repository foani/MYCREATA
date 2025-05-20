/**
 * 팝업 애플리케이션 라우트 정의
 */

import React from 'react';

// 페이지 임포트
// 인증 관련 페이지
const OnboardingScreen = React.lazy(() => import('./pages/OnboardingScreen'));
const CreateWalletScreen = React.lazy(() => import('./pages/CreateWalletScreen'));
const ImportWalletScreen = React.lazy(() => import('./pages/ImportWalletScreen'));
const RecoveryScreen = React.lazy(() => import('./pages/RecoveryScreen'));
const LoginScreen = React.lazy(() => import('./pages/LoginScreen'));

// 메인 페이지
const WalletScreen = React.lazy(() => import('./pages/WalletScreen'));
const AssetsScreen = React.lazy(() => import('./pages/AssetsScreen'));
const ActivityScreen = React.lazy(() => import('./pages/ActivityScreen'));
const TokenDetailScreen = React.lazy(() => import('./pages/TokenDetailScreen'));
const ImportTokenScreen = React.lazy(() => import('./pages/ImportTokenScreen'));

// 새롭게 구현된 페이지
const SendTransactionScreen = React.lazy(() => import('./pages/SendTransactionScreen'));
const ReceiveScreen = React.lazy(() => import('./pages/ReceiveScreen'));
const SettingsScreen = React.lazy(() => import('./pages/SettingsScreen'));
const NetworksScreen = React.lazy(() => import('./pages/NetworksScreen'));
const AccountsScreen = React.lazy(() => import('./pages/AccountsScreen'));
const AccountDetailsScreen = React.lazy(() => import('./pages/AccountDetailsScreen'));
const ApprovalScreen = React.lazy(() => import('./pages/ApprovalScreen'));
const DIDScreen = React.lazy(() => import('./pages/DIDScreen'));
const BackupScreen = React.lazy(() => import('./pages/BackupScreen'));

// 브릿지 관련 페이지
const BridgePage = React.lazy(() => import('./pages/Bridge/BridgePage'));
const BridgeHistoryPage = React.lazy(() => import('./pages/Bridge/BridgeHistoryPage'));
const BridgeTransactionPage = React.lazy(() => import('./pages/Bridge/BridgeTransactionPage'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse">로딩 중...</div>
  </div>
);

// 각 라우트를 Suspense로 래핑하는 HOC
const withSuspense = (Component: React.ComponentType<any>) => (
  <React.Suspense fallback={<LoadingFallback />}>
    <Component />
  </React.Suspense>
);

// 라우트 그룹 타입 정의
interface RouteItem {
  path: string;
  element: React.ReactNode;
  exact?: boolean;
}

// 인증 관련 라우트
const authRoutes: RouteItem[] = [
  {
    path: '/onboarding',
    element: withSuspense(OnboardingScreen),
  },
  {
    path: '/create-wallet',
    element: withSuspense(CreateWalletScreen),
  },
  {
    path: '/import-wallet',
    element: withSuspense(ImportWalletScreen),
  },
  {
    path: '/recovery',
    element: withSuspense(RecoveryScreen),
  },
  {
    path: '/login',
    element: withSuspense(LoginScreen),
  },
];

// 메인 라우트
const mainRoutes: RouteItem[] = [
  {
    path: '/',
    element: withSuspense(WalletScreen),
  },
  {
    path: '/wallet',
    element: withSuspense(WalletScreen),
  },
  {
    path: '/assets',
    element: withSuspense(AssetsScreen),
  },
  {
    path: '/activity',
    element: withSuspense(ActivityScreen),
  },
  {
    path: '/send',
    element: withSuspense(SendTransactionScreen),
  },
  {
    path: '/receive',
    element: withSuspense(ReceiveScreen),
  },
  {
    path: '/settings',
    element: withSuspense(SettingsScreen),
  },
  {
    path: '/settings/networks',
    element: withSuspense(NetworksScreen),
  },
  {
    path: '/settings/accounts',
    element: withSuspense(AccountsScreen),
  },
  {
    path: '/settings/account-details/:accountId',
    element: withSuspense(AccountDetailsScreen),
  },
  {
    path: '/settings/did',
    element: withSuspense(DIDScreen),
  },
  {
    path: '/settings/did/:accountId',
    element: withSuspense(DIDScreen),
  },
  {
    path: '/settings/backup',
    element: withSuspense(BackupScreen),
  },
  {
    path: '/import-token',
    element: withSuspense(ImportTokenScreen),
  },
  {
    path: '/token/:address',
    element: withSuspense(TokenDetailScreen),
  },
  // 브릿지 관련 라우트 추가
  {
    path: '/bridge',
    element: withSuspense(BridgePage),
  },
  {
    path: '/bridge/history',
    element: withSuspense(BridgeHistoryPage),
  },
  {
    path: '/bridge/transaction/:txId',
    element: withSuspense(BridgeTransactionPage),
  }
];

// 승인 라우트
const approvalRoutes: RouteItem[] = [
  {
    path: '/approval',
    element: withSuspense(ApprovalScreen),
  }
];

// 모든 라우트 내보내기
export const routes = {
  auth: authRoutes,
  main: mainRoutes,
  approval: approvalRoutes,
};
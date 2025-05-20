import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

// 스크린 임포트
import HomeScreen from '../screens/Home/HomeScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import NFTScreen from '../screens/Wallet/NFTScreen';
import TokenDetailScreen from '../screens/Wallet/TokenDetailScreen';
import NFTDetailScreen from '../screens/Wallet/NFTDetailScreen';
import ActivityScreen from '../screens/Activity/ActivityScreen';
import TransactionDetailScreen from '../screens/Activity/TransactionDetailScreen';
import DIDScreen from '../screens/DID/DIDScreen';
import SendScreen from '../screens/Transaction/SendScreen';
import ReceiveScreen from '../screens/Transaction/ReceiveScreen';
import ReviewTransactionScreen from '../screens/Transaction/ReviewTransactionScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import GeneralSettingsScreen from '../screens/Settings/GeneralSettingsScreen';
import SecurityScreen from '../screens/Settings/SecurityScreen';
import NetworksSettingsScreen from '../screens/Settings/NetworksSettingsScreen';
import AddNetworkScreen from '../screens/Settings/AddNetworkScreen';
import EditNetworkScreen from '../screens/Settings/EditNetworkScreen';
import ChangePinScreen from '../screens/Settings/ChangePinScreen';
import BackupWalletScreen from '../screens/Settings/BackupWalletScreen';
import ExportPrivateKeyScreen from '../screens/Settings/ExportPrivateKeyScreen';
import ExportMnemonicScreen from '../screens/Settings/ExportMnemonicScreen';
import AddTokenScreen from '../screens/Wallet/AddTokenScreen';

// 아이콘 컴포넌트
import TabBarIcon from '../components/common/TabBarIcon';

// 메인 스택 파라미터 타입
export type MainStackParamList = {
  Tabs: undefined;
  SendScreen: { tokenAddress?: string; initialAmount?: string };
  ReceiveScreen: undefined;
  ReviewTransaction: {
    to: string;
    amount: string;
    tokenAddress: string;
    gasPrice?: string;
  };
  TokenDetail: { tokenAddress: string };
  NFTDetail: { contractAddress: string; tokenId: string };
  TransactionDetail: { hash: string };
  Settings: undefined;
  GeneralSettings: undefined;
  SecuritySettings: undefined;
  NetworksSettings: undefined;
  AddNetwork: undefined;
  EditNetwork: { chainId: number };
  ChangePin: undefined;
  BackupWallet: undefined;
  ExportPrivateKey: undefined;
  ExportMnemonic: undefined;
  AddToken: undefined;
};

// 탭 파라미터 타입
export type TabStackParamList = {
  Home: undefined;
  Wallet: undefined;
  Activity: undefined;
  DID: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabStackParamList>();

/**
 * 탭 네비게이터 - 메인 기능 화면들
 */
const TabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('common.appName'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: t('wallet.assets'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: t('wallet.activity'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="activity" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DID"
        component={DIDScreen}
        options={{
          tabBarLabel: 'DID',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * 메인 네비게이터 - 인증된 사용자의 모든 화면 포함
 */
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="SendScreen" component={SendScreen} />
      <Stack.Screen name="ReceiveScreen" component={ReceiveScreen} />
      <Stack.Screen
        name="ReviewTransaction"
        component={ReviewTransactionScreen}
      />
      <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
      <Stack.Screen name="NFTDetail" component={NFTDetailScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecurityScreen} />
      <Stack.Screen name="NetworksSettings" component={NetworksSettingsScreen} />
      <Stack.Screen name="AddNetwork" component={AddNetworkScreen} />
      <Stack.Screen name="EditNetwork" component={EditNetworkScreen} />
      <Stack.Screen name="ChangePin" component={ChangePinScreen} />
      <Stack.Screen name="BackupWallet" component={BackupWalletScreen} />
      <Stack.Screen name="ExportPrivateKey" component={ExportPrivateKeyScreen} />
      <Stack.Screen name="ExportMnemonic" component={ExportMnemonicScreen} />
      <Stack.Screen name="AddToken" component={AddTokenScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;

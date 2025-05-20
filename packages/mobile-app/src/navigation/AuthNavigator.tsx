import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import CreateWalletScreen from '../screens/Auth/CreateWalletScreen';
import ImportWalletScreen from '../screens/Auth/ImportWalletScreen';
import SetPinScreen from '../screens/Auth/SetPinScreen';
import MnemonicBackupScreen from '../screens/Auth/MnemonicBackupScreen';
import MnemonicVerifyScreen from '../screens/Auth/MnemonicVerifyScreen';
import PinLoginScreen from '../screens/Auth/PinLoginScreen';
import BiometricLoginScreen from '../screens/Auth/BiometricLoginScreen';
import BiometricSetupScreen from '../screens/Auth/BiometricSetupScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * 인증 네비게이터 - 지갑 생성 및 가져오기, 인증 관련 화면 포함
 */
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="MnemonicBackup" component={MnemonicBackupScreen} />
      <Stack.Screen name="MnemonicVerify" component={MnemonicVerifyScreen} />
      <Stack.Screen name="PinLogin" component={PinLoginScreen} />
      <Stack.Screen name="BiometricLogin" component={BiometricLoginScreen} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

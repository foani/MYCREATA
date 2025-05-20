import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { NetworkProvider } from './contexts/NetworkContext';
import AppNavigator from './navigation/AppNavigator';
import './i18n';

// 불필요한 경고 로그 무시
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

/**
 * 앱의 루트 컴포넌트
 */
const App = () => {
  const systemTheme = useColorScheme();

  // 앱 초기화 로직
  useEffect(() => {
    // 필요한 초기화 작업 수행
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider systemTheme={systemTheme}>
          <AuthProvider>
            <WalletProvider>
              <NetworkProvider>
                <NavigationContainer>
                  <StatusBar barStyle="dark-content" />
                  <AppNavigator />
                </NavigationContainer>
              </NetworkProvider>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

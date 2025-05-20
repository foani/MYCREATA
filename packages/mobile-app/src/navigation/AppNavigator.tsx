import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

// 네비게이션 스택 타입
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 앱 네비게이터 - 인증 상태에 따라 다른 네비게이션 스택 보여줌
 */
const AppNavigator: React.FC = () => {
  const { authState } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {authState === 'initializing' ? (
        // 초기화 중일 때는 스플래시 화면 표시
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : authState === 'authenticated' ? (
        // 인증된 경우 메인 네비게이터로 이동
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // 인증되지 않은 경우 인증 네비게이터로 이동
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

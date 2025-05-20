import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStorage from '../services/SecureStorage';
import BiometricsService from '../services/BiometricsService';
import { BiometryTypes } from 'react-native-biometrics';

// 인증 컨텍스트 타입 정의
interface AuthContextProps {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  pinEnabled: boolean;
  biometricsEnabled: boolean;
  biometryType?: BiometryTypes;
  biometricsSupported: boolean;
  login: (pin: string) => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => void;
  createPin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  updatePin: (oldPin: string, newPin: string) => Promise<boolean>;
  togglePinEnabled: () => void;
  toggleBiometricsEnabled: () => void;
  checkPin: (pin: string) => Promise<boolean>;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isAuthenticating: true,
  pinEnabled: false,
  biometricsEnabled: false,
  biometricsSupported: false,
  login: async () => false,
  loginWithBiometrics: async () => false,
  logout: () => {},
  createPin: async () => false,
  verifyPin: async () => false,
  updatePin: async () => false,
  togglePinEnabled: () => {},
  toggleBiometricsEnabled: () => {},
  checkPin: async () => false,
});

// 암호화 키 상수
const PIN_ENCRYPTION_KEY = 'crelink_pin_key';
const BIOMETRICS_KEY_ID = 'com.crelink.wallet.biometrics';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes | undefined>(undefined);
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // PIN 활성화 상태 확인
        const pinEnabledValue = await AsyncStorage.getItem('pinEnabled');
        const hasPinEnabled = pinEnabledValue === 'true';
        setPinEnabled(hasPinEnabled);

        // 생체인증 지원 여부 확인
        const biometricsResult = await BiometricsService.isSensorAvailable();
        setBiometricsSupported(biometricsResult.success);
        if (biometricsResult.success && biometricsResult.biometryType) {
          setBiometryType(biometricsResult.biometryType);
        }

        // 생체인증 활성화 상태 확인
        const biometricsEnabledValue = await AsyncStorage.getItem('biometricsEnabled');
        const hasBiometricsEnabled = biometricsEnabledValue === 'true' && biometricsResult.success;
        setBiometricsEnabled(hasBiometricsEnabled);

        // 개발 환경에서는 인증 상태를 true로 설정 (실제 앱에서는 제거 필요)
        if (__DEV__) {
          setIsAuthenticated(true);
        }

        setIsAuthenticating(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticating(false);
      }
    };

    initAuth();
  }, []);

  // PIN 생성 함수
  const createPin = async (pin: string): Promise<boolean> => {
    try {
      // PIN 해시화 및 저장
      const hashedPin = await SecureStorage.secureHash(pin);
      await SecureStorage.saveSecureValue('pin', hashedPin);
      
      // PIN 활성화 상태 저장
      await AsyncStorage.setItem('pinEnabled', 'true');
      setPinEnabled(true);
      
      return true;
    } catch (error) {
      console.error('Error creating PIN:', error);
      return false;
    }
  };

  // PIN 확인 함수
  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const storedHashedPin = await SecureStorage.getSecureValue('pin');
      if (!storedHashedPin) return false;
      
      // 입력한 PIN 해시화 후 저장된 해시와 비교
      const hashedPin = await SecureStorage.secureHash(pin);
      return storedHashedPin === hashedPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  // PIN 업데이트 함수
  const updatePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      // 기존 PIN 검증
      const isOldPinValid = await verifyPin(oldPin);
      if (!isOldPinValid) return false;
      
      // 새 PIN 저장
      const hashedNewPin = await SecureStorage.secureHash(newPin);
      await SecureStorage.saveSecureValue('pin', hashedNewPin);
      
      return true;
    } catch (error) {
      console.error('Error updating PIN:', error);
      return false;
    }
  };

  // PIN으로 로그인 함수
  const login = async (pin: string): Promise<boolean> => {
    try {
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        setIsAuthenticated(true);
        
        // 생체인증 키 생성 (활성화된 경우)
        if (biometricsEnabled) {
          await BiometricsService.createKeys(BIOMETRICS_KEY_ID);
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  // 생체인증으로 로그인 함수
  const loginWithBiometrics = async (): Promise<boolean> => {
    try {
      if (!biometricsEnabled || !biometricsSupported) {
        return false;
      }
      
      // 생체인증 프롬프트 표시
      const result = await BiometricsService.simplePrompt('Login to CreLink Wallet');
      
      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during biometric login:', error);
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setIsAuthenticated(false);
  };

  // PIN 활성화 상태 전환 함수
  const togglePinEnabled = async () => {
    try {
      const newState = !pinEnabled;
      await AsyncStorage.setItem('pinEnabled', newState.toString());
      setPinEnabled(newState);
      
      // PIN을 비활성화할 경우 생체인증도 비활성화
      if (!newState && biometricsEnabled) {
        await AsyncStorage.setItem('biometricsEnabled', 'false');
        setBiometricsEnabled(false);
        await BiometricsService.deleteKeys(BIOMETRICS_KEY_ID);
      }
    } catch (error) {
      console.error('Error toggling PIN enabled state:', error);
    }
  };

  // 생체인증 활성화 상태 전환 함수
  const toggleBiometricsEnabled = async () => {
    try {
      const newState = !biometricsEnabled;
      await AsyncStorage.setItem('biometricsEnabled', newState.toString());
      
      // 생체인증 활성화 시 키 생성 또는 삭제
      if (newState) {
        await BiometricsService.createKeys(BIOMETRICS_KEY_ID);
      } else {
        await BiometricsService.deleteKeys(BIOMETRICS_KEY_ID);
      }
      
      setBiometricsEnabled(newState);
    } catch (error) {
      console.error('Error toggling biometrics enabled state:', error);
    }
  };

  // PIN 검증 함수 (다양한 보안 작업에 사용)
  const checkPin = async (pin: string): Promise<boolean> => {
    return await verifyPin(pin);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        pinEnabled,
        biometricsEnabled,
        biometryType,
        biometricsSupported,
        login,
        loginWithBiometrics,
        logout,
        createPin,
        verifyPin,
        updatePin,
        togglePinEnabled,
        toggleBiometricsEnabled,
        checkPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext);

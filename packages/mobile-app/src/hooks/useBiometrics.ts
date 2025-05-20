import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import BiometricsService from '../services/BiometricsService';
import { useAuth } from '../contexts/AuthContext';

/**
 * 생체인증 관련 기능을 제공하는 훅
 * 생체인증의 가용성과 상태를 관리하고, 생체인증 관련 기능을 제공한다.
 */
export const useBiometrics = () => {
  const { t } = useTranslation();
  const { biometricsEnabled, biometricsSupported, biometryType } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(biometricsSupported);
  const [type, setType] = useState(biometryType);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 생체인증 가용성 확인
   */
  const checkAvailability = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const result = await BiometricsService.isSensorAvailable();
      setIsAvailable(result.success);
      if (result.biometryType) {
        setType(result.biometryType);
      }
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * 초기화 - 생체인증 가용성 확인
   */
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  /**
   * 생체인증 프롬프트 표시
   * @param message 사용자에게 표시할 메시지
   * @returns 인증 성공 여부
   */
  const promptBiometrics = useCallback(async (message: string = t('auth.authWithBiometrics')) => {
    if (!isAvailable) {
      setError(t('auth.biometricNotAvailable'));
      return false;
    }

    setIsChecking(true);
    setError(null);
    
    try {
      const result = await BiometricsService.simplePrompt(message);
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isAvailable, t]);

  /**
   * 생체인증으로 데이터 서명
   * @param message 사용자에게 표시할 메시지
   * @param payload 서명할 데이터
   * @param keyId 키 식별자
   * @returns 서명 결과
   */
  const signWithBiometrics = useCallback(
    async (
      message: string,
      payload: string,
      keyId: string = 'com.crelink.wallet.biometrics'
    ) => {
      if (!isAvailable) {
        setError(t('auth.biometricNotAvailable'));
        return { success: false };
      }

      setIsChecking(true);
      setError(null);
      
      try {
        const result = await BiometricsService.promptAndSign(message, payload, keyId);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return { success: false };
      } finally {
        setIsChecking(false);
      }
    },
    [isAvailable, t]
  );

  /**
   * 생체인증 키 생성
   * @param keyId 키 식별자
   * @returns 키 생성 결과
   */
  const createBiometricKeys = useCallback(
    async (keyId: string = 'com.crelink.wallet.biometrics') => {
      if (!isAvailable) {
        setError(t('auth.biometricNotAvailable'));
        return { success: false };
      }

      setIsChecking(true);
      setError(null);
      
      try {
        const result = await BiometricsService.createKeys(keyId);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return { success: false };
      } finally {
        setIsChecking(false);
      }
    },
    [isAvailable, t]
  );

  /**
   * 생체인증 키 삭제
   * @param keyId 키 식별자
   * @returns 키 삭제 결과
   */
  const deleteBiometricKeys = useCallback(
    async (keyId: string = 'com.crelink.wallet.biometrics') => {
      setIsChecking(true);
      setError(null);
      
      try {
        const result = await BiometricsService.deleteKeys(keyId);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return { success: false };
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  /**
   * 생체인증 오류에 대한 알림 표시
   * @param errorMessage 오류 메시지
   */
  const showBiometricError = useCallback((errorMessage: string) => {
    Alert.alert(
      t('auth.biometricError'),
      errorMessage,
      [{ text: t('common.ok') }]
    );
  }, [t]);

  /**
   * 생체인증 유형에 따른 아이콘 이름 반환
   */
  const getBiometricIconName = useCallback(() => {
    if (!type) return 'finger-print';
    
    switch (type) {
      case 'FaceID':
        return 'scan-outline';
      case 'TouchID':
      case 'Biometrics':
      default:
        return 'finger-print';
    }
  }, [type]);

  /**
   * 생체인증 유형 이름 반환
   */
  const getBiometricTypeName = useCallback(() => {
    if (!type) return t('auth.biometrics');
    
    switch (type) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Biometrics':
      default:
        return t('auth.biometrics');
    }
  }, [type, t]);

  return {
    isAvailable,
    isEnabled: biometricsEnabled,
    type,
    typeName: getBiometricTypeName(),
    iconName: getBiometricIconName(),
    isChecking,
    error,
    checkAvailability,
    promptBiometrics,
    signWithBiometrics,
    createBiometricKeys,
    deleteBiometricKeys,
    showBiometricError,
  };
};

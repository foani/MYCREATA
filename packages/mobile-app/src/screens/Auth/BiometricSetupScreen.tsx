import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import BiometricsService from '../../services/BiometricsService';

type BiometricSetupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'BiometricSetup'>;

/**
 * 생체인증 설정 화면
 * 사용자가 지문, 얼굴인식 등 생체인증을 설정할 수 있는 화면
 */
const BiometricSetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<BiometricSetupScreenNavigationProp>();
  const {
    biometricsEnabled,
    biometricsSupported,
    biometryType,
    toggleBiometricsEnabled,
    pinEnabled,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(biometricsEnabled);

  const currentStyles = styles(theme);

  // 생체인증 활성화 상태가 변경될 때 UI 업데이트
  useEffect(() => {
    setIsBiometricEnabled(biometricsEnabled);
  }, [biometricsEnabled]);

  /**
   * 생체인증 활성화 토글 처리
   */
  const handleToggleBiometric = async () => {
    if (!biometricsSupported) {
      Alert.alert(
        t('auth.biometricUnsupported'),
        t('auth.deviceNotSupported'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!pinEnabled) {
      Alert.alert(
        t('auth.pinRequired'),
        t('auth.setPinFirst'),
        [
          { text: t('common.cancel') },
          { 
            text: t('auth.setPin'),
            onPress: () => navigation.navigate('SetPin', { fromBiometricSetup: true })
          }
        ]
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 활성화하려는 경우 생체인증 테스트
      if (!biometricsEnabled) {
        const testResult = await BiometricsService.simplePrompt(
          t('auth.testBiometrics')
        );

        if (!testResult.success) {
          setError(t('auth.biometricTestFailed'));
          setLoading(false);
          return;
        }
      }

      // 생체인증 토글
      await toggleBiometricsEnabled();
      
      // 성공 메시지 표시
      if (!biometricsEnabled) {
        Alert.alert(
          t('auth.biometricEnabled'),
          t('auth.biometricEnabledDesc'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      setError(t('auth.biometricSetupError'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 생체인증 유형 아이콘 반환
   */
  const getBiometricIconName = () => {
    if (!biometryType) return 'finger-print';
    
    switch (biometryType) {
      case 'FaceID':
        return 'scan-outline';
      case 'TouchID':
      case 'Biometrics':
      default:
        return 'finger-print';
    }
  };

  /**
   * 생체인증 유형명 반환
   */
  const getBiometricName = () => {
    if (!biometryType) return t('auth.biometrics');
    
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Biometrics':
      default:
        return t('auth.biometrics');
    }
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <ScrollView contentContainerStyle={currentStyles.scrollContent}>
        <View style={currentStyles.content}>
          <View style={currentStyles.header}>
            <TouchableOpacity
              style={currentStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon 
                name="arrow-back" 
                size={24} 
                color={theme === 'dark' ? colors.white : colors.black} 
              />
            </TouchableOpacity>
            <Text style={currentStyles.headerTitle}>{t('auth.biometricSetup')}</Text>
            <View style={currentStyles.backButton} /> {/* 헤더 균형을 맞추기 위한 더미 뷰 */}
          </View>

          <View style={currentStyles.iconContainer}>
            <Icon 
              name={getBiometricIconName()} 
              size={80} 
              color={colors.primary} 
              style={currentStyles.biometricIcon} 
            />
            <Text style={currentStyles.biometricType}>{getBiometricName()}</Text>
          </View>

          {error && (
            <View style={currentStyles.errorContainer}>
              <Icon name="alert-circle" size={20} color={colors.error} />
              <Text style={currentStyles.errorText}>{error}</Text>
            </View>
          )}

          <View style={currentStyles.infoCard}>
            <Icon name="information-circle-outline" size={22} color={colors.primary} />
            <Text style={currentStyles.infoText}>
              {t('auth.biometricInfo')}
            </Text>
          </View>

          <View style={currentStyles.switchContainer}>
            <Text style={currentStyles.switchLabel}>{
              biometricsEnabled 
                ? t('auth.disableBiometric', { type: getBiometricName() })
                : t('auth.enableBiometric', { type: getBiometricName() })
            }</Text>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={loading || !biometricsSupported}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={isBiometricEnabled ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          {loading && (
            <View style={currentStyles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={currentStyles.loadingText}>{t('auth.processing')}</Text>
            </View>
          )}

          {!biometricsSupported && (
            <View style={currentStyles.warningContainer}>
              <Icon name="warning-outline" size={20} color={colors.warning} />
              <Text style={currentStyles.warningText}>
                {t('auth.biometricNotAvailable')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={currentStyles.pinButton}
            onPress={() => navigation.navigate('SetPin')}
          >
            <Text style={currentStyles.pinButtonText}>
              {pinEnabled ? t('auth.changePin') : t('auth.setupPin')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  biometricIcon: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    padding: 24,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  biometricType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? 'rgba(0,122,255,0.1)' : 'rgba(0,122,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    color: theme === 'dark' ? colors.lightGray : colors.darkGray,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 24,
  },
  loadingText: {
    marginLeft: 8,
    color: theme === 'dark' ? colors.lightGray : colors.darkGray,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,204,0,0.1)' : 'rgba(255,204,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  pinButton: {
    marginTop: 8,
    alignSelf: 'center',
    padding: 12,
  },
  pinButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default BiometricSetupScreen;

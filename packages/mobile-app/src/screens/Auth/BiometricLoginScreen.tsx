import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type BiometricLoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'BiometricLogin'>;

const BiometricLoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<BiometricLoginScreenNavigationProp>();
  const {
    loginWithBiometrics,
    biometricsEnabled,
    biometricsSupported,
    biometryType,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStyles = styles(theme);

  useEffect(() => {
    // 화면이 로드되면 자동으로 생체인증 프롬프트 표시
    if (biometricsEnabled && biometricsSupported) {
      handleBiometricLogin();
    }
  }, []);

  const handleBiometricLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await loginWithBiometrics();
      
      if (!success) {
        setError(t('auth.biometricFailed'));
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      setError(t('auth.biometricError'));
    } finally {
      setLoading(false);
    }
  };

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
      <View style={currentStyles.content}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={currentStyles.logo}
          resizeMode="contain"
        />
        
        <Text style={currentStyles.title}>{t('auth.welcomeBack')}</Text>
        <Text style={currentStyles.subtitle}>{t('auth.unlockWithBiometrics')}</Text>
        
        {error && (
          <View style={currentStyles.errorContainer}>
            <Icon name="alert-circle" size={20} color={colors.error} />
            <Text style={currentStyles.errorText}>{error}</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={currentStyles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={loading || !biometricsEnabled || !biometricsSupported}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : (
            <Icon name={getBiometricIconName()} size={64} color={colors.primary} />
          )}
          <Text style={currentStyles.biometricText}>{
            loading
              ? t('auth.authenticating')
              : t('auth.authWithType', { type: getBiometricName() })
          }</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={currentStyles.pinButton}
          onPress={() => navigation.navigate('PinLogin')}
        >
          <Text style={currentStyles.pinButtonText}>{t('auth.usePin')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    marginBottom: 32,
  },
  biometricText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
    marginTop: 16,
    textAlign: 'center',
  },
  pinButton: {
    padding: 12,
  },
  pinButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default BiometricLoginScreen;

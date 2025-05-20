import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type PinLoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PinLogin'>;

// PIN 입력 길이
const PIN_LENGTH = 6;

const PinLoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<PinLoginScreenNavigationProp>();
  const { login, biometricsEnabled, biometricsSupported } = useAuth();
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 숨겨진 입력 필드에 대한 참조
  const pinInputRef = useRef<TextInput>(null);
  
  const currentStyles = styles(theme);
  
  // 화면이 처음 로드될 때 PIN 입력 필드에 포커스
  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    });

    return focusListener;
  }, [navigation]);

  // PIN 입력 처리
  const handlePinChange = (value: string) => {
    // 숫자만 입력 가능하도록 필터링
    const filteredValue = value.replace(/[^0-9]/g, '');
    
    // 최대 길이 제한
    if (filteredValue.length <= PIN_LENGTH) {
      setPin(filteredValue);
      setError(null);
      
      // PIN이 완성되면 로그인 시도
      if (filteredValue.length === PIN_LENGTH) {
        handleLogin(filteredValue);
      }
    }
  };

  // 로그인 처리
  const handleLogin = async (pinValue: string) => {
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const success = await login(pinValue);
      
      if (!success) {
        setError(t('auth.invalidPin'));
        setPin('');
        pinInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('auth.loginError'));
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // 숫자 패드 항목 렌더링
  const renderNumberPadItem = (number: number | string) => {
    // 왼쪽 하단은 생체인증 버튼, 오른쪽 하단은 삭제 버튼
    if (number === 'biometric') {
      if (!biometricsEnabled || !biometricsSupported) {
        return <View style={currentStyles.numberPadItem} />;
      }
      
      return (
        <TouchableOpacity
          style={currentStyles.numberPadItem}
          onPress={() => navigation.navigate('BiometricLogin')}
        >
          <Icon
            name={Platform.OS === 'ios' ? 'finger-print' : 'finger-print'}
            size={28}
            color={theme === 'dark' ? colors.white : colors.black}
          />
        </TouchableOpacity>
      );
    }
    
    if (number === 'delete') {
      return (
        <TouchableOpacity
          style={currentStyles.numberPadItem}
          onPress={() => setPin(prev => prev.slice(0, -1))}
          disabled={pin.length === 0}
        >
          <Icon
            name="backspace-outline"
            size={28}
            color={
              pin.length === 0
                ? theme === 'dark'
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(0,0,0,0.3)'
                : theme === 'dark'
                ? colors.white
                : colors.black
            }
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        style={currentStyles.numberPadItem}
        onPress={() => handlePinChange(pin + number)}
      >
        <Text style={currentStyles.numberPadText}>{number}</Text>
      </TouchableOpacity>
    );
  };

  // PIN 코드 표시 함수
  const renderPinCode = () => {
    const dots = [];
    
    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            currentStyles.pinDot,
            pin.length > i ? currentStyles.pinDotFilled : null,
            error && pin.length === 0 ? currentStyles.pinDotError : null,
          ]}
        />
      );
    }
    
    return <View style={currentStyles.pinContainer}>{dots}</View>;
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <Text style={currentStyles.title}>{t('auth.enterPin')}</Text>
        <Text style={currentStyles.subtitle}>{t('auth.enterPinDescription')}</Text>
      </View>
      
      {error && (
        <View style={currentStyles.errorContainer}>
          <Icon name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={currentStyles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* 숨겨진 PIN 입력 필드 */}
      <TextInput
        ref={pinInputRef}
        style={{ position: 'absolute', opacity: 0 }}
        value={pin}
        onChangeText={handlePinChange}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        autoFocus
      />
      
      {/* PIN 코드 표시 */}
      {renderPinCode()}
      
      {/* 로딩 인디케이터 */}
      {loading && (
        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {/* 숫자 패드 */}
      <View style={currentStyles.numberPadContainer}>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(1)}
          {renderNumberPadItem(2)}
          {renderNumberPadItem(3)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(4)}
          {renderNumberPadItem(5)}
          {renderNumberPadItem(6)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem(7)}
          {renderNumberPadItem(8)}
          {renderNumberPadItem(9)}
        </View>
        <View style={currentStyles.numberPadRow}>
          {renderNumberPadItem('biometric')}
          {renderNumberPadItem(0)}
          {renderNumberPadItem('delete')}
        </View>
      </View>
      
      <TouchableOpacity
        style={currentStyles.forgotPinButton}
        onPress={() => Alert.alert(t('auth.forgotPin'), t('auth.forgotPinMessage'))}
      >
        <Text style={currentStyles.forgotPinText}>{t('auth.forgotPin')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
    padding: 12,
    marginHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.lightGray : colors.gray,
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinDotError: {
    borderColor: colors.error,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  numberPadContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 'auto',
  },
  numberPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numberPadItem: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
  },
  numberPadText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  forgotPinButton: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  forgotPinText: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default PinLoginScreen;
